# Panklaar 🍳

Een hand-getekende kookapp (pen-op-papier stijl) voor privégebruik. Vanilla JS, geen framework en geen account. Data blijft lokaal en versleuteld op
het apparaat (IndexedDB). Zie onderaan voor de beveiligde versie en het bouwen.

## Wat zit erin

- **Recepten** bijhouden, bekijken en bewerken, met categorieën (ontbijt, lunch,
  lunch to go, diner, bijgerecht, zoet). Elk recept kan een **foto** hebben naast
  de titel, in een met de hand getrokken lijstje: zelf een foto kiezen of maken,
  of er met OpenAI een laten maken. Alles is later te bewerken — ook de tips en
  de uitleg — en **lang indrukken** op een recept geeft bekijken, bewerken, foto
  of verwijderen.
- **Terugvegen**: een veeg van links naar rechts gaat overal terug — een pop-up
  dicht, uit de kookstand, van een recept naar de lijst, en van een tabblad naar
  Start.
- **Kookstand** met stap-voor-stap uitleg, een preview van de volgende stap, de
  **hoeveelheden die bij de stap horen**, en **meerdere timers die blijven
  doorlopen** — ook buiten de kookstand — met een labeltje dat het ingrediënt
  van de stap noemt (kip, rijst) en een melding als ze klaar zijn.
- **Vragen tijdens het koken**: een balk onder de stap. Gaat het om een
  hoeveelheid of een tijd, dan komt het antwoord uit het recept zelf (zonder
  AI); andere vragen ("waarom moet de rijst eerst glazig worden?") gaan naar de
  AI, met het recept en de stap waar je bent als context.
- **Tips aanvinken**: bij een recept staan tips met hun eigen ingrediënten en
  extra stap al klaar. Eén tik en de tip zit in het recept, de boodschappenlijst
  en de kookstand. Kwam een tip als losse zin binnen, dan wordt hij bij het
  aanvinken alsnog uitgewerkt (met de AI, of anders als slotstap).
- **Waarschuwing per gezinslid**: raakt een recept aan de regels van wie
  mee-eet (een allergie, alcohol, zout bij een peuter, rauw vlees bij
  zwangerschap …), dan
  komt er een pop-up met de reden en wat je eraan kunt doen — met de keuze om
  dat in het recept te zetten, zodat het bij de juiste stap in de kookstand
  terugkomt.
- **Gezinsleden** met voedingsrichtlijnen per situatie (zwanger, borstvoeding,
  peuter, kind …), gebaseerd op publieke richtlijnen van het Voedingscentrum
  (aangevuld met RIVM/WHO), plus **allergieën** (de veertien wettelijke
  allergenen en je eigen tekst). Bij het opslaan van een gezinslid zoekt de AI
  erbij wat er voor díe persoon geldt en bewaart dat bij het lid. Alles gaat
  daarna mee bij het bedenken én het inladen van recepten. Geen persoonlijk
  medisch advies.
- **Voorkeuren** (sliders voor groente/vis/vlees per week, en vinkjes als budget,
  snel, gevarieerd, past bij het weer …) en **keukenapparatuur** als richtlijnen
  voor de AI.
- **Wat heb ik in huis**: voorraad aanvullen door een **foto** te maken of te typen.
- **Wat zullen we koken?**: een korte pop-up (maaltijd, wie eet mee, voorkeuren)
  die met de AI 1–3 recepten voorstelt om uit te kiezen.
- **Recept inladen** in drie stappen: **foto's toevoegen** (kookboek, tijdschrift,
  kaartje of je eigen handschrift — tot drie, voor een dubbele pagina) en/of
  **tekst of een link plakken**, daarna eventueel een **titel en een opmerking**
  erbij zetten, en pas dan op **Maak er mijn recept van** drukken. Een
  **receptbestand** (`.json`) inladen kan ook en gaat buiten de AI om; in de map
  [`recepten/`](recepten) staan er een paar klaar.
- **Boodschappenlijst** (gegroepeerd per gerecht, hoeveelheden worden bij elkaar
  opgeteld) en **weekplanner**.
- **Back-up**: onder Jij maak je één bestand met alles erin (recepten met
  foto's, gezinsleden, voorkeuren, voorraad, lijst, weekplanning en de
  instellingen) om te bewaren of te delen, en zet je het later weer terug. De
  API-sleutel gaat er bewust niet in.
