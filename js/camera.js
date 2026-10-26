// camera.js - camera access + color extraction (independent of matching.js)

// ---------- color helpers ----------

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const toHex = (r, g, b) =>
  '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

// sRGB (0-255) -> linear lookup table
const LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// D65 white point
const XN = 0.95047, YN = 1.0, ZN = 1.08883;
const labF = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const labFInv = (t) => (t * t * t > 216 / 24389 ? t * t * t : (116 * t - 16) / (24389 / 27));

/** RGB (0-255) -> [L, a, b] */
export function rgbToLab(r, g, b) {
  const lr = LIN[r | 0], lg = LIN[g | 0], lb = LIN[b | 0];
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / XN;
  const y = (0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb) / YN;
  const z = (0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb) / ZN;
  const fx = labF(x), fy = labF(y), fz = labF(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** Lab -> [r, g, b] (0-255, clamped) */
export function labToRgb(L, a, b) {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const x = labFInv(fx) * XN, y = labFInv(fy) * YN, z = labFInv(fz) * ZN;
  const lr = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const lg = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
  const lb = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
  const enc = (c) => {
    c = clamp(c, 0, 1);
    return clamp(Math.round((c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255), 0, 255);
  };
  return [enc(lr), enc(lg), enc(lb)];
}

function deltaE(p, q) {
  const dl = p[0] - q[0], da = p[1] - q[1], db = p[2] - q[2];
  return Math.sqrt(dl * dl + da * da + db * db);
}

// Deterministic PRNG
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function median(arr) {
  if (!arr.length) return 0;
  const s = Float32Array.from(arr).sort();
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ---------- pixel clustering ----------

/**
 * Collect Lab pixels from ImageData. Optional circular mask (radius as ratio of
 * min side, centered). Ignores near-transparent pixels. Subsamples to <= maxPx.
 */
function collectLab(imageData, radiusRatio = null, maxPx = 4000) {
  const { data, width, height } = imageData;
  const cx = width / 2, cy = height / 2;
  const rad = radiusRatio == null ? Infinity : Math.max(1, radiusRatio * Math.min(width, height));
  const r2 = rad * rad;
  const x0 = radiusRatio == null ? 0 : Math.max(0, Math.floor(cx - rad));
  const x1 = radiusRatio == null ? width : Math.min(width, Math.ceil(cx + rad));
  const y0 = radiusRatio == null ? 0 : Math.max(0, Math.floor(cy - rad));
  const y1 = radiusRatio == null ? height : Math.min(height, Math.ceil(cy + rad));
  const area = (x1 - x0) * (y1 - y0);
  const step = Math.max(1, Math.floor(Math.sqrt(area / maxPx)));
  const out = [];
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      if (radiusRatio != null) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        if (dx * dx + dy * dy > r2) continue;
      }
      const i = (y * width + x) * 4;
      if (data[i + 3] < 128) continue;
      out.push(rgbToLab(data[i], data[i + 1], data[i + 2]));
    }
  }
  return out;
}

/** k-means (k-means++ init, fixed seed) in Lab. Returns [{lab, count}] */
function kmeansLab(pts, k, iters = 10) {
  const n = pts.length;
  if (!n) return [];
  k = Math.max(1, Math.min(k, n));
  const rnd = mulberry32(1337);
  // k-means++ init
  const cents = [pts[Math.floor(rnd() * n)].slice()];
  const d2 = new Float64Array(n).fill(Infinity);
  while (cents.length < k) {
    const c = cents[cents.length - 1];
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const d = deltaE(pts[i], c);
      if (d * d < d2[i]) d2[i] = d * d;
      sum += d2[i];
    }
    if (sum <= 0) break; // all points identical to existing centroids
    let target = rnd() * sum, idx = n - 1;
    for (let i = 0; i < n; i++) {
      target -= d2[i];
      if (target <= 0) { idx = i; break; }
    }
    cents.push(pts[idx].slice());
  }
  const kk = cents.length;
  const assign = new Int32Array(n);
  for (let it = 0; it < iters; it++) {
    let changed = false;
    const sums = cents.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < n; i++) {
      let best = 0, bd = Infinity;
      for (let c = 0; c < kk; c++) {
        const d = deltaE(pts[i], cents[c]);
        if (d < bd) { bd = d; best = c; }
      }
      if (assign[i] !== best || it === 0) changed = changed || assign[i] !== best;
      assign[i] = best;
      const s = sums[best];
      s[0] += pts[i][0]; s[1] += pts[i][1]; s[2] += pts[i][2]; s[3]++;
    }
    for (let c = 0; c < kk; c++) {
      if (sums[c][3]) cents[c] = [sums[c][0] / sums[c][3], sums[c][1] / sums[c][3], sums[c][2] / sums[c][3]];
    }
    if (!changed && it > 0) break;
  }
  // Representative = per-channel median of members (robust against shading outliers)
  const members = cents.map(() => [[], [], []]);
  for (let i = 0; i < n; i++) {
    const m = members[assign[i]];
    m[0].push(pts[i][0]); m[1].push(pts[i][1]); m[2].push(pts[i][2]);
  }
  const clusters = [];
  for (let c = 0; c < kk; c++) {
    const cnt = members[c][0].length;
    if (!cnt) continue;
    clusters.push({ lab: [median(members[c][0]), median(members[c][1]), median(members[c][2])], count: cnt });
  }
  return clusters;
}

