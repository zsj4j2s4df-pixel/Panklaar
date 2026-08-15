# Panklaar 🍳

Een hand-getekende kookapp (pen-op-papier stijl) voor privégebruik. Eén bestand,
vanilla JS, geen build-stap, geen framework, geen account. Data blijft lokaal op
het apparaat (IndexedDB).

## Wat zit erin

- **Recepten** bijhouden, bekijken en bewerken, met categorieën (ontbijt, lunch,
  lunch to go, diner, bijgerecht, zoet).
- **Kookstand** met stap-voor-stap uitleg, een preview van de volgende stap en
  **meerdere timers die blijven doorlopen** — ook buiten de kookstand — met een
  labeltje (waarvoor) en een melding als ze klaar zijn.
- **Gezinsleden** met voedingsrichtlijnen per situatie (zwanger, borstvoeding,
  peuter, kind …), gebaseerd op publieke richtlijnen van het Voedingscentrum
  (aangevuld met RIVM/WHO). Geen persoonlijk medisch advies.
- **Voorkeuren** (sliders voor groente/vis/vlees per week, en vinkjes als budget,
  snel, gevarieerd, past bij het weer …) en **keukenapparatuur** als richtlijnen
  voor de AI.
- **Wat heb ik in huis**: voorraad aanvullen door een **foto** te maken of te typen.
- **Wat zullen we koken?**: een korte pop-up (maaltijd, wie eet mee, voorkeuren)
  die met de AI 1–3 recepten voorstelt om uit te kiezen.
- **Recept inladen**: open een receptbestand (`.json`, gaat buiten de AI om), of
  plak een recept dat je ergens tegenkwam (de tekst of alleen de link) en laat
  het omzetten naar de vorm van de app, eventueel met een wijziging als "met kip
  in plaats van zalm". In de map [`recepten/`](recepten) staan kant-en-klare
  bestanden om in te laden.
- **Boodschappenlijst** (gegroepeerd per gerecht, hoeveelheden worden bij elkaar
  opgeteld) en **weekplanner**.
- Installeerbare **PWA**, werkt offline (behalve de AI-functies).

## AI-functies

De AI-suggesties (**Wat zullen we koken?**) en de voorraad-foto gebruiken de
Anthropic API en vragen om je eigen API-sleutel. Zonder sleutel werkt de rest
van de app gewoon: recepten bijhouden, koken met timers, boodschappenlijst,
weekplanner en gezinsleden.

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
