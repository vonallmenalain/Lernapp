#!/usr/bin/env python3
"""
englisch-sticker-schneiden.py - die gemalten Sticker der Englischecke einbauen.
---------------------------------------------------------------------------
Die Sticker, die Aufnäher und das Wörterbuch werden als Bögen gemalt: je
Bogen 4 x 4 Felder zu 256 x 256 Pixeln, durchsichtiger Hintergrund (die
Vorlagen schreibt scripts/englisch-bilder-vorlagen.mjs, mit boegen.json:
welcher Sticker in welchem Feld steht). Dieses Skript schneidet jedes Ding aus
seinem Feld (was im Feld undurchsichtig ist, gehört dazu), rückt es in ein
Quadrat und schreibt:

  bilder/englisch/sticker/<id>.webp       je Wort ein Sticker
  bilder/englisch/aufnaeher/<welt>.webp   je Welt ein Aufnäher
  bilder/englisch/woerterbuch.webp        das aufgeschlagene Buch
  englisch-gemalt.js                      der Block STICKER (was es gibt)

Aufruf:  python3 scripts/englisch-sticker-schneiden.py <vorlagen> <boegen> [--blatt <datei>]
  <vorlagen>  der Ordner von englisch-bilder-vorlagen.mjs (boegen.json)
  <boegen>    die gemalten Bögen: bogen-<name>.png (durchsichtig), buch.png;
              ein Bogen bogen-<name>.png mit einer Liste in nachtraege.json
              ersetzt einzelne Sticker ({"eltern": ["mom", "dad"]})
  --blatt     legt alle Sticker zum Nachsehen auf ein Blatt
Nötig:   pip install opencv-python-headless pillow numpy
"""
import argparse, json, os, re, sys
import cv2
import numpy as np
from PIL import Image

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIEL = os.path.join(WURZEL, "bilder", "englisch")
FELD = 256
GROESSE = 256  # so gross ist ein Sticker
RAND = 12      # Luft im Quadrat