/** Merge clusters closer than `thr` deltaE (weighted by count). */
function mergeClusters(clusters, thr = 8) {
  const cl = clusters.map((c) => ({ lab: c.lab.slice(), count: c.count }));
  let merged = true;
  while (merged && cl.length > 1) {
    merged = false;
    let bi = -1, bj = -1, bd = thr;
    for (let i = 0; i < cl.length; i++) {
      for (let j = i + 1; j < cl.length; j++) {
        const d = deltaE(cl[i].lab, cl[j].lab);
        if (d < bd) { bd = d; bi = i; bj = j; }
      }
    }
    if (bi >= 0) {
      const a = cl[bi], b = cl[bj], t = a.count + b.count;
      // Keep the bigger cluster's representative dominant in the blend
      a.lab = [0, 1, 2].map((q) => (a.lab[q] * a.count + b.lab[q] * b.count) / t);
      a.count = t;
      cl.splice(bj, 1);
      merged = true;
    }
  }
  return cl;
}

function clustersToResult(clusters) {
  const total = clusters.reduce((s, c) => s + c.count, 0) || 1;
  return clusters
    .slice()
    .sort((a, b) => b.count - a.count)
    .map((c) => {
      const [r, g, b] = labToRgb(c.lab[0], c.lab[1], c.lab[2]);
      return { hex: toHex(r, g, b), ratio: c.count / total };
    });
}

/** Dominant colors of an image: k-means in Lab, merged by deltaE < 8. */
export function extractDominantColors(imageData, k = 4) {
  const pts = collectLab(imageData, null, 4000);
  return clustersToResult(mergeClusters(kmeansLab(pts, k, 10), 8));
}

/** Dominant color of the central circular region (the garment). */
export function extractCenterColor(imageData, radiusRatio = 0.25) {
  const pts = collectLab(imageData, radiusRatio, 4000);
  if (!pts.length) return { hex: '#808080', ratio: 0 };
  const res = clustersToResult(mergeClusters(kmeansLab(pts, 3, 10), 8));
  return res[0];
}

// ---------- camera ----------

let currentStream = null;
let currentFacing = 'environment';
let currentVideo = null;
let sampleCanvas = null;
let sampleCtx = null;
let frameCanvas = null;
let frameCtx = null;

export function isCameraSupported() {
  return !!(typeof navigator !== 'undefined' && navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    (typeof window === 'undefined' || window.isSecureContext !== false));
}

function cameraError(code, err) {
  const e = new Error((err && err.message) || code);
  e.code = code;
  e.cause = err;
  return e;
}

function mapError(err) {
  const n = err && err.name;
  if (n === 'NotAllowedError' || n === 'SecurityError' || n === 'PermissionDeniedError') return cameraError('denied', err);
  if (n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'DevicesNotFoundError') return cameraError('notfound', err);
  return cameraError('unknown', err);
}

export async function startCamera(videoEl, { facingMode = 'environment' } = {}) {
  if (!isCameraSupported()) throw cameraError('unsupported');
  stopCamera();
  const base = { width: { ideal: 1280 }, height: { ideal: 720 } };
  let stream;
  try {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { ...base, facingMode: { ideal: facingMode } } });
    } catch (err) {
      // Retry with plain constraints if the facing mode/resolution cannot be met
      if (err && err.name === 'OverconstrainedError') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      } else throw err;
    }
    videoEl.playsInline = true;
    videoEl.setAttribute('playsinline', '');
    videoEl.muted = true;
    videoEl.autoplay = true;
    videoEl.srcObject = stream;
    await videoEl.play();
  } catch (err) {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    throw mapError(err);
  }
  currentStream = stream;
  currentFacing = facingMode;
  currentVideo = videoEl;
  return stream;
}

