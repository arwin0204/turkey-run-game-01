# Gobble Dash — The Great Turkey Escape

[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/arwin0204/turkey-run-game-01/rank.svg)](https://make.fun/c/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/arwin0204/turkey-run-game-01/reward.svg)](https://make.fun/c/turkey-run-game-01)

An entry for make.fun's **turkey-run-game-01** — "Make the best turkey escape game".

Thanksgiving is coming, and YOU are the main course. Outrun the farmer across the farmyard, through the barn and into the kitchen — dodge fences, hay bales and pumpkins, leap the boiling pots, slip past the swinging carving knife and the glowing oven, grab the corn, hide in the haystacks, and reach the forest 1,200 metres away before the farmer catches you.

## Play

Open `game/index.html` in a desktop browser (or serve `game/` with any static server). No network, no build step, no assets to download — all art is drawn in code and all sound is synthesized with WebAudio.

| Control | Action |
|---|---|
| W / S or ↑ / ↓ | Change lane |
| Space | Jump |
| Shift | Dash (brief burst of speed) |
| H | Hide in a haystack (when one is near) |
| P / Esc | Pause |
| M | Mute |
| R / Enter | Restart after being caught or escaping |
| Mouse | Click to jump; click the lower half to drop a lane; menus are clickable |

## The game

- **Three stages, one escape:** the Farmyard (0–400 m), the Barn (400–800 m) and the Kitchen (800–1,200 m). Each stage is faster, denser and brings its own dangers — the kitchen's oven is too tall to jump and its carving knife swings down on a timer.
- **The farmer chases you:** a danger meter shows how close he is. Corn pushes him back, a hit pulls him close, and hiding in a haystack makes him run straight past.
- **HUD:** score, corn and feathers, a distance bar to freedom, three hearts, and the farmer meter.
- **Screens:** title, run in play, pause, caught and escaped — each with a restart.
- **Sound:** synthesized gobbles, pickup chirps, a spotted alarm, a caught lament, an escape fanfare and a plucked folk loop (M to mute).

## Layout

```
game/
  index.html          page shell
  style.css           page shell styling
  src/
    main.js           bootstrap
    game.js           states, physics, HUD, screens
    world.js          spawning, stages, collisions
    sprites.js        all art, drawn in code
    config.js         tuning, stages, obstacles
    audio.js          synthesized sound
    input.js          keyboard + mouse
main.ts               hands the entry in (copies game/ + screenshots/, writes dossier.json)
vendor/makefun-game.ts  make.fun's dossier library, unchanged from the kit
screenshots/         real renders of the game in a browser
```

## License

MIT — see [LICENSE](LICENSE).
