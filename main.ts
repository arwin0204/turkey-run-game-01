// Gobble Dash — a turkey escape game for make.fun's turkey-run-game-01.
// Node 22, standard library only. The program hands the entry in: it
// copies this repository's game/ and screenshots/ beside this file into
// /output (or MAKEFUN_OUTPUT_DIR outside the grader) and writes
// /output/dossier.json with the vendored make.fun library, so the sealed
// scorer can check the game, its screenshots and the dossier byte for byte.
//
// Run it yourself the same way the grader does:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast with a plain message when the game is missing its page, rather
// than letting the dossier builder report it three steps later.
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error('Gobble Dash: game/index.html is missing — the game has no page to hand in.');
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's own caps, passed through so this program refuses exactly what
// the scorer would refuse: at most 4 screenshots of 256 KiB each, game/
// at most 993 entries and 48 MiB with paths of at most 1000 bytes, and a
// dossier text of at most 160 KiB.
const dossierPath = join(out, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// A one-line receipt on stdout, so a run's log shows what it handed in.
const shotNames = readdirSync(join(out, 'screenshots')).sort().join(', ');
console.log(
  `Gobble Dash handed in: game/ + screenshots/ (${shotNames}) + dossier.json ` +
  `(${statSync(dossierPath).size} bytes) -> ${out}`,
);
