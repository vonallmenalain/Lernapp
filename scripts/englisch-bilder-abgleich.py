#!/usr/bin/env python3
"""
englisch-bilder-abgleich.py - die gemalten Bilder der Englischecke einbauen.
---------------------------------------------------------------------------
Sucht jedes Ding der Vorlage (scripts/englisch-bilder-vorlagen.mjs) im
Gemälde: Der Ausschnitt der Zeichnung, unscharf und in Lab-Farben, wird im
Gemälde in einem Umkreis gesucht, in einigen Grössen. Daraus wird, wo die
Zeichnung des Dings sitzen muss, damit sie sich mit dem gemalten Ding deckt.
Was die Suche nicht findet, steht von Hand in englisch-bilder-korrekturen.json.

Schreibt:
  bilder/englisch/welt-<welt>.webp, welt-<welt>-klein.webp
  bilder/englisch/geschichte-<g>-<n>.webp (das Titelbild auch -klein.webp)
  englisch-gemalt.js

Aufruf:  python3 scripts/englisch-bilder-abgleich.py <vorlagen> <gemaelde> [--blatt <ordner>]
  <vorlagen>  der Ordner von englisch-bilder-vorlagen.mjs
  <gemaelde>  die Gemälde, benannt wie die Vorlagen (welt-farm.png,
              geschichte-ball-1.png ...), Wimmelbilder 16:9, Geschichten 21:9
  --blatt     zeichnet die gefundenen Rahmen auf die Gemälde, zum Nachsehen
Nötig:   pip install opencv-python-headless pillow numpy
"""
import argparse, json, os, sys
import cv2
import numpy as np
from PIL import Image, ImageDraw

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIEL = os.path.join(WURZEL, "bilder", "englisch")


def eingepasst(pfad, b, h):
    """Das Gemälde so, wie die App es zeigt: auf b x h gefüllt, die Mitte
    (preserveAspectRatio="xMidYMid slice")."""
    im = Image.open(pfad).convert("RGB")
    f = max(b / im.width, h / im.height)
    im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
    x, y = (im.width - b) // 2, (im.height - h) // 2
    return im.crop((x, y, x + b, y + h))


def lab(im):
    a = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)
    a = cv2.GaussianBlur(a, (0, 0), 3)
    return cv2.cvtColor(a, cv2.COLOR_BGR2LAB).astype(np.float32)


def suche(vorlage, gemaelde, rahmen, such=110):
    """Für jeden Rahmen (x, y, w, h) der Vorlage: (bx, by, s, wert) - wo der
    Ausschnitt im Gemälde liegt und wie viel grösser er ist."""
    a, b = lab(vorlage), lab(gemaelde)
    H, W = a.shape[:2]
    aus = []
    for (x, y, w, h) in rahmen:
        x0, y0, x1, y1 = int(max(0, x)), int(max(0, y)), int(min(W, x + w)), int(min(H, y + h))
        if x1 - x0 < 8 or y1 - y0 < 8:
            aus.append((x, y, 1.0, 0.0))
            continue
        tpl0 = a[y0:y1, x0:x1]
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        best = (-9.0, x0, y0, 1.0, 0.0)
        for s in (0.8, 0.88, 0.95, 1.0, 1.06, 1.14, 1.24):
            tw, th = max(8, int((x1 - x0) * s)), max(8, int((y1 - y0) * s))
            tpl = cv2.resize(tpl0, (tw, th))
            sx0, sy0 = int(max(0, cx - tw / 2 - such)), int(max(0, cy - th / 2 - such))
            sx1, sy1 = int(min(W, cx + tw / 2 + such)), int(min(H, cy + th / 2 + such))
            feld = b[sy0:sy1, sx0:sx1]
            if feld.shape[0] < th or feld.shape[1] < tw:
                continue
            r = cv2.matchTemplate(feld, tpl, cv2.TM_CCOEFF_NORMED)
            _, mx, _, loc = cv2.minMaxLoc(r)
            # leichte Strafe für weite Wege und starke Grössenwechsel
            d = ((sx0 + loc[0] + tw / 2 - cx) ** 2 + (sy0 + loc[1] + th / 2 - cy) ** 2) ** 0.5
            wert = mx - d / 900 - abs(s - 1) * 0.15
            if wert > best[0]:
                best = (wert, sx0 + loc[0], sy0 + loc[1], (tw / (x1 - x0) + th / (y1 - y0)) / 2, mx)
        wert, mx_, my_, s, roh = best
        # zurück auf den ganzen Rahmen (auch was über den Rand ragt)
        aus.append((mx_ + (x - x0) * s, my_ + (y - y0) * s, s, roh))
    return aus


