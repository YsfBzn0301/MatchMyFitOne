// MatchMyFit - color + clothing data and matching logic (pure, no DOM)

/* ---------- Data ---------- */

export const COLORS = [
  // neutrals
  { id: 'black', hex: '#111111', family: 'gray', neutral: true },
  { id: 'white', hex: '#fafafa', family: 'gray', neutral: true },
  { id: 'gray', hex: '#8a8d91', family: 'gray', neutral: true },
  { id: 'charcoal', hex: '#36393f', family: 'gray', neutral: true },
  { id: 'beige', hex: '#d9c7a6', family: 'brown', neutral: true },
  { id: 'cream', hex: '#f5ecd5', family: 'brown', neutral: true },
  { id: 'camel', hex: '#c19a6b', family: 'brown', neutral: true },
  { id: 'brown', hex: '#6b4423', family: 'brown', neutral: true },
  { id: 'khaki', hex: '#b8a975', family: 'brown', neutral: true },
  { id: 'navy', hex: '#1f2a44', family: 'blue', neutral: true },
  { id: 'denim', hex: '#3b5b8c', family: 'blue', neutral: true },
  { id: 'olive', hex: '#6b6e2f', family: 'green', neutral: true },
  // colors
  { id: 'red', hex: '#d32f2f', family: 'red', neutral: false },
  { id: 'burgundy', hex: '#6d1a2b', family: 'red', neutral: false },
  { id: 'pink', hex: '#ec6fa0', family: 'pink', neutral: false },
  { id: 'blush', hex: '#f4c2c2', family: 'pink', neutral: false },
  { id: 'coral', hex: '#ff7f6e', family: 'orange', neutral: false },
  { id: 'orange', hex: '#f57c00', family: 'orange', neutral: false },
  { id: 'rust', hex: '#b7410e', family: 'orange', neutral: false },
  { id: 'mustard', hex: '#d4a017', family: 'yellow', neutral: false },
  { id: 'yellow', hex: '#f6d83b', family: 'yellow', neutral: false },
  { id: 'green', hex: '#2e9e4f', family: 'green', neutral: false },
  { id: 'mint', hex: '#a8e6cf', family: 'green', neutral: false },
  { id: 'emerald', hex: '#0b7a54', family: 'green', neutral: false },
  { id: 'teal', hex: '#158c8c', family: 'blue', neutral: false },
  { id: 'lightblue', hex: '#8ec5ea', family: 'blue', neutral: false },
  { id: 'blue', hex: '#1e6fd9', family: 'blue', neutral: false },
  { id: 'cobalt', hex: '#0047ab', family: 'blue', neutral: false },
  { id: 'purple', hex: '#7b3fa0', family: 'purple', neutral: false },
  { id: 'lavender', hex: '#c3b1e1', family: 'purple', neutral: false },
];

export const STYLES = ['casual', 'business', 'formal', 'sporty', 'streetwear', 'elegant'];
export const CATEGORIES = ['top', 'bottom', 'onepiece', 'outerwear', 'shoes', 'accessory'];
export const HARMONY_TYPES = ['monochrome', 'complementary', 'analogous', 'triadic', 'neutral', 'clash'];

