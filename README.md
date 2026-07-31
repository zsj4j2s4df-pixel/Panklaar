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
- **Boodschappenlijst** en **weekplanner**.
- Installeerbare **PWA**, werkt offline (behalve de AI-functies).

## AI-functies

De AI-suggesties en de voorraad-foto gebruiken de Anthropic API. Plak je eigen
API-sleutel in de app (tab **Jij → AI-sleutel**); die blijft alleen op je toestel.

## Draaien

Zet de bestanden op een statische host (bijv. GitHub Pages) en open `index.html`.
Lokaal testen kan met een simpele webserver, bijv. `python3 -m http.server`.

## Stijl

De hele identiteit is de hand-getekende look: SVG-wobble-filters op randen,
inline SVG-iconen (nooit emoji) en dubbel-getekende contouren. Het getekende
pannetje is het logo.