export function stopCamera() {
  if (currentStream) currentStream.getTracks().forEach((t) => t.stop());
  if (currentVideo) {
    try { currentVideo.srcObject = null; } catch (_) { /* ignore */ }
  }
  currentStream = null;
}

export async function switchCamera(videoEl) {
  const next = currentFacing === 'environment' ? 'user' : 'environment';
  return startCamera(videoEl || currentVideo, { facingMode: next });
}

function videoTrack() {
  return currentStream && currentStream.getVideoTracks()[0];
}

export function hasTorch() {
  const tr = videoTrack();
  try {
    return !!(tr && tr.getCapabilities && tr.getCapabilities().torch);
  } catch (_) {
    return false;
  }
}

export async function setTorch(on) {
  if (!hasTorch()) return false;
  try {
    await videoTrack().applyConstraints({ advanced: [{ torch: !!on }] });
    return !!on;
  } catch (_) {
    return false;
  }
}

// ---------- sampling ----------

const SAMPLE_SIZE = 24;

/** Robust color of the video center (median, ignoring very dark/blown-out pixels). */
export function sampleCenter(videoEl, radiusRatio = 0.08) {
  const vw = videoEl.videoWidth, vh = videoEl.videoHeight;
  if (!vw || !vh) return null;
  if (!sampleCanvas) {
    sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = sampleCanvas.height = SAMPLE_SIZE;
    sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  }
  // Square crop around the center, draw downscaled
  const side = Math.max(4, Math.min(vw, vh) * radiusRatio * 2);
  sampleCtx.drawImage(videoEl, (vw - side) / 2, (vh - side) / 2, side, side, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const img = sampleCtx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  return medianColorOfCircle(img);
}

/** Median RGB inside the inscribed circle; falls back to all pixels if filtered out. */
function medianColorOfCircle(img) {
  const { data, width, height } = img;
  const c = (width - 1) / 2, r = width / 2;
  const R = [], G = [], B = [], aR = [], aG = [], aB = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - c, dy = y - (height - 1) / 2;
      if (dx * dx + dy * dy > r * r) continue;
      const i = (y * width + x) * 4;
      const rr = data[i], gg = data[i + 1], bb = data[i + 2];
      aR.push(rr); aG.push(gg); aB.push(bb);
      const lum = 0.299 * rr + 0.587 * gg + 0.114 * bb;
      if (lum < 20 || (rr > 245 && gg > 245 && bb > 245)) continue;
      R.push(rr); G.push(gg); B.push(bb);
    }
  }
  // Use filtered set only if enough pixels remain
  const useAll = R.length < aR.length * 0.25;
  const rgb = useAll
    ? [median(aR), median(aG), median(aB)]
    : [median(R), median(G), median(B)];
  const rounded = rgb.map((v) => clamp(Math.round(v), 0, 255));
  return { hex: toHex(rounded[0], rounded[1], rounded[2]), rgb: { r: rounded[0], g: rounded[1], b: rounded[2] } };
}

/** Grab the current frame downscaled to max 320px as ImageData. */
export function captureFrame(videoEl) {
  const vw = videoEl.videoWidth, vh = videoEl.videoHeight;
  if (!vw || !vh) return null;
  const scale = Math.min(1, 320 / Math.max(vw, vh));
  const w = Math.max(1, Math.round(vw * scale)), h = Math.max(1, Math.round(vh * scale));
  if (!frameCanvas) {
    frameCanvas = document.createElement('canvas');
    frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true });
  }
  frameCanvas.width = w;
  frameCanvas.height = h;
  frameCtx.drawImage(videoEl, 0, 0, w, h);
  return frameCtx.getImageData(0, 0, w, h);
}

/** Load an image file (upload fallback) into downscaled ImageData. */
export async function imageFileToImageData(file, maxSize = 320) {
  let source, w, h, cleanup = () => {};
  if (typeof createImageBitmap === 'function') {
    try {
      source = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (_) {
      try { source = await createImageBitmap(file); } catch (__) { source = null; }
    }
    if (source) {
      w = source.width; h = source.height;
      cleanup = () => source.close && source.close();
    }
  }
  if (!source) {
    // Fallback: <img> via object URL (browsers apply EXIF orientation by default)
    const url = URL.createObjectURL(file);
    try {
      source = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
    w = source.naturalWidth; h = source.naturalHeight;
  }
  const scale = Math.min(1, maxSize / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, cw, ch);
  cleanup();
  return ctx.getImageData(0, 0, cw, ch);
}