export const ITEMS = [
  { id: 'tshirt', category: 'top', styles: ['casual', 'sporty', 'streetwear'], formality: 1, icon: '👕' },
  { id: 'shirt', category: 'top', styles: ['casual', 'business', 'formal', 'elegant'], formality: 3, icon: '👔' },
  { id: 'blouse', category: 'top', styles: ['business', 'elegant', 'formal', 'casual'], formality: 3, icon: '👚' },
  { id: 'polo', category: 'top', styles: ['casual', 'business', 'sporty'], formality: 2, icon: '🎽' },
  { id: 'hoodie', category: 'top', styles: ['casual', 'streetwear', 'sporty'], formality: 1, icon: '🧥' },
  { id: 'sweater', category: 'top', styles: ['casual', 'business', 'elegant'], formality: 2, icon: '🧶' },
  { id: 'turtleneck', category: 'top', styles: ['casual', 'business', 'elegant'], formality: 3, icon: '🧣' },
  { id: 'tanktop', category: 'top', styles: ['casual', 'sporty', 'streetwear'], formality: 1, icon: '🩱' },
  { id: 'jeans', category: 'bottom', styles: ['casual', 'streetwear'], formality: 2, icon: '👖' },
  { id: 'chinos', category: 'bottom', styles: ['casual', 'business'], formality: 3, icon: '🪢' },
  { id: 'suitpants', category: 'bottom', styles: ['business', 'formal', 'elegant'], formality: 5, icon: '📏' },
  { id: 'joggers', category: 'bottom', styles: ['sporty', 'casual', 'streetwear'], formality: 1, icon: '🏃' },
  { id: 'shorts', category: 'bottom', styles: ['casual', 'sporty', 'streetwear'], formality: 1, icon: '🩳' },
  { id: 'skirt', category: 'bottom', styles: ['casual', 'elegant', 'business'], formality: 3, icon: '💃' },
  { id: 'cargo', category: 'bottom', styles: ['streetwear', 'casual'], formality: 2, icon: '🎒' },
  { id: 'leggings', category: 'bottom', styles: ['sporty', 'casual'], formality: 1, icon: '🧘' },
  { id: 'dress', category: 'onepiece', styles: ['casual', 'elegant', 'formal'], formality: 3, icon: '👗' },
  { id: 'jumpsuit', category: 'onepiece', styles: ['elegant', 'casual', 'streetwear'], formality: 3, icon: '🥼' },
  { id: 'suit', category: 'onepiece', styles: ['business', 'formal', 'elegant'], formality: 5, icon: '🕴️' },
  { id: 'blazer', category: 'outerwear', styles: ['business', 'formal', 'elegant', 'casual'], formality: 4, icon: '🤵' },
  { id: 'leatherjacket', category: 'outerwear', styles: ['streetwear', 'casual'], formality: 2, icon: '🏍️' },
  { id: 'denimjacket', category: 'outerwear', styles: ['casual', 'streetwear'], formality: 2, icon: '🧢' },
  { id: 'coat', category: 'outerwear', styles: ['business', 'elegant', 'formal', 'casual'], formality: 4, icon: '🧥' },
  { id: 'parka', category: 'outerwear', styles: ['casual', 'sporty', 'streetwear'], formality: 2, icon: '❄️' },
  { id: 'bomber', category: 'outerwear', styles: ['streetwear', 'casual', 'sporty'], formality: 2, icon: '✈️' },
  { id: 'cardigan', category: 'outerwear', styles: ['casual', 'business', 'elegant'], formality: 3, icon: '🍂' },
  { id: 'sneakers', category: 'shoes', styles: ['casual', 'streetwear', 'sporty'], formality: 2, icon: '👟' },
  { id: 'loafers', category: 'shoes', styles: ['business', 'casual', 'elegant'], formality: 4, icon: '🥿' },
  { id: 'oxfords', category: 'shoes', styles: ['formal', 'business', 'elegant'], formality: 5, icon: '👞' },
  { id: 'boots', category: 'shoes', styles: ['casual', 'streetwear'], formality: 3, icon: '🥾' },
  { id: 'chelsea', category: 'shoes', styles: ['business', 'casual', 'elegant', 'streetwear'], formality: 4, icon: '🤠' },
  { id: 'heels', category: 'shoes', styles: ['elegant', 'formal'], formality: 4, icon: '👠' },
  { id: 'sandals', category: 'shoes', styles: ['casual'], formality: 1, icon: '🩴' },
  { id: 'runners', category: 'shoes', styles: ['sporty'], formality: 1, icon: '🏅' },
  { id: 'belt', category: 'accessory', styles: ['business', 'casual', 'formal'], formality: 3, icon: '🔗' },
  { id: 'cap', category: 'accessory', styles: ['casual', 'sporty', 'streetwear'], formality: 1, icon: '🧢' },
  { id: 'scarf', category: 'accessory', styles: ['casual', 'elegant', 'business'], formality: 3, icon: '🧣' },
  { id: 'watch', category: 'accessory', styles: ['business', 'formal', 'elegant', 'casual', 'sporty'], formality: 3, icon: '⌚' },
  { id: 'tie', category: 'accessory', styles: ['formal', 'business'], formality: 5, icon: '👔' },
  { id: 'bag', category: 'accessory', styles: ['casual', 'business', 'elegant'], formality: 3, icon: '👜' },
];

/* ---------- Color conversion ---------- */

