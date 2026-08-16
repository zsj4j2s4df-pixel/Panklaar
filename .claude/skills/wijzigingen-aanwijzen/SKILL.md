---
name: wijzigingen-aanwijzen
description: Bouw en publiceer de nakijkversie van de app — dezelfde app met een aanwijs-laag erin, waarmee Jesse met zijn vinger aanwijst wat er anders moet en er een opdracht uit kopieert. Gebruik dit bij "geef me de versie waarin ik kan aanwijzen", "nakijkversie", "aanwijzen", "review-versie", en gebruik het óók om een teruggeplakte opdracht ("Opdracht voor … — N punten") netjes af te werken.
---

# Wijzigingen aanwijzen

Twee kanten: je **bouwt** de nakijkversie, en je **werkt af** wat er uit terugkomt.

## 1. De nakijkversie bouwen

```bash
python3 .claude/skills/wijzigingen-aanwijzen/build-review.py .
```

Dat leest `.claude/wijzigingen-aanwijzen.json`, plakt `annotate.html` in de app en
schrijft twee bestanden in `.claude/review/`:

- `review.html` — dit publiceer je
- `review-test.html` — hetzelfde, met de `<html>`/`<head>`/`<body>`-wikkel die de
  artifact-host er zelf omheen zet; hierop test je, anders test je iets anders
  dan hij te zien krijgt

Publiceer met het Artifact-gereedschap: `file_path` is `review.html`, `favicon`
uit de instellingen, en **`url` is de `artifact_url` uit de instellingen** zodat
elke versie op dezelfde link komt en doorgestuurde links blijven werken. Zet die
URL na de eerste keer in `.claude/wijzigingen-aanwijzen.json`.

**Bouw altijd opnieuw**, ook als de link al bestaat — anders kijkt hij naar een
oude versie.

Zeg er elke keer bij:

> De nakijkversie heeft **eigen opslag**, los van de echte app — wat je daar
> invoert komt niet in je gewone Panklaar terecht. En de **AI-knoppen werken er
> niet**: een artifact mag niet naar buiten praten.

### Instellingen

`.claude/wijzigingen-aanwijzen.json`:

| sleutel | betekenis |
|---|---|
| `app_file` | het bestand van de app |
| `artifact_url` | de vaste link; invullen na de eerste publicatie |
| `favicon` | emoji voor de tab |
| `preview_builder` | eigen script dat van de app één zelfstandig bestand bakt (fonts en plaatjes als `data:`-URI) — alleen nodig als de app dingen van buitenaf laadt |
| `title_note` | wat er achter de titel komt, bijv. `" — nakijken"` |

### Testronde vóór publiceren

Draai `review-test.html` in Chromium op 390×844, over **`http://`** (op `file://`
is de herkomst leeg en besmet zelfs een `data:`-URL het canvas, waardoor de foto
faalt). De laag hangt `window.__ann` op met `marks()`, `opdr()`, `fotos()`,
`kies()`, `aan()`, `plek()`, `tekst()`, `foto()` en `neemFoto()` — de code zit in
een IIFE, dus zonder dat haakje kun je niet testen zonder te klikken.

1. app laadt, geen `pageerror` (een 404 op `/favicon.ico` telt niet mee)
2. met de laag **uit** werkt navigeren gewoon
3. met de laag **aan**: twee punten op pagina A, dan naar pagina B — daar staan
   nul punten; terug naar A en het zijn er weer twee
4. elk gereedschap één keer: pijl, dubbele pijl en omcirkeling verschijnen, met
   een genummerd bolletje in de kleur van hun punt
5. groeperen: punt zetten, `plek(n)`, pijl tekenen — nog steeds één opdracht,
   beide markeringen delen het nummer
6. lang indrukken: snel slepen over een bestaand punt verplaatst niets;
   380 ms vasthouden en dán slepen verplaatst hem wél, en het aantal blijft gelijk
7. punten hangen aan de inhoud: punt zetten, 260 px scrollen (op een pagina die
   zo ver kán scrollen — lees `scrollTop` terug), het punt schuift 260 px mee; en
   een punt op een al gescrolde pagina landt onder de vinger
8. foto: begint met `data:image/png`, bevat het punt, en is zo hoog als de hele
   pagina — niet als het scherm
9. `tekst()` levert echte regeleinden en kloppende plekregels

Let op: Playwright's `click()` scrollt, dus een `boundingBox()` van vóór de klik
klopt daarna niet meer. En met de laag **aan** vangt het vel elke tik af — zet
hem in de test uit voor je op een tab van de app klikt.