def ausschneiden(pfad, anzahl):
    """Die Dinge eines Bogens, Feld für Feld: [RGBA-Bild oder None]."""
    a = np.array(Image.open(pfad).convert("RGBA")).astype(np.float32)
    alpha = a[:, :, 3]
    # Ein Hintergrund, der nicht ganz durchsichtig ist (leicht getönt), fällt weg.
    rand = np.concatenate([alpha[:4].ravel(), alpha[-4:].ravel(), alpha[:, :4].ravel(), alpha[:, -4:].ravel()])
    grund = float(np.median(rand))
    if grund > 8:
        alpha = np.clip((alpha - grund - 10) * 255.0 / (255.0 - grund - 10), 0, 255)
    a[:, :, 3] = alpha
    maske = (alpha > 90).astype(np.uint8)
    n, marken, werte, mitten = cv2.connectedComponentsWithStats(maske, connectivity=8)
    felder = [[] for _ in range(16)]
    for k in range(1, n):
        if werte[k, cv2.CC_STAT_AREA] < 40:
            continue
        cx, cy = mitten[k]
        felder[int(cy // FELD) * 4 + int(cx // FELD)].append(k)
    aus = []
    for f in range(anzahl):
        teile = felder[f]
        if not teile:
            aus.append(None)
            continue
        drin = np.isin(marken, teile).astype(np.uint8)
        drin = cv2.dilate(drin, np.ones((7, 7), np.uint8))  # weiche Kanten dazu
        ys, xs = np.nonzero(drin)
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        stueck = a[y0:y1, x0:x1].copy()
        stueck[:, :, 3] *= drin[y0:y1, x0:x1]
        bild = Image.fromarray(stueck.clip(0, 255).astype(np.uint8), "RGBA")
        f_ = min((GROESSE - 2 * RAND) / bild.width, (GROESSE - 2 * RAND) / bild.height)
        bild = bild.resize((max(1, round(bild.width * f_)), max(1, round(bild.height * f_))), Image.LANCZOS)
        quadrat = Image.new("RGBA", (GROESSE, GROESSE), (0, 0, 0, 0))
        quadrat.alpha_composite(bild, ((GROESSE - bild.width) // 2, (GROESSE - bild.height) // 2))
        aus.append(quadrat)
    return aus


def main():
    p = argparse.ArgumentParser()
    p.add_argument("vorlagen")
    p.add_argument("boegen")
    p.add_argument("--blatt")
    arg = p.parse_args()
    boegen = json.load(open(os.path.join(arg.vorlagen, "boegen.json"), encoding="utf-8"))
    nachtraege = {}
    pfad = os.path.join(arg.boegen, "nachtraege.json")
    if os.path.exists(pfad):
        nachtraege = json.load(open(pfad, encoding="utf-8"))
    os.makedirs(os.path.join(ZIEL, "sticker"), exist_ok=True)
    os.makedirs(os.path.join(ZIEL, "aufnaeher"), exist_ok=True)
    sticker, aufnaeher, fehlen = {}, {}, []
    reihe = [(b["name"], b["ids"], b.get("aufnaeher", False)) for b in boegen]
    reihe += [(name, ids, False) for name, ids in nachtraege.items()]
    for name, ids, ist_aufnaeher in reihe:
        quelle = os.path.join(arg.boegen, f"bogen-{name}.png")
        if not os.path.exists(quelle):
            continue
        for id_, bild in zip(ids, ausschneiden(quelle, len(ids))):
            if bild is None:
                fehlen.append(f"{name}/{id_}")
                continue
            (aufnaeher if ist_aufnaeher else sticker)[id_] = bild
    for id_, bild in sticker.items():
        bild.save(os.path.join(ZIEL, "sticker", f"{id_}.webp"), "WEBP", quality=82, method=4)
    for id_, bild in aufnaeher.items():
        bild.save(os.path.join(ZIEL, "aufnaeher", f"{id_}.webp"), "WEBP", quality=82, method=4)
    buch = os.path.join(arg.boegen, "buch.png")
    if os.path.exists(buch):
        Image.open(buch).convert("RGB").resize((1344, 752), Image.LANCZOS).save(os.path.join(ZIEL, "woerterbuch.webp"), "WEBP", quality=80, method=6)
    # Eingetragen wird alles, was in den Ordnern liegt – auch, was ein früherer
    # Lauf geschnitten hat (der Französischwagen malt nur seine neuen Wörter).
    alle = lambda ordner: sorted(n[:-5] for n in os.listdir(os.path.join(ZIEL, ordner)) if n.endswith(".webp"))
    schreibe(alle("sticker"), alle("aufnaeher"), os.path.exists(os.path.join(ZIEL, "woerterbuch.webp")))
    if arg.blatt:
        alle = list(sticker.items()) + list(aufnaeher.items())
        blatt = Image.new("RGBA", (16 * 130, ((len(alle) + 15) // 16) * 130), (190, 120, 200, 255))
        for i, (_, bild) in enumerate(alle):
            blatt.alpha_composite(bild.resize((128, 128)), ((i % 16) * 130, (i // 16) * 130))
        blatt.convert("RGB").save(arg.blatt, quality=85)
    print(f"{len(sticker)} Sticker, {len(aufnaeher)} Aufnäher eingebaut.")
    if fehlen:
        print("Leer geblieben: " + ", ".join(fehlen))


ANFANG, ENDE = "// STICKER-ANFANG", "// STICKER-ENDE"


def block(sticker, aufnaeher, buch):
    return "\n".join([
        ANFANG,
        "// Gemalt: die Sticker (bilder/englisch/sticker/<id>.webp), die Aufnäher",
        "// (bilder/englisch/aufnaeher/<welt>.webp) und das Wörterbuch",
        "// (bilder/englisch/woerterbuch.webp) - geschrieben von",
        "// scripts/englisch-sticker-schneiden.py.",
        f"G.sticker = new Set({json.dumps(sticker, separators=(',', ':'))});",
        f"G.aufnaeher = new Set({json.dumps(aufnaeher, separators=(',', ':'))});",
        f"G.woerterbuch = {'true' if buch else 'false'};",
        ENDE,
    ])


def schreibe(sticker, aufnaeher, buch):
    pfad = os.path.join(WURZEL, "englisch-gemalt.js")
    text = open(pfad, encoding="utf-8").read()
    neu = block(sticker, aufnaeher, buch)
    if ANFANG in text:
        text = re.sub(re.escape(ANFANG) + r".*?" + re.escape(ENDE), lambda _: neu, text, flags=re.S)
    else:
        text = text.replace("})();\n", neu + "\n})();\n")
    open(pfad, "w", encoding="utf-8").write(text)


if __name__ == "__main__":
    sys.exit(main())
