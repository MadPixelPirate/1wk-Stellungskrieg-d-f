# Die Westfront. 1914 bis 1918

Eine deutschsprachige, dokumentarische Browser-Ausstellung zum Stellungskrieg
zwischen Deutschland und Frankreich. Sieben Kapitel verbinden eine belegte
Geschichte mit einer Three.js-Karte und einem raeumlichen Modell eines
schematischen Grabensystems. Die Kamera ist drehbar; eine Spielfigur gibt es nicht.

## Start

```powershell
npm install
npm run dev
```

Adresse: **http://localhost:8000**. Port 8000 ist fest eingestellt. Ist er bereits
belegt, bricht Vite ab, statt einen anderen Port zu verwenden. Der Server bindet
nur an localhost, nicht an alle Netzwerkschnittstellen.

## Die Ausstellung

- Sieben Kapitel: Marne, Grabensystem, Alltag, Verdun, Somme, Wandel 1917/18 und Waffenstillstand.
- Three.js-Karte mit lokal eingebundenen Natural-Earth-Kuestenumrissen und historischen Ortsmarkierungen.
- Drehbares Grabenmodell mit sechs Linien, Verbindungswegen, Unterstand und erlaeuterten Begriffen.
- Zeitlicher Vergleich der gleichzeitig stattfindenden Schlachten von Verdun und Somme.
- Quellen pro Kapitel, Hinweise zu Schaetzungen und vereinfachten Darstellungen.
- Drei Lernfragen mit begruendeten Antworten und Verweisen zurueck auf die Kapitel.
- Druckbare Lesefassung mit der vollstaendigen Geschichte und Quellenverzeichnis.
- Mobile Darstellung, Tastaturbedienung, reduzierte Bewegung und helle/dunkle Ansicht.

Die Kameratasten erlauben Zoom, Draufsicht und Zuruecksetzen. Das Modell laesst
sich mit Maus oder Touch drehen. Bei fokussierter 3D-Ansicht drehen die Pfeiltasten
links/rechts die Kamera; Plus/Minus aendern den Zoom. In der Kapitelzeile wechseln
Pfeiltasten sowie Home/End das Kapitel. Escape schliesst Dialoge.

Direktlinks sind moeglich, beispielsweise http://localhost:8000/#verdun.

## Faktenpruefung

Die Texte wurden am **13.09.2026** mit tatsaechlich abgerufenen Darstellungen von
Deutschem Historischem Museum, Memorial de Verdun, National Army Museum und
Encyclopaedia Britannica abgeglichen. Die verwendeten elf Quellen sind in der
Ausstellung einzeln mit ihrer Aussage verknuepft.

**Das Pruefprotokoll steht in [QUELLEN.md](QUELLEN.md).** Es dokumentiert auch
abweichende Opferzahlen, die Rundung der Verdun-Dauer und unterschiedliche
Enddatierungen der Somme-Schlacht. Automatisierte Datentests ersetzen diese
inhaltliche Quellenpruefung nicht.

## Offline-Fassung

```powershell
npm run build
```

[dist/index.html](dist/index.html) enthaelt JavaScript, CSS, Three.js, Symbole,
Geodaten und Geschichte in einer einzigen Datei. Sie kann auch ohne Server und
ohne Internet im Browser geoeffnet werden. Nur der Aufruf externer Originalquellen
braucht eine Internetverbindung. Die Quelldatei [index.html](index.html) dagegen
benoetigt den Vite-Server.

## Abnahmepruefungen

```powershell
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Die Datentests pruefen Kapitelstruktur, Quellenreferenzen, Lernfragen und
Kalenderberechnungen. Playwright prueft in Chromium bei 1440 x 1000, 390 x 844 und
320 x 740 Pixeln:

- Nichtleere Canvas-Pixel und unterschiedliche gerenderte Modelle.
- Sichtbare Bewegung, Zoom, Draufsicht, Markierungen und Begriffserklaerungen.
- Kapitel, Direktlinks, Browserhistorie, Tastaturzugang und Quellenfilter.
- Lernfragen, richtige/falsche Antworten und Neustart.
- Vollstaendige Druckansicht, reduzierte Bewegung und dunkles Farbschema.
- Betrieb der gebuendelten HTML-Datei ohne Netzwerkanfragen.
- Keine horizontalen Seitenueberlaeufe oder kollidierenden Modellbeschriftungen.

Screenshots entstehen unter dem generierten Verzeichnis `test-results/`.
Der Testserver nutzt denselben festen Port 8000 und kann einen bereits laufenden
Projektserver wiederverwenden.

### Pruefstand am 13.09.2026

- Produktionsbuild erfolgreich; die eigenstaendige HTML-Datei ist rund 822 kB gross.
- Alle 3 Datentests bestanden.
- Die vollstaendige Abnahme mit 15 Browsertests in allen drei Bildschirmgroessen bestanden.
- Nach der abschliessenden Kameraanpassung alle 3 gezielten 3D-Tests erneut bestanden; neue Screenshots visuell kontrolliert.
- Anschliessend den finalen Build nochmals in allen 3 Bildschirmgroessen offline geprueft: bestanden, keine externen Netzwerkanfragen.
- Keine gemeldeten Editorfehler in den geaenderten Dateien.

## Aufbau

- [src/content.mjs](src/content.mjs): Kapitel, Quellen, Modellhinweise, Begriffe und Lernfragen.
- [src/scene.mjs](src/scene.mjs): Three.js-Modelle, Kamera und raeumliche Beschriftungen.
- [src/main.mjs](src/main.mjs): Navigation, Quellenfenster, Druckansicht und Wissenscheck.
- [src/style.css](src/style.css): Clawpilot-Farben und responsive Gestaltung.
- [src/land.json](src/land.json): lokal eingebundene, gemeinfreie Kartengrundlage.
- [tests/content.test.mjs](tests/content.test.mjs) und [tests/browser.spec.js](tests/browser.spec.js): reproduzierbare technische Pruefungen.

Voraussetzungen: Node.js 22.12 oder neuer, npm und ein aktueller Browser mit
WebGL2. Geprueft mit Node.js 24.14 und Chromium. Ohne WebGL bleibt die gesamte
Geschichte samt Quellen und Lesefassung erreichbar; nur das 3D-Modell fehlt.

Die Modelle sind didaktische Eigenanfertigungen, keine historischen Aufnahmen.
Die Karte zeigt bewusst keine Staatsgrenzen und verwendet auch in spaeteren
Kapiteln dasselbe als Ende 1914 gekennzeichnete, schematische Frontband.