## 2. Een teruggeplakte opdracht afwerken

Hij plakt zoiets terug:

```
Opdracht voor Panklaar — 2 punten

── recepten ──
1. bij «＋ nieuw recept»
   sorteerbalk standaard verbergen

── jij ──
2. verbindt «Jouw keuken» ↔ «Zo begin je»
   + bij «Wat heb ik in huis»  [op lijst]
   laat deze informatie samenwerken
📷 foto 1 — punt 2 staat erop
```

Zo werk je dat af:

1. **Zet elk punt als aparte taak**, in dezelfde volgorde, met de paginanaam
   erin. Eén nummer is altijd één taak, ook als er drie plekregels onder staan.
2. **Werk ze één voor één af.** Nooit twee tegelijk in behandeling.
3. **Sla een punt over dat je niet zeker weet** — gok niet. Laat die taak open,
   maak alle andere punten volledig af, en vraag aan het eind alleen over díe
   punten iets. Vraag nooit over de hele opdracht als er één punt onduidelijk is.
4. **Eén release voor de hele opdracht**, niet één per punt: één keer de
   cacheversie ophogen, één keer testen, één commit met alle punten in de tekst.
5. **Meld per punt kort wat je deed**, met het nummer erbij, zodat de lijst af te
   vinken is. Noem apart wat je hebt overgeslagen en waarom.

De tekst tussen «…» is het label van het element. Zoek daarop in de broncode —
dat is precies waarom de aanwijzing uit de app komt en niet van een screenshot.

Staat er `(nog geen uitleg)` onder een punt, dan is er wel iets aangewezen maar
niets ingetypt. Dat is alleen een aanwijzing wáár je moet kijken — vraag ernaar,
verzin er niets bij.

## 3. Hoe de laag in elkaar zit

`annotate.html` is één `<style>` en één `<script>` in een IIFE, alles met het
voorvoegsel `ann`. Twee lijsten:

```js
marks = [{grp, soort, pag, x, y, x2, y2, p, anker, anker2}]   // de tekeningen
opdr  = [{n, tekst}]                                          // de opdrachten
```

Ze hangen samen via `m.grp === o.n`, dus één opdracht kan meerdere plekken hebben,
ook op verschillende pagina's. Waar het op vastloopt als je eraan sleutelt:

- **Punten horen bij een pagina** (`m.pag`) en worden alleen getekend als die
  pagina in beeld is. De pagina komt uit `window.currentPage`, anders uit een
  zichtbare `[id^="page-"]`, anders uit de actieve tab plus de zichtbare kop.
  Een `setInterval` van 220 ms kijkt of dat veranderd is.
- **Coördinaten staan in de inhoud van het scrollende vlak**, niet in het scherm:
  `y = clientY − vlakTop + vlak.scrollTop`, en de SVG-groep krijgt bij elke scroll
  een `translate` terug. Scroll-events bubbelen niet, dus luisteren in de
  capture-fase.
- **Het anker** komt van `elementsFromPoint` van binnen naar buiten, eerste korte
  label; `innerText` (niet `textContent`, die plakt losse spans aan elkaar), eerste
  regel, maximaal 45 tekens, en eerst kijken naar `aria-label`, `placeholder` en
  `title`.
- **De laag zit in `.phone` of anders in `body`.** De tekenlaag is `absolute` (die
  moet meescrollen), maar balk, overzicht en fotoviewer zijn `fixed`, anders
  zakken ze weg onderaan een lange pagina. De balk houdt zelf afstand van de
  onderbalk van de app.
- **De foto** is een `<foreignObject>` op een canvas: serialiseren met
  `XMLSerializer` (HTML is geen geldige XML en laadt dan stil niet), inlezen via
  een **`data:`-URL** (een `blob:`-URL besmet het canvas en breekt `toDataURL`),
  en de waarden van invoervelden expliciet overzetten — een gekloond veld draagt
  zijn waarde in een property, niet in een attribuut.
- **Lang indrukken botst met slepen**: bij `pointerdown` een markering onder de
  vinger zoeken en een timer van 380 ms zetten; beweegt de vinger eerder meer dan
  8 px, dan is het gewoon een sleep. Bij pijlen meet je de afstand tot het
  lijnstuk, niet tot de uiteinden.
- Bij slepen krijgt het bezige element alvast een groep om in de goede kleur te
  tekenen, maar die wordt **bij het loslaten weggegooid** zodat `voegToe` beslist.
  Anders telt elke halve sleep als nieuw punt.