export function hexToRgb(hex) {
  let h = String(hex || '').trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  if (!/^[0-9a-f]{6}$/i.test(h.slice(0, 6)) || Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(Number(v) || 0))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d > 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hexToLab(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lin = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = lin(r), G = lin(g), B = lin(b);
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/* ---------- Lookups ---------- */

const COLOR_MAP = new Map(COLORS.map((c) => [c.id, { ...c, hsl: hexToHsl(c.hex), lab: hexToLab(c.hex) }]));
const ITEM_MAP = new Map(ITEMS.map((i) => [i.id, i]));

export function getColor(id) {
  const c = COLOR_MAP.get(id);
  return c ? COLORS.find((x) => x.id === id) : undefined;
}
export function getItem(id) {
  return ITEM_MAP.get(id);
}

export function nearestColor(hex) {
  const lab = hexToLab(hex);
  let best = null, bestD = Infinity;
  for (const c of COLORS) {
    const l2 = COLOR_MAP.get(c.id).lab;
    const d = Math.hypot(lab[0] - l2[0], lab[1] - l2[1], lab[2] - l2[2]); // deltaE76
    if (d < bestD) { bestD = d; best = c; }
  }
  return { color: best, distance: bestD };
}

/* ---------- Color harmony ---------- */

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const pairKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);

// Scores for neutral+neutral pairs (fashion knowledge); others use defaults
const NEUTRAL_PAIRS = new Map(Object.entries({
  'black|white': 95, 'black|brown': 50, 'black|navy': 60, 'black|olive': 66, 'black|khaki': 74,
  'beige|black': 88, 'black|cream': 90, 'black|camel': 86, 'black|denim': 82, 'black|gray': 82,
  'black|charcoal': 62, 'navy|white': 96, 'beige|navy': 92, 'cream|navy': 93, 'camel|navy': 94,
  'khaki|navy': 90, 'brown|navy': 74, 'gray|navy': 84, 'charcoal|navy': 64, 'denim|navy': 66,
  'navy|olive': 58, 'beige|brown': 90, 'brown|cream': 92, 'brown|camel': 80, 'brown|khaki': 78,
  'brown|olive': 72, 'brown|denim': 84, 'brown|gray': 70, 'brown|charcoal': 62, 'khaki|olive': 74,
  'beige|olive': 86, 'cream|olive': 88, 'denim|olive': 80, 'gray|olive': 70, 'charcoal|olive': 70,
  'denim|white': 95, 'cream|denim': 92, 'beige|denim': 86, 'camel|denim': 90, 'denim|khaki': 84,
  'denim|gray': 80, 'charcoal|denim': 76, 'camel|cream': 90, 'beige|camel': 70, 'camel|khaki': 66,
  'camel|gray': 78, 'camel|charcoal': 88, 'gray|white': 90, 'cream|gray': 80, 'beige|gray': 72,
  'charcoal|white': 92, 'gray|charcoal': 70, 'cream|white': 70, 'beige|cream': 74, 'khaki|white': 90,
  'cream|khaki': 86, 'beige|khaki': 76, 'khaki|gray': 70, 'camel|white': 90, 'beige|white': 88,
  'olive|white': 90, 'brown|white': 88, 'charcoal|khaki': 80,
}));

const CLASH_PAIRS = new Set(['red|pink', 'orange|pink', 'pink|rust', 'green|red', 'emerald|red', 'coral|green', 'coral|red', 'orange|red']);
const SAFE_NEUTRALS = ['white', 'black', 'gray', 'charcoal', 'navy', 'denim', 'cream', 'beige'];

function pairInfo(idA, idB) {
  const A = COLOR_MAP.get(idA), B = COLOR_MAP.get(idB);
  if (!A || !B) return { score: 0, type: 'clash' };
  const a = A.hsl, b = B.hsl;
  const dl = Math.abs(a.l - b.l);

  if (idA === idB) {
    let s = A.neutral ? 80 : 76;
    if (!A.neutral && a.s >= 65 && a.l >= 30 && a.l <= 68) s -= 8;
    return { score: s, type: 'monochrome' };
  }

  if (A.neutral && B.neutral) {
    const key = pairKey(idA, idB);
    const same = A.family === B.family;
    let s = NEUTRAL_PAIRS.get(key);
    if (s === undefined) s = same ? (dl >= 15 ? 80 : 62) : dl < 10 ? 64 : 80;
    return { score: s, type: s < 45 ? 'clash' : same ? 'monochrome' : 'neutral' };
  }

  if (A.neutral || B.neutral) {
    const n = A.neutral ? A : B, c = A.neutral ? B : A;
    let s = SAFE_NEUTRALS.includes(n.id) ? 90 : 84;
    const diff = Math.abs(n.hsl.l - c.hsl.l);
    if (diff < (n.id === 'white' || n.id === 'cream' ? 8 : 12)) s -= 12; // low contrast
    if ((n.id === 'olive' || n.id === 'khaki') && (c.id === 'pink' || c.id === 'purple')) s -= 6;
    return { score: clamp(s), type: 'neutral' };
  }

  // both chromatic
  const d = hueDist(a.h, b.h);
  const sMin = Math.min(a.s, b.s);
  const pastel = a.l >= 72 && b.l >= 72;
  const soft = a.l >= 78 || b.l >= 78;
  const loud = (x) => x.s >= 65 && x.l >= 30 && x.l <= 68;
  let type, score;

  if (CLASH_PAIRS.has(pairKey(idA, idB))) {
    type = 'clash'; score = 28;
  } else if (d <= 14) {
    type = 'monochrome';
    score = dl >= 18 ? 82 + Math.min(10, (dl - 18) / 4) : 60;
  } else if (pastel && d <= 100) {
    type = 'analogous'; score = 76;
  } else if (d <= 30 && sMin >= 45 && dl < 35 && !soft) {
    type = 'clash'; score = 30; // near but not analogous
  } else if (d <= 70) {
    type = 'analogous'; score = 76 + (dl >= 15 ? 6 : 0);
  } else if (d >= 150) {
    type = 'complementary'; score = 80 + (dl >= 20 ? 5 : 0) + (d >= 168 ? 3 : 0);
  } else if (d >= 100) {
    type = 'triadic'; score = 70 + (dl >= 15 ? 3 : 0);
  } else {
    type = 'clash'; score = 36;
  }

  if (type !== 'monochrome') {
    if (loud(a) && loud(b)) score -= type === 'complementary' ? 6 : 14; // two loud colors fight
    else if (a.s >= 80 && b.s >= 80) score -= 6;
    if (a.l < 30 && b.l < 30) score -= 6;
    if (pastel && type !== 'clash') score += 4;
  }
  return { score: Math.round(clamp(score)), type };
}

export function colorPairScore(idA, idB) {
  return pairInfo(idA, idB);
}

export function colorMatches(colorId) {
  const base = COLOR_MAP.get(colorId);
  const out = { monochrome: [], complementary: [], analogous: [], triadic: [], neutral: [], avoid: [] };
  if (!base) return out;
  const rows = [];
  for (const c of COLORS) {
    if (c.id === colorId) continue;
    const info = pairInfo(colorId, c.id);
    rows.push({ id: c.id, c: COLOR_MAP.get(c.id), ...info });
  }
  rows.sort((x, y) => y.score - x.score);
  for (const r of rows) {
    if (r.score < 55) { out.avoid.push(r.id); continue; }
    if (base.neutral) {
      if (r.c.neutral) {
        if (r.type === 'monochrome' && r.score >= 60) out.monochrome.push(r.id);
        else if (r.score >= 65) out.neutral.push(r.id);
      } else if (r.score >= 60) {
        // chromatic partners of a neutral: bold accents / soft tones / deep tones
        const { s, l } = r.c.hsl;
        if (l >= 70) out.analogous.push(r.id);
        else if (s >= 60 && l >= 30 && l <= 68) out.complementary.push(r.id);
        else out.triadic.push(r.id);
      }
    } else if (r.c.neutral) {
      if (r.score >= 70) out.neutral.push(r.id);
    } else if (r.score >= 60 && out[r.type]) {
      out[r.type].push(r.id);
    }
  }
  return out;
}

/* ---------- Clothing matching ---------- */

// Explicit fashion rules: [a, b, score, reason]
const RULE_LIST = [
  ['tshirt', 'jeans', 92, 'classicCombo'], ['tshirt', 'chinos', 82, 'classicCombo'], ['tshirt', 'shorts', 88, 'styleMatch'],
  ['shirt', 'jeans', 88, 'classicCombo'], ['shirt', 'chinos', 94, 'classicCombo'], ['shirt', 'suitpants', 95, 'classicCombo'],
  ['blouse', 'suitpants', 94, 'classicCombo'], ['blouse', 'skirt', 92, 'classicCombo'], ['blouse', 'jeans', 84, 'styleMatch'],
  ['polo', 'chinos', 94, 'classicCombo'], ['polo', 'shorts', 85, 'styleMatch'],
  ['sweater', 'jeans', 90, 'classicCombo'], ['sweater', 'chinos', 92, 'classicCombo'],
  ['turtleneck', 'suitpants', 92, 'classicCombo'], ['turtleneck', 'jeans', 86, 'styleMatch'], ['turtleneck', 'skirt', 90, 'styleMatch'],
  ['hoodie', 'jeans', 88, 'classicCombo'], ['hoodie', 'joggers', 94, 'styleMatch'], ['hoodie', 'cargo', 92, 'styleMatch'],
  ['hoodie', 'suitpants', 18, 'formalityGap'], ['hoodie', 'skirt', 55, 'formalityGap'],
  ['tanktop', 'shorts', 88, 'styleMatch'], ['tanktop', 'leggings', 90, 'styleMatch'], ['tanktop', 'suitpants', 25, 'formalityGap'],
  ['tshirt', 'suitpants', 32, 'formalityGap'], ['tshirt', 'skirt', 78, 'styleMatch'],
  // outerwear
  ['blazer', 'jeans', 88, 'smartCasual'], ['blazer', 'chinos', 94, 'classicCombo'], ['blazer', 'suitpants', 90, 'classicCombo'],
  ['blazer', 'joggers', 35, 'formalityGap'], ['blazer', 'shorts', 30, 'formalityGap'], ['blazer', 'tshirt', 85, 'smartCasual'],
  ['blazer', 'hoodie', 45, 'formalityGap'], ['blazer', 'shirt', 94, 'classicCombo'], ['blazer', 'dress', 85, 'styleMatch'],
  ['blazer', 'jumpsuit', 85, 'styleMatch'], ['blazer', 'skirt', 88, 'styleMatch'], ['blazer', 'leggings', 50, 'formalityGap'],
  ['blazer', 'cargo', 40, 'formalityGap'],
  ['leatherjacket', 'jeans', 94, 'classicCombo'], ['leatherjacket', 'tshirt', 94, 'classicCombo'], ['leatherjacket', 'dress', 88, 'styleMatch'],
  ['leatherjacket', 'suitpants', 40, 'formalityGap'], ['leatherjacket', 'shirt', 70, 'styleMatch'],
  ['denimjacket', 'jeans', 50, 'badCombo'], ['denimjacket', 'dress', 84, 'styleMatch'], ['denimjacket', 'tshirt', 90, 'classicCombo'],
  ['coat', 'suit', 95, 'classicCombo'], ['coat', 'dress', 90, 'styleMatch'], ['coat', 'shorts', 25, 'seasonClash'],
  ['coat', 'tanktop', 35, 'seasonClash'], ['coat', 'sandals', 25, 'seasonClash'], ['coat', 'sneakers', 70, 'smartCasual'],
  ['parka', 'suit', 18, 'formalityGap'], ['parka', 'suitpants', 25, 'formalityGap'], ['parka', 'shorts', 25, 'seasonClash'],
  ['parka', 'dress', 30, 'formalityGap'], ['parka', 'jeans', 90, 'styleMatch'], ['parka', 'joggers', 88, 'styleMatch'],
  ['parka', 'sandals', 20, 'seasonClash'],
  ['bomber', 'jeans', 90, 'classicCombo'], ['bomber', 'joggers', 88, 'styleMatch'], ['bomber', 'suitpants', 25, 'formalityGap'], ['bomber', 'dress', 50, 'formalityGap'],
  ['cardigan', 'dress', 90, 'styleMatch'], ['cardigan', 'jeans', 86, 'styleMatch'], ['cardigan', 'shirt', 90, 'layering'],
  ['cardigan', 'tshirt', 82, 'layering'], ['cardigan', 'suitpants', 80, 'styleMatch'],
  // shoes
  ['sneakers', 'suit', 66, 'smartCasual'], ['sneakers', 'suitpants', 55, 'smartCasual'], ['sneakers', 'jeans', 94, 'classicCombo'],
  ['sneakers', 'tshirt', 90, 'styleMatch'], ['sneakers', 'chinos', 90, 'classicCombo'], ['sneakers', 'dress', 74, 'smartCasual'],
  ['sneakers', 'skirt', 80, 'styleMatch'], ['sneakers', 'joggers', 92, 'styleMatch'], ['sneakers', 'shorts', 92, 'styleMatch'],
  ['oxfords', 'suit', 97, 'classicCombo'], ['oxfords', 'suitpants', 95, 'classicCombo'], ['oxfords', 'chinos', 80, 'styleMatch'],
  ['oxfords', 'jeans', 50, 'formalityGap'], ['oxfords', 'joggers', 15, 'formalityGap'], ['oxfords', 'shorts', 12, 'formalityGap'],
  ['oxfords', 'leggings', 20, 'formalityGap'], ['oxfords', 'dress', 65, 'styleMatch'], ['oxfords', 'hoodie', 25, 'formalityGap'],
  ['oxfords', 'tshirt', 35, 'formalityGap'],
  ['loafers', 'chinos', 94, 'classicCombo'], ['loafers', 'suit', 90, 'classicCombo'], ['loafers', 'shorts', 82, 'smartCasual'],
  ['loafers', 'jeans', 80, 'smartCasual'], ['loafers', 'joggers', 25, 'formalityGap'],
  ['chelsea', 'suitpants', 90, 'classicCombo'], ['chelsea', 'jeans', 92, 'classicCombo'], ['chelsea', 'chinos', 90, 'classicCombo'],
  ['chelsea', 'suit', 88, 'styleMatch'], ['chelsea', 'joggers', 30, 'formalityGap'],
  ['boots', 'jeans', 94, 'classicCombo'], ['boots', 'cargo', 94, 'styleMatch'], ['boots', 'skirt', 84, 'styleMatch'],
  ['boots', 'dress', 82, 'styleMatch'], ['boots', 'suit', 45, 'formalityGap'], ['boots', 'shorts', 55, 'seasonClash'], ['boots', 'joggers', 60, 'styleMatch'],
  ['heels', 'dress', 96, 'classicCombo'], ['heels', 'skirt', 94, 'classicCombo'], ['heels', 'suitpants', 88, 'styleMatch'],
  ['heels', 'jumpsuit', 92, 'styleMatch'], ['heels', 'suit', 90, 'styleMatch'], ['heels', 'jeans', 82, 'smartCasual'],
  ['heels', 'joggers', 20, 'formalityGap'], ['heels', 'shorts', 40, 'formalityGap'],
  ['sandals', 'shorts', 92, 'styleMatch'], ['sandals', 'dress', 86, 'styleMatch'], ['sandals', 'skirt', 86, 'styleMatch'],
  ['sandals', 'suit', 15, 'formalityGap'], ['sandals', 'suitpants', 20, 'formalityGap'], ['sandals', 'jeans', 70, 'styleMatch'],
  ['runners', 'joggers', 96, 'styleMatch'], ['runners', 'leggings', 96, 'styleMatch'], ['runners', 'shorts', 90, 'styleMatch'],
  ['runners', 'tanktop', 90, 'styleMatch'], ['runners', 'suit', 15, 'formalityGap'], ['runners', 'suitpants', 22, 'formalityGap'],
  ['runners', 'dress', 40, 'formalityGap'], ['runners', 'jeans', 66, 'styleMatch'], ['runners', 'skirt', 50, 'styleClash'], ['runners', 'chinos', 55, 'styleClash'],
  // accessories
  ['cap', 'suit', 22, 'formalityGap'], ['cap', 'blazer', 40, 'formalityGap'], ['cap', 'suitpants', 28, 'formalityGap'],
  ['cap', 'dress', 45, 'styleClash'], ['cap', 'oxfords', 25, 'formalityGap'], ['cap', 'heels', 25, 'formalityGap'],
  ['cap', 'hoodie', 94, 'styleMatch'], ['cap', 'tshirt', 92, 'styleMatch'], ['cap', 'sneakers', 94, 'styleMatch'],
  ['cap', 'joggers', 92, 'styleMatch'], ['cap', 'coat', 40, 'formalityGap'],
  ['scarf', 'coat', 95, 'classicCombo'], ['scarf', 'parka', 85, 'styleMatch'], ['scarf', 'shorts', 40, 'seasonClash'], ['scarf', 'tanktop', 35, 'seasonClash'],
  ['belt', 'joggers', 40, 'badCombo'], ['belt', 'leggings', 35, 'badCombo'], ['belt', 'dress', 55, 'styleMatch'],
  ['belt', 'jeans', 92, 'classicCombo'], ['belt', 'chinos', 94, 'classicCombo'], ['belt', 'suitpants', 95, 'classicCombo'],
  ['belt', 'shorts', 70, 'styleMatch'], ['belt', 'skirt', 70, 'styleMatch'], ['belt', 'jumpsuit', 70, 'styleMatch'],
  ['tie', 'suit', 92, 'classicCombo'], ['tie', 'oxfords', 85, 'classicCombo'], ['tie', 'blazer', 88, 'classicCombo'],
  ['tie', 'jeans', 40, 'formalityGap'], ['tie', 'shorts', 10, 'formalityGap'], ['tie', 'joggers', 10, 'formalityGap'], ['tie', 'sneakers', 30, 'formalityGap'],
];
const RULES = new Map(RULE_LIST.map(([a, b, s, r]) => [pairKey(a, b), [s, r]]));

const LAYER_INNER = ['shirt', 'blouse', 'tshirt', 'polo', 'tanktop', 'turtleneck'];
const LAYER_OUTER = ['sweater', 'hoodie'];

export function itemPairScore(idA, idB) {
  const A = ITEM_MAP.get(idA), B = ITEM_MAP.get(idB);
  if (!A || !B) return { score: 0, reason: 'badCombo' };
  if (idA === idB) return { score: 5, reason: 'sameCategory' };
  const hit = RULES.get(pairKey(idA, idB));
  if (hit) return { score: hit[0], reason: hit[1] };

  const ids = [idA, idB];
  const cats = [A.category, B.category];
  const has = (c) => cats.includes(c);

  // tie needs a dress shirt
  if (ids.includes('tie') && has('top')) {
    const top = A.category === 'top' ? idA : idB;
    if (top === 'shirt') return { score: 95, reason: 'classicCombo' };
    if (top === 'blouse') return { score: 80, reason: 'classicCombo' };
    return { score: top === 'polo' ? 40 : 15, reason: 'needsShirt' };
  }
  // suit already contains top + bottom
  if (ids.includes('suit')) {
    if (has('top') || has('bottom')) return { score: 12, reason: 'suitConflict' };
    if (ids.includes('blazer')) return { score: 20, reason: 'suitConflict' };
  }
  if (has('onepiece')) {
    if (has('onepiece') && cats[0] === cats[1]) return { score: 5, reason: 'sameCategory' };
    if (has('top') || has('bottom')) return { score: 15, reason: 'onePieceConflict' };
  }
  if (cats[0] === cats[1] && A.category !== 'accessory') {
    const c = A.category;
    if (c === 'top') {
      if ((LAYER_INNER.includes(idA) && LAYER_OUTER.includes(idB)) || (LAYER_INNER.includes(idB) && LAYER_OUTER.includes(idA))) {
        return { score: 70, reason: 'layering' };
      }
    }
    if (c === 'outerwear' && ids.includes('blazer') && (ids.includes('coat') || ids.includes('parka'))) return { score: 68, reason: 'layering' };
    if (c === 'bottom' && ids.includes('leggings') && (ids.includes('skirt') || ids.includes('shorts'))) return { score: 60, reason: 'layering' };
    return { score: c === 'shoes' ? 5 : 8, reason: 'sameCategory' };
  }

  // general: style overlap + formality distance
  const involvesAcc = has('accessory');
  const overlap = A.styles.filter((s) => B.styles.includes(s)).length;
  let diff = Math.abs(A.formality - B.formality);
  if (involvesAcc) diff = Math.floor(diff / 2);
  let s = overlap >= 2 ? 85 : overlap === 1 ? 70 : involvesAcc ? 50 : 40;
  s += [10, 5, -5, -25, -45][Math.min(diff, 4)];
  if ((has('top') && has('bottom'))) s += 5;
  s = Math.round(clamp(s));
  let reason;
  if (diff >= 3) reason = 'formalityGap';
  else if (overlap >= 1 && (diff <= 1 || s >= 60)) reason = 'styleMatch';
  else if (diff === 2) reason = 'formalityGap';
  else reason = 'styleClash';
  if (ids.includes('watch') && s >= 60) reason = 'versatile';
  return { score: s, reason };
}

export function itemMatches(itemId) {
  const out = { great: [], good: [], avoid: [] };
  if (!ITEM_MAP.has(itemId)) return out;
  const rows = [];
  for (const it of ITEMS) {
    if (it.id === itemId) continue;
    const r = itemPairScore(itemId, it.id);
    if (r.reason === 'sameCategory') continue; // keep lists focused on real combos
    rows.push({ id: it.id, ...r });
  }
  rows.sort((a, b) => b.score - a.score);
  for (const r of rows) {
    if (r.score >= 80) out.great.push(r.id);
    else if (r.score >= 62) out.good.push(r.id);
    else if (r.score < 45) out.avoid.push(r.id);
  }
  out.avoid.reverse(); // worst first
  return out;
}

/* ---------- Outfit scoring ---------- */

const CAT_WEIGHT = { top: 2, bottom: 2, onepiece: 2, outerwear: 1.5, shoes: 1, accessory: 0.5 };

export function scoreOutfit(pieces) {
  const list = (Array.isArray(pieces) ? pieces : [])
    .map((p) => ({ item: ITEM_MAP.get(p && p.itemId), color: COLOR_MAP.get(p && p.colorId), itemId: p && p.itemId, colorId: p && p.colorId }))
    .filter((p) => p.item);
  const cats = new Set(list.map((p) => p.item.category));
  const ids = new Set(list.map((p) => p.itemId));
  const tips = [];

  // completeness
  const hasOne = cats.has('onepiece');
  const hasTop = cats.has('top'), hasBottom = cats.has('bottom'), hasShoes = cats.has('shoes');
  let completeness = 0;
  if (hasOne || (hasTop && hasBottom)) completeness += 60;
  else if (hasTop || hasBottom) completeness += 25;
  if (hasShoes) completeness += 25;
  if (cats.has('outerwear')) completeness += 7.5;
  if (cats.has('accessory')) completeness += 7.5;
  completeness = Math.round(completeness);

  if (!hasOne) {
    if (!hasTop) tips.push({ key: 'tip.addTop', params: {} });
    if (!hasBottom) tips.push({ key: 'tip.addBottom', params: {} });
  }
  if (!hasShoes) tips.push({ key: 'tip.addShoes', params: {} });

  // pair scores
  let cSum = 0, cW = 0, sSum = 0, sW = 0, minStyle = 100;
  let worstStyle = null, worstColor = null, worstFormality = null;
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      const w = (CAT_WEIGHT[a.item.category] || 1) * (CAT_WEIGHT[b.item.category] || 1);
      const ip = itemPairScore(a.itemId, b.itemId);
      sSum += ip.score * w; sW += w;
      if (ip.score < minStyle) { minStyle = ip.score; worstStyle = { a, b, ip }; }
      const fd = Math.abs(a.item.formality - b.item.formality);
      if (fd >= 3 && a.item.category !== 'accessory' && b.item.category !== 'accessory' && (!worstFormality || fd > worstFormality.fd)) {
        worstFormality = { a, b, fd };
      }
      if (a.color && b.color) {
        const cp = pairInfo(a.colorId, b.colorId);
        cSum += cp.score * w; cW += w;
        if (cp.type === 'clash' && (!worstColor || cp.score < worstColor.score)) worstColor = { a, b, score: cp.score };
      }
    }
  }
  let colorScore = cW ? cSum / cW : 75;
  let styleScore = sW ? 0.7 * (sSum / sW) + 0.3 * minStyle : 70;

  // color count
  const chroma = new Set(list.filter((p) => p.color && !p.color.neutral).map((p) => p.colorId));
  const hasNeutral = list.some((p) => p.color && p.color.neutral);
  if (chroma.size > 3) {
    colorScore -= 8 * (chroma.size - 3);
    tips.push({ key: 'tip.tooManyColors', params: { count: chroma.size } });
  }
  if (chroma.size >= 2 && !hasNeutral) tips.push({ key: 'tip.addNeutral', params: {} });
  if (list.length >= 3 && list.every((p) => p.color) && chroma.size === 0) tips.push({ key: 'tip.addAccent', params: {} });
  colorScore = Math.round(clamp(colorScore));
  styleScore = Math.round(clamp(styleScore));

  // problems
  if (worstColor && worstColor.score < 50) {
    tips.push({ key: 'tip.colorClash', params: { a: worstColor.a.itemId, b: worstColor.b.itemId } });
  }
  if (worstFormality) {
    tips.push({ key: 'tip.formalityClash', params: { a: worstFormality.a.itemId, b: worstFormality.b.itemId } });
  }
  if (worstStyle && ['onePieceConflict', 'suitConflict', 'sameCategory', 'seasonClash'].includes(worstStyle.ip.reason) && worstStyle.ip.score < 45) {
    tips.push({ key: 'tip.itemConflict', params: { a: worstStyle.a.itemId, b: worstStyle.b.itemId } });
  }
  if (ids.has('tie') && !ids.has('shirt') && !ids.has('blouse') && !ids.has('suit')) {
    tips.push({ key: 'tip.needsShirt', params: { item: 'tie' } });
  }
  const top = list.find((p) => p.item.category === 'top'), bottom = list.find((p) => p.item.category === 'bottom');
  if (top && bottom && top.colorId && top.colorId === bottom.colorId && top.color && !top.color.neutral) {
    tips.push({ key: 'tip.sameColor', params: { color: top.colorId } });
  }

  let score = 0.4 * colorScore + 0.35 * styleScore + 0.25 * completeness;
  if (minStyle < 50 && sW) score -= (50 - minStyle) * 0.35; // hard clashes hurt
  if (!list.length) score = 0;
  score = Math.round(clamp(score));

  const problems = tips.filter((x) => x.key !== 'tip.addAccent').length;
  if (list.length && score >= 80 && !problems) tips.push({ key: 'tip.great', params: {} });
  else if (list.length && completeness >= 85 && score >= 65 && !cats.has('accessory') && !problems) {
    tips.push({ key: 'tip.addAccessory', params: {} });
  }
  return { score, colorScore, styleScore, completeness, tips };
}