- Installeerbare **PWA**, werkt offline (behalve de AI-functies).

## AI-functies

De AI-onderdelen (**Wat zullen we koken?**, recept inladen, vragen tijdens het
koken, de voorraad-foto en het uitzoeken per gezinslid) vragen om je eigen
API-sleutel. Zonder sleutel werkt de rest van de app gewoon: recepten bijhouden,
koken met timers, boodschappenlijst, weekplanner en gezinsleden.

Je kiest zelf de dienst onder **Jij → AI-dienst**:

| dienst | endpoint | standaardmodel |
|---|---|---|
| Claude (Anthropic) | `POST /v1/messages` | `claude-sonnet-4-6` |
| OpenAI | `POST /v1/responses` | `gpt-5-mini` |

Elke dienst heeft een eigen sleutel in het geheugen van de ontgrendelde sessie
en een eigen modelnaam. Na vergrendelen vul je de sleutel opnieuw in. Het model is een gewoon
tekstveld: kent de dienst de naam niet, dan zie je die melding terug en vul je
een andere in. Het zoeken naar bestaande recepten gebruikt bij Claude de
`web_search`-tool en bij OpenAI de ingebouwde `web_search` van de Responses API.

### AI-gebruik en budget

Onder **Jij → AI-gebruik** staat wat de AI deze maand ongeveer heeft gekost, in
dollars: het bedrag, hoeveel er nog over is van je maandbedrag, het aantal
aanvragen, de tokens en het aantal zoekacties, plus de vorige maanden. Het is een
schatting op basis van de tokens die de API per antwoord teruggeeft, tegen de
prijzen in `PRIJZEN` in de code (per model, voor beide diensten) — je echte
tegoed staat bij de dienst zelf.
Je krijgt één melding als er nog 20% van je maandbedrag over is en één bij 10%;
elke nieuwe maand begint opnieuw.

### AI-sleutel stap voor stap

