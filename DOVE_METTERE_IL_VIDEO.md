# Dove mettere il video

La cartella `public` potrebbe non essere visibile nel pannello file di Cursor.

**Usa invece la cartella `download`** (alla radice del progetto, stesso livello di `src`):

```
run-club-giovinazzo/
├── download/          ← METTI IL VIDEO QUI
│   └── kling_20260828_VIDEO_Cinematic__4944_0.mp4
├── src/
├── package.json
└── ...
```

## Passi

1. Apri il pannello file a sinistra in Cursor
2. Cerca la cartella **`download`**
3. Trascina il file `.mp4` dentro
4. Ricarica il sito

Il video apparirà come sfondo dietro "run together".
