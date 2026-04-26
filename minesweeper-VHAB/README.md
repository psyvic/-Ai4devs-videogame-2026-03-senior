# Minesweeper VHAB - Local Development

This project should be run from a local HTTP server (not `file://`) so JavaScript modules and asset loading work correctly.

## Run with Python

From this directory:

```bash
python3 -m http.server 8000
```

Then open:

- http://localhost:8000

## Project Layout

- `index.html` - page + Phaser CDN include
- `main.js` - Phaser game bootstrap
- `assets/images/` - image assets
- `assets/audio/` - audio assets