1. Ga naar [console.anthropic.com](https://console.anthropic.com) en log in, of
   maak een account aan.
2. Zet tegoed op je account bij **Billing**. Let op: een Claude-abonnement (Pro
   of Max) telt hier niet voor mee — de API werkt met apart tegoed.
3. Open **API Keys** en klik op **Create Key**.
4. Kopieer de sleutel. Die begint met `sk-ant-api…` en is maar één keer te zien.
5. Plak hem in de app bij **Jij → AI-sleutel** en tik op **Sleutel testen**.

Goed om te weten:

- De sleutel blijft in het geheugen van de ontgrendelde sessie en gaat alleen
  naar de gekozen AI-dienst om aanvragen te authenticeren. Hij staat niet in
  de code, permanente browseropslag of een back-up.
- Plak de sleutel na herladen of vergrendelen opnieuw in, ook op andere apparaten.
- De kosten zijn klein: grofweg een paar cent per keer dat je recepten laat
  bedenken.
- De voedingsregels bij gezinsleden volgen publieke richtlijnen van het
  Voedingscentrum (aangevuld met RIVM/WHO). Het is geen medisch advies —
  overleg bij twijfel met je verloskundige, huisarts of het consultatiebureau.

Dezelfde uitleg staat in de app zelf onder **Jij → Uitleg**.

## Draaien

Zet de bestanden op een statische host (bijv. GitHub Pages) en open `index.html`.
Lokaal testen kan met een simpele webserver, bijv. `python3 -m http.server`.

## Stijl

De hele identiteit is de hand-getekende look: SVG-wobble-filters op randen,
inline SVG-iconen (nooit emoji) en dubbel-getekende contouren. Het getekende
pannetje is het logo.

## Beveiligde versie en Safari-herstel v40

Online: **https://panklaar.zsj4j2s4df.workers.dev/**.

Recepten, foto's en gezins-/allergiegegevens worden lokaal versleuteld in
IndexedDB opgeslagen met AES-256-GCM. Het wachtwoord wordt via PBKDF2-SHA256
(600.000 iteraties, willekeurig zout van 16 bytes) naar een sleutel omgezet.
Elke opslagbewerking gebruikt een nieuwe willekeurige IV van 12 bytes.
Het wachtwoord wordt nooit opgeslagen of verzonden. Standaard blijft de
ontsleutelsleutel alleen in het geheugen. Met de expliciete optie om op een
vertrouwd apparaat ontgrendeld te blijven bewaart deze browser 30 dagen een
niet-exporteerbare CryptoKey in IndexedDB; deze sleutel zit nooit in een back-up.
Dit is minder afgeschermd op een gedeeld apparaat: wie toegang heeft tot deze
browser kan de app dan openen. Vergrendelen, uitschakelen onder Jij of het
verstrijken van de termijn verwijdert de onthouden toegang. Je wachtwoord
blijft nodig om back-ups op een ander apparaat te openen.
Bewaar je wachtwoord in een wachtwoordmanager: zonder wachtwoord bestaat geen
herstelmogelijkheid. Maak regelmatig een versleutelde back-up.

De app vergrendelt na 10 minuten inactiviteit, behalve tijdens de kookstand,
zolang er een timer loopt of wanneer dit apparaat bewust is onthouden. Je kunt ook zelf op Vergrendelen drukken. Opgeslagen
timers blijven behouden, maar kunnen pas na ontgrendelen opnieuw melden.
Een tweede tabblad kan niet tegelijk schrijven. Opslaan is pas geslaagd wanneer
de IndexedDB-transactie is voltooid; bij een fout blijft de eerdere kopie staan.

API-sleutels plak je zelf onder Jij. Ze blijven uitsluitend in het geheugen van
de ontgrendelde sessie en ontbreken in browseropslag en back-ups. Na vergrendelen
of herladen moet je ze opnieuw invullen. Op het oude apparaat worden eerdere
onversleutelde sleutels verwijderd na het succesvol openen van de beveiligde
opslag. Ze worden niet automatisch gebruikt. De eerste AI-aanvraag van een
sessie vraagt toestemming voordat gegevens naar de gekozen dienst gaan.
Daarbij kunnen recepten, foto's en gezins-/allergiegegevens worden gedeeld.
Tijdens deze beveiligingscontrole zijn alleen gesimuleerde AI-antwoorden
gebruikt: er zijn geen echte API-aanvragen met sleutels uitgevoerd.

Imports worden begrensd en vóór opslag gecontroleerd. Actieve foto-URL's,
HTML-attribuutinjecties, onbekende velden, ongeldige identifiers en verkeerde
gegevenstypen worden geweigerd. Foto's zijn uitsluitend lokale PNG/JPEG/WebP-
data-URL's. Uit back-ups ingelezen patronen worden niet meer als vrije reguliere
expressies uitgevoerd. Gezinsregels blijven algemene hulpmiddelen: controleer
allergenen altijd zelf en vertrouw voor medische beslissingen niet op AI.

De aparte Cloudflare-host stuurt CSP, HSTS, frameblokkering, no-referrer,
nosniff en andere browserbeveiligingsheaders. API-verkeer mag uitsluitend naar
OpenAI en Anthropic. De app blijft offline bruikbaar; de service worker bewaart
alleen de eigen appbestanden en verwijdert geen caches van andere apps.
Versleuteling beschermt niet tegen malware of onbetrouwbare extensies/code
terwijl je de app gebruikt. Oude, reeds gemaakte JSON-back-ups blijven leesbaar.

### Bestaande gegevens overzetten

1. Open https://zsj4j2s4df-pixel.github.io/Panklaar/ op het apparaat waar je
   recepten staan. Kies een wachtwoord; bestaande gegevens worden pas verwijderd
   nadat de versleutelde kopie is opgeslagen.
2. Kies Jij → Back-up → Back-up maken.
3. Open het nieuwe Cloudflare-adres, kies een wachtwoord en zet de back-up terug.
4. Vul het wachtwoord van de back-up in en controleer de gegevens. Plak je
   API-sleutel opnieuw in de app.

De app accepteert ook oudere JSON-back-ups. Terugzetten vervangt de hele
verzameling, na controle en een bevestiging. Gegevens gaan niet automatisch
mee naar een ander adres, apparaat of browser.

### Ontwikkelen en publiceren

```sh
npm ci
npx playwright install chromium webkit
npm test
npm run build
```

De build bevat alleen expliciet toegestane publieke bestanden. De Cloudflare
Worker staat in `worker.mjs`; `dist/worker-bundle.mjs` is het uploadbestand.
`wrangler.jsonc` beschrijft de configuratie. GitHub Actions test beveiliging,
import/export, migratie, offline gebruik, timers, gezinsleden en appfuncties.
Deploy wijzigingen opnieuw naar Cloudflare na geslaagde controles. Hiervoor
staat geen API-token in de repository.

Branchbeveiliging vraagt afzonderlijke GitHub-beheerrechten. De beschikbare
koppeling miste deze rechten bij de eerdere Kasboek-publicatie. Met een geschikte
beheerkoppeling kan de klaargezette configuratie worden toegepast:

```sh
gh api --method PUT repos/zsj4j2s4df-pixel/Panklaar/branches/main/protection \
  --input scripts/branch-protection.json
```

Deze configuratie vereist een pull request en geslaagde automatische controles,
ook voor beheerders. Ze blokkeert force pushes en verwijderen van `main`.
Voor een persoonlijke repository is geen tweede menselijke goedkeurder vereist.

### Safari-bugs hersteld in v40

- De beveiligingsinformatie staat onder Jij. Die staat niet meer als brede kolom
  naast de app; de app vult op mobiel weer de volledige schermbreedte.
- SVG-filters staan op decoratieve randen en niet op containers met invoervelden.
  De weekplanner gebruikt een aanklikbare receptenlijst in plaats van een native
  select in een gefilterde kaart. Alle keuzen worden bewaard en zijn te wissen.
- Ook nieuwe recepten kunnen direct een foto krijgen. De preview verschijnt vóór
  opslaan, en getypte tekst, tips en keuzes blijven staan na de fotokiezer.
  Eenvoudige, geldige foto's worden niet langer op bestandsgrootte afgekeurd.
- Voorraadinvoer is aan te tikken en werkt via Enter en de plusknop.
- Timeronderwerpen volgen de getimede handeling in de stap. Kip/kipfilet,
  ui/uien en ei/eieren worden herkend; het onderwerp is vóór starten te wijzigen.
- De optie om ontgrendeld te blijven is beschikbaar bij het wachtwoord en onder
  Jij. De AI-sleutel wordt daarbij niet onthouden.

Browsercontroles draaien op mobiel Chromium en mobiel WebKit (de Safari-engine).
De tests gebruiken aanraakacties en controleren foto-afmetingen, invoerfocus,
plannerkeuzes, schermbreedte en het verlopen en intrekken van onthouden toegang.
Een fysieke iPhone en de iOS-fotokiezer kunnen aanvullende toestelverschillen
hebben; de test uploadt wel echte afbeeldingsbestanden en controleert de preview.

### Timeronderwerpen v41

De timer benoemt wat bij de getimede handeling de pan in gaat. Bijvoorbeeld:
`Voeg ui toe aan de kip en bak 5 minuten` geeft **ui**, en `Voeg ui en knoflook
toe en bak 3 minuten` geeft **ui en knoflook**. Bij `Laat 5 minuten bakken`
zoekt de app de laatste toevoeging in deze of de voorgaande kookstap. Ingrediënten
uit latere handelingen worden niet meegenomen. Ook boter kan zelf het onderwerp
zijn, bijvoorbeeld bij smelten; het onderwerp blijft vóór starten aanpasbaar.

### Lokaal inloggen v42

Een scherm met het Panklaar-icoon, gebruikersnaam, wachtwoord en ‘Ingelogd blijven’.
Voor bestaande gegevens kies je eenmalig een gebruikersnaam met je bestaande
wachtwoord. De gebruikersnaam wordt versleuteld in IndexedDB met de bestaande
gegevenssleutel; gebruikersnamen zijn niet hoofdlettergevoelig. Het wachtwoord
wordt niet bewaard. Back-ups gebruiken nog steeds alleen hun back-upwachtwoord.
Er is geen serveraccount of automatische synchronisatie tussen apparaten.

De bestaande optie voor 30 dagen onthouden blijft optioneel. Vergrendelen trekt
deze toegang in. Een oud onthouden apparaat vraagt bij de eerste upgrade nogmaals
je wachtwoord om de gebruikersnaam veilig in te stellen. De AI-sleutel blijft
alleen beschikbaar in de huidige sessie. De offline cache bevat ook het inlogscript.

Extra controles voor beide mobiele browsermotoren: het icoon en schermbreedte,
onjuiste inloggegevens, bestaande gegevens behouden en onthouden toegang intrekken.