def r1(v):
    return round(float(v), 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("vorlagen")
    p.add_argument("gemaelde")
    p.add_argument("--blatt")
    arg = p.parse_args()
    v = json.load(open(os.path.join(arg.vorlagen, "vorlagen.json"), encoding="utf-8"))
    korr = json.load(open(os.path.join(WURZEL, "scripts", "englisch-bilder-korrekturen.json"), encoding="utf-8"))
    os.makedirs(ZIEL, exist_ok=True)
    if arg.blatt:
        os.makedirs(arg.blatt, exist_ok=True)
    unsicher = []
    welten = {}
    for welt, dinge in v["welten"].items():
        quelle = os.path.join(arg.gemaelde, f"welt-{welt}.png")
        if not os.path.exists(quelle):
            continue
        bild = eingepasst(quelle, 1000, 560)
        ids = list(dinge)
        rahmen = [dinge[i][0] for i in ids]
        treffer = suche(Image.open(os.path.join(arg.vorlagen, f"welt-{welt}.png")).convert("RGB"), bild, rahmen)
        orte = {}
        for id_, (bx, by, bw, bh), (nx, ny, s, wert) in zip(ids, rahmen, treffer):
            hand = korr.get("welten", {}).get(welt, {}).get(id_)
            if hand:
                s = (hand[2] / bw + hand[3] / bh) / 2
                nx, ny = hand[0], hand[1]
            elif wert < 0.5:
                unsicher.append(f"{welt}/{id_} ({wert:.2f})")
            x, y, m = v["orte"][welt][id_]
            orte[id_] = [r1(nx + (x - bx) * s), r1(ny + (y - by) * s), round(m * s, 3), r1(nx), r1(ny), r1(bw * s), r1(bh * s)]
        welten[welt] = orte
        Image.open(quelle).convert("RGB").save(os.path.join(ZIEL, f"welt-{welt}.webp"), "WEBP", quality=80, method=6)
        bild.resize((480, 269), Image.LANCZOS).save(os.path.join(ZIEL, f"welt-{welt}-klein.webp"), "WEBP", quality=74, method=6)
        if arg.blatt:
            zeichne(bild, {k: [o[3:]] for k, o in orte.items()}, os.path.join(arg.blatt, f"welt-{welt}.jpg"))
    geschichten = {}
    for g, bilder in v["geschichten"].items():
        liste = []
        for i, woerter in enumerate(bilder):
            quelle = os.path.join(arg.gemaelde, f"geschichte-{g}-{i + 1}.png")
            if not os.path.exists(quelle):
                liste = None
                break
            # im doppelten Mass suchen, im einfachen eintragen
            bild = eingepasst(quelle, 944, 408)
            stellen = [(w, k, r) for w, rr in woerter.items() for k, r in enumerate(rr)]
            treffer = suche(Image.open(os.path.join(arg.vorlagen, f"geschichte-{g}-{i + 1}.png")).convert("RGB"), bild,
                            [[c * 2 for c in r] for _, _, r in stellen])
            aus = {}
            for (w, k, (bx, by, bw, bh)), (nx, ny, s, wert) in zip(stellen, treffer):
                hand = korr.get("geschichten", {}).get(g, {}).get(str(i + 1), {}).get(w)
                if hand:
                    r = hand[k]
                else:
                    if wert < 0.5:
                        unsicher.append(f"{g}-{i + 1}/{w} ({wert:.2f})")
                    r = [nx / 2, ny / 2, bw * s, bh * s]
                # im Bild halten
                x0, y0 = max(0, r[0]), max(0, r[1])
                x1, y1 = min(472, r[0] + r[2]), min(204, r[1] + r[3])
                aus.setdefault(w, []).append([r1(x0), r1(y0), r1(x1 - x0), r1(y1 - y0)])
            liste.append(aus)
            Image.open(quelle).convert("RGB").save(os.path.join(ZIEL, f"geschichte-{g}-{i + 1}.webp"), "WEBP", quality=78, method=6)
            if i == v["titelbild"].get(g, 0):
                eingepasst(quelle, 560, 242).save(os.path.join(ZIEL, f"geschichte-{g}-{i + 1}-klein.webp"), "WEBP", quality=74, method=6)
            if arg.blatt:
                zeichne(bild, {w: [[c * 2 for c in r] for r in rr] for w, rr in aus.items()}, os.path.join(arg.blatt, f"geschichte-{g}-{i + 1}.jpg"))
        if liste:
            geschichten[g] = liste
    schreibe(welten, geschichten)
    print(f"{len(welten)} Wimmelbilder, {sum(len(x) for x in geschichten.values())} Geschichtenbilder eingebaut.")
    if unsicher:
        print("Bitte nachsehen (Suche unsicher): " + ", ".join(unsicher))


def zeichne(bild, rahmen, pfad):
    im = bild.copy()
    d = ImageDraw.Draw(im)
    for id_, rr in rahmen.items():
        for (x, y, w, h) in rr:
            d.rectangle([x, y, x + w, y + h], outline=(255, 0, 170), width=3)
            d.rectangle([x, y, x + 7 * len(id_) + 6, y + 14], fill=(255, 0, 170))
            d.text((x + 3, y + 1), id_, fill="white")
    im.save(pfad, quality=85)


def schreibe(welten, geschichten):
    zeilen = [
        "/*",
        " * englisch-gemalt.js - wo in den gemalten Bildern der Englischecke was steht.",
        " *",
        " * Geschrieben von scripts/englisch-bilder-abgleich.py - nicht von Hand",
        " * ändern; was die Suche nicht findet, steht in",
        " * scripts/englisch-bilder-korrekturen.json. Die Bilder liegen in",
        " * bilder/englisch/. Wie es gelesen wird: englisch-art.js, GEMALT.",
        " *   WELTEN[welt][id]          [x, y, m, bx, by, bw, bh]",
        " *   GESCHICHTEN[g][i][wort]   [[bx, by, bw, bh], ...]",
        " */",
        "(() => {",
        '"use strict";',
        "const G = window.LernappEnglischArt?.GEMALT;",
        "if (!G) return;",
        "const WELTEN = {",
    ]
    for welt, orte in welten.items():
        zeilen.append(f"  {welt}: {json.dumps(orte, separators=(',', ':'))},")
    zeilen.append("};")
    zeilen.append("const GESCHICHTEN = {")
    for g, liste in geschichten.items():
        zeilen.append(f"  {g}: {json.dumps(liste, separators=(',', ':'))},")
    zeilen += [
        "};",
        "for (const [welt, orte] of Object.entries(WELTEN)) G.welten[welt] = { orte };",
        "for (const [g, bilder] of Object.entries(GESCHICHTEN)) G.geschichten[g] = bilder.map((woerter) => ({ woerter }));",
    ]
    # Den Block der Sticker (scripts/englisch-sticker-schneiden.py) behalten.
    pfad = os.path.join(WURZEL, "englisch-gemalt.js")
    alt = open(pfad, encoding="utf-8").read() if os.path.exists(pfad) else ""
    a, e = alt.find("// STICKER-ANFANG"), alt.find("// STICKER-ENDE")
    if a >= 0 and e > a:
        zeilen.append(alt[a:e + len("// STICKER-ENDE")])
    zeilen += ["})();", ""]
    with open(pfad, "w", encoding="utf-8") as f:
        f.write("\n".join(zeilen))


if __name__ == "__main__":
    sys.exit(main())
