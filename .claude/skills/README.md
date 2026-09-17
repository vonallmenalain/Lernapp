# Claude-Skills in diesem Projekt

Hier liegen projektweite Skills, die Claude Code in diesem Repository
automatisch findet (Pfad `.claude/skills/<name>/SKILL.md`). Sie stehen damit
in jeder Session dieses Projekts zur Verfügung – lokal wie auch in Claude Code
im Web – ohne zusätzliche Installation.

## brag

`/brag` macht aus dem aktuellen Projekt ein kurzes, teilbares Launch-Video
(Musik, Motion, Share-Text). Das Rendering übernimmt Hyperframes.

| | |
|---|---|
| Herkunft | https://github.com/latent-spaces/brag |
| Version | 0.2.2 |
| Stand | Upstream-Commit `1f8d9ad` (17.08.2026) |
| Lizenz | MIT – siehe `brag/LICENSE` |

### Aufruf

```
/brag
/brag --tone "fake Series A launch from 2016"
/brag --voice          # Sprecherstimme, standardmäßig aus
```

Ergebnis landet in `brag-output/` (Plan, Composition-Brief, Share-Copy,
`brag.mp4`). Dieses Verzeichnis gehört nicht ins Repository.

### Voraussetzungen

- Node.js 22+
- FFmpeg auf dem PATH
- Hyperframes CLI – prüfen mit `npx hyperframes doctor`

Hinweis: Im Web-Container von Claude Code fehlt FFmpeg. `/brag` kann dort
planen und den Brief schreiben, das Rendern funktioniert aber nur lokal.

### Credits der mitgelieferten Assets

- Musik: [ende.app](https://ende.app/en) – „Happy Beats / Business Moves"
- Soundeffekte: [Kenney](https://kenney.nl/)
- Videogenerierung: [Hyperframes](https://hyperframes.ai/)

Die Musiklizenz ist upstream nicht abschließend dokumentiert
(siehe `brag/assets/music/README.md`). Vor einer Veröffentlichung der Tracks
außerhalb dieses Repositories die Bedingungen prüfen.

### Aktualisieren

```bash
git clone --depth 1 https://github.com/latent-spaces/brag /tmp/brag
rm -rf .claude/skills/brag
cp -r /tmp/brag/skills/brag .claude/skills/brag
cp /tmp/brag/LICENSE .claude/skills/brag/LICENSE
```

Danach die Versions- und Stand-Angaben oben nachführen.
