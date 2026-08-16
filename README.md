# Panklaar 🍳

Een hand-getekende kookapp (pen-op-papier stijl) voor privégebruik. Eén bestand,
vanilla JS, geen build-stap, geen framework, geen account. Data blijft lokaal op
het apparaat (IndexedDB).

## Wat zit erin

- **Recepten** bijhouden, bekijken en bewerken, met categorieën (ontbijt, lunch,
  lunch to go, diner, bijgerecht, zoet).
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
  en de kookstand.
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
- **Recept inladen** op drie manieren: een **foto** van een kookboek, tijdschrift,
  kaartje of je eigen handschrift (meerdere foto's tegelijk voor een dubbele
  pagina), **geplakte tekst of een link**, of een **receptbestand** (`.json`, gaat
  buiten de AI om). Bij de eerste twee kun je meteen een wijziging meegeven, zoals
  "met kip in plaats van zalm". In de map [`recepten/`](recepten) staan
  kant-en-klare bestanden om in te laden.
- **Boodschappenlijst** (gegroepeerd per gerecht, hoeveelheden worden bij elkaar
  opgeteld) en **weekplanner**.
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

Elke dienst heeft zijn eigen sleutel (apart in `localStorage`) en zijn eigen
modelnaam, dus wisselen kan zonder iets kwijt te raken. Het model is een gewoon
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

- De sleutel blijft in de opslag van je eigen browser en gaat nergens anders
  heen. Hij staat niet in de code en niet in een back-up.
- Elke website bewaart z'n eigen sleutel. Gebruik je de app ook op een andere
  telefoon of laptop, plak hem daar dan opnieuw.
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
