# MatchMyFit

MatchMyFit hilft dir, passende Outfits zusammenzustellen: Welche **Farben** harmonieren miteinander und welche **Kleidungsstücke** passen zueinander?

## Features

- **Farben matchen** – Farbe wählen und passende Farbgruppen (monochrom, komplementär, analog, triadisch, neutral) sehen; zwei Farben vergleichen mit Score.
- **Kleidung matchen** – Kategorien und Stilfilter; zu jedem Kleidungsstück die besten und zu vermeidenden Kombinationen.
- **Kamera-Farberkennung** – Farbe eines Kleidungsstücks mit der Kamera erkennen (oder ein Foto hochladen) und passende Farben vorschlagen.
- **Outfit-Builder mit Score** – Oberteil, Hose/Kleid, Jacke, Schuhe und Accessoires kombinieren, Live-Score mit Tipps, Outfit-Vorschläge und Speichern.
- **Light/Dark Mode** – folgt der Systemeinstellung oder manuell umschaltbar.
- **Splash-Screen** – animierter Start bei jedem App-Start (respektiert `prefers-reduced-motion`).
- **Sprachen** – Deutsch, Englisch und Türkisch.
- **Offline-fähig** – als PWA installierbar, funktioniert nach dem ersten Laden ohne Internet.

## Lokal starten

Das Projekt benötigt keinen Build-Schritt und keine Abhängigkeiten.

```bash
cd MatchMyFitOne
python3 -m http.server 8080
```

Dann im Browser http://localhost:8080 öffnen.

Hinweis: Der Kamera-Zugriff funktioniert nur über **HTTPS** oder **localhost**.

## Als App installieren (PWA)

- **Android / Chrome / Edge:** Menü (⋮) → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.
- **iOS / Safari:** Teilen-Symbol → „Zum Home-Bildschirm“.
- **Desktop Chrome / Edge:** Installationssymbol in der Adressleiste.

## Deployment (GitHub Pages)

1. Repository auf GitHub hochladen.
2. Unter **Settings → Pages** als Quelle den Branch (z. B. `main`) und den Ordner `/ (root)` wählen.
3. Nach dem Deploy ist die App unter `https://<benutzer>.github.io/<repo>/` erreichbar.

Alle Pfade sind relativ (`./`), daher funktioniert die App auch in einem Unterpfad. Nach Code-Änderungen die Cache-Version in `sw.js` (`CACHE`) erhöhen, damit Nutzer die neue Version erhalten.

## Projektstruktur

```
index.html                 Einstiegsseite
css/styles.css             Styles (Light/Dark, Animationen)
js/app.js                  Einstiegsmodul, Views, Rendering
js/i18n.js                 Übersetzungsfunktionen
js/matching.js             Farb- und Kleidungsdaten, Matching-Logik, Scoring
js/camera.js               Kamera und Farbextraktion
js/locales/de.js           Deutsche Texte
js/locales/en.js           Englische Texte
js/locales/tr.js           Türkische Texte
manifest.webmanifest       PWA-Manifest
sw.js                      Service Worker (Offline-Cache)
icons/                     App-Icons (SVG und PNG)
```