/* ---------- Suggestions ---------- */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const NEUTRAL_IDS = COLORS.filter((c) => c.neutral).map((c) => c.id);
const CHROMA_IDS = COLORS.filter((c) => !c.neutral).map((c) => c.id);

export function suggestOutfit({ style, baseItemId, baseColorId, seed } = {}) {
  const seedNum = seed === undefined || seed === null
    ? hashStr(`${style || ''}|${baseItemId || ''}|${baseColorId || ''}`)
    : (typeof seed === 'number' ? seed : hashStr(String(seed)));
  const rnd = mulberry32(seedNum);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const baseItem = ITEM_MAP.get(baseItemId);
  const styleOk = STYLES.includes(style) ? style : null;

  const pool = (cat) => {
    const all = ITEMS.filter((i) => i.category === cat);
    if (!styleOk) return all;
    const f = all.filter((i) => i.styles.includes(styleOk));
    return f.length ? f : all;
  };
  const colorFor = () => (rnd() < 0.55 ? pick(NEUTRAL_IDS) : pick(CHROMA_IDS));

  const candidates = [];
  for (let n = 0; n < 60; n++) {
    const chosen = {};
    const bc = baseItem ? baseItem.category : null;
    if (bc) chosen[bc] = baseItem.id;
    const onePiece = bc === 'onepiece' || (!bc || (bc !== 'top' && bc !== 'bottom')) && rnd() < 0.2 && pool('onepiece').length;
    if (onePiece) {
      if (!chosen.onepiece) chosen.onepiece = pick(pool('onepiece')).id;
    } else {
      if (!chosen.top) chosen.top = pick(pool('top')).id;
      if (!chosen.bottom) chosen.bottom = pick(pool('bottom')).id;
    }
    if (!chosen.shoes) chosen.shoes = pick(pool('shoes')).id;
    if (!chosen.outerwear && rnd() < 0.45) chosen.outerwear = pick(pool('outerwear')).id;
    if (!chosen.accessory && rnd() < 0.4) {
      const acc = pool('accessory').filter((i) => i.id !== 'tie' || chosen.top === 'shirt' || chosen.top === 'blouse' || chosen.onepiece === 'suit');
      if (acc.length) chosen.accessory = pick(acc).id;
    }
    const order = ['top', 'bottom', 'onepiece', 'outerwear', 'shoes', 'accessory'];
    const anchorCat = chosen.top ? 'top' : 'onepiece';
    let pieces = order.filter((c) => chosen[c]).map((c) => ({ itemId: chosen[c], colorId: colorFor() }));
    if (ITEM_MAP.has(baseItemId) && baseColorId && COLOR_MAP.has(baseColorId)) {
      pieces = pieces.map((p) => (p.itemId === baseItemId ? { ...p, colorId: baseColorId } : p));
    } else if (baseColorId && COLOR_MAP.has(baseColorId)) {
      const idx = pieces.findIndex((p) => ITEM_MAP.get(p.itemId).category === anchorCat);
      if (idx >= 0) pieces[idx] = { ...pieces[idx], colorId: baseColorId };
    }
    candidates.push({ pieces, score: scoreOutfit(pieces).score });
  }
  candidates.sort((a, b) => b.score - a.score);
  return pick(candidates.slice(0, 3)).pieces;
}

/* ---------- i18n keys ---------- */

const REASONS = ['styleMatch', 'styleClash', 'formalityGap', 'sameCategory', 'onePieceConflict', 'suitConflict', 'needsShirt',
  'layering', 'smartCasual', 'classicCombo', 'badCombo', 'seasonClash', 'versatile'];
const TIPS = ['addTop', 'addBottom', 'addShoes', 'tooManyColors', 'addNeutral', 'addAccent', 'colorClash', 'formalityClash',
  'itemConflict', 'needsShirt', 'sameColor', 'addAccessory', 'great'];

export const I18N_KEYS = [
  ...COLORS.map((c) => 'color.' + c.id),
  ...ITEMS.map((i) => 'item.' + i.id),
  ...CATEGORIES.map((c) => 'cat.' + c),
  ...STYLES.map((s) => 'style.' + s),
  ...HARMONY_TYPES.map((h) => 'harmony.' + h),
  ...REASONS.map((r) => 'reason.' + r),
  ...TIPS.map((t) => 'tip.' + t),
];
