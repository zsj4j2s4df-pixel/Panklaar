#!/usr/bin/env python3
"""Plak de app en de aanwijs-laag aan elkaar tot één nakijkbestand.

    python3 .claude/skills/wijzigingen-aanwijzen/build-review.py [projectmap] [-o uitvoer]

Leest .claude/wijzigingen-aanwijzen.json uit de projectmap:

    app_file         het bestand van de app (of het resultaat van preview_builder)
    artifact_url     de link waarop je publiceert; vul hem in na de eerste keer
    favicon          emoji voor de tab
    preview_builder  eigen script dat van de app één zelfstandig bestand bakt
                     (fonts en plaatjes als data:-URI) — alleen nodig als de app
                     dingen van buitenaf laadt
    title_note       wat er achter de titel komt, bijv. " — nakijken"

Schrijft twee bestanden:
    <uit>/review.html       wat je publiceert
    <uit>/review-test.html  hetzelfde, met de <html>/<head>/<body>-wikkel die de
                            artifact-host er zelf omheen zet — hierop test je
"""
import json
import os
import re
import subprocess
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
LAAG = os.path.join(HIER, "annotate.html")


def lees_config(project):
    pad = os.path.join(project, ".claude", "wijzigingen-aanwijzen.json")
    if not os.path.exists(pad):
        sys.exit(f"Geen instellingen gevonden: {pad}")
    with open(pad, encoding="utf-8") as f:
        cfg = json.load(f)
    cfg.setdefault("app_file", "index.html")
    cfg.setdefault("artifact_url", None)
    cfg.setdefault("favicon", "✏️")
    cfg.setdefault("preview_builder", None)
    cfg.setdefault("title_note", " — nakijken")
    return cfg


def haal_app(project, cfg):
    """De app als één stuk HTML — desnoods eerst via het eigen bouwscript."""
    if cfg["preview_builder"]:
        bouw = os.path.join(project, cfg["preview_builder"])
        print(f"preview_builder: {bouw}")
        subprocess.run([sys.executable, bouw], cwd=project, check=True)
    pad = os.path.join(project, cfg["app_file"])
    if not os.path.exists(pad):
        sys.exit(f"App niet gevonden: {pad}")
    with open(pad, encoding="utf-8") as f:
        return f.read()


def schoon(html):
    """Weg met wat in een artifact toch niet werkt en alleen fouten geeft."""
    html = re.sub(r'\s*<link[^>]+rel="manifest"[^>]*>', "", html)
    html = re.sub(r'\s*<link[^>]+rel="apple-touch-icon"[^>]*>', "", html)
    # elk <script>-blok dat de service worker registreert (met of zonder commentaar ervoor)
    html = re.sub(
        r"\s*<script>(?:(?!</script>).)*serviceWorker(?:(?!</script>).)*</script>",
        "",
        html,
        flags=re.S,
    )
    return html


def titel_erbij(html, note):
    if not note:
        return html
    m = re.search(r"<title>(.*?)</title>", html, flags=re.S)
    if not m or note in m.group(1):
        return html
    return html[: m.start(1)] + m.group(1).strip() + note + html[m.end(1) :]


def plak(html, laag):
    if "</body>" in html:
        return html.replace("</body>", laag + "\n</body>", 1)
    return html + "\n" + laag


WIKKEL_KOP = (
    "<!doctype html>\n<html lang=\"nl\">\n<head>\n<meta charset=\"utf-8\">\n"
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, "
    "viewport-fit=cover\">\n</head>\n<body>\n"
)


def test_versie(html):
    """Zoals de artifact-host het serveert: eigen wikkel eromheen."""
    if re.search(r"<html[\s>]", html, flags=re.I):
        return html
    return WIKKEL_KOP + html + "\n</body>\n</html>\n"


def main():
    args = [a for a in sys.argv[1:]]
    uit = None
    if "-o" in args:
        i = args.index("-o")
        uit = args[i + 1]
        del args[i : i + 2]
    project = os.path.abspath(args[0]) if args else os.getcwd()
    uit = uit or os.path.join(project, ".claude", "review")

    cfg = lees_config(project)
    with open(LAAG, encoding="utf-8") as f:
        laag = f.read().strip()

    html = titel_erbij(schoon(haal_app(project, cfg)), cfg["title_note"])
    review = plak(html, laag)

    os.makedirs(uit, exist_ok=True)
    p1 = os.path.join(uit, "review.html")
    p2 = os.path.join(uit, "review-test.html")
    with open(p1, "w", encoding="utf-8") as f:
        f.write(review)
    with open(p2, "w", encoding="utf-8") as f:
        f.write(test_versie(review))

    print(f"klaar — {p1} ({len(review)//1024} kB)")
    print(f"test  — {p2}")
    print(f"favicon: {cfg['favicon']}")
    print(f"artifact_url: {cfg['artifact_url'] or '(nog niet gepubliceerd)'}")


if __name__ == "__main__":
    main()
