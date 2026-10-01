# Mosaic

Mosaic is a desktop writing application under construction, using Electron,
TypeScript, and React.
It's the new attempt at getting the philosophies of Fractal and Amanite into reality. *Implicit Linking, Just Write*. *Your Data, Always Transformable*

Product direction and unresolved decisions are in [PLAN.md](PLAN.md).

## Run it

Requires Node.js 22.12 or newer and pnpm 10.29.3, declared in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Vite updates the renderer while developing. After changing Electron code or its
build script, stop and restart `pnpm dev`. Development uses port 5173 and
fails if that port is occupied.

## Check and run the build

```sh
pnpm check
pnpm start
```

`check` runs TypeScript checking and builds both processes. `start` opens the
built application without a development server. These commands check the
scaffold; product behavior will need its own verification as it is implemented.

## Read the code

| File | Responsibility |
| --- | --- |
| `electron/main.ts` | Creates the window, loads the renderer, and handles application lifecycle |
| `electron/preload.ts` | Exposes only minimize, maximize/restore, and close commands to the renderer |
| `src/shared/window.ts` | Defines the window-control interface shared by preload and renderer |
| `src/renderer/main.tsx` | Mounts the title bar inside React's development checks |
| `src/renderer/TitleBar.tsx` | Renders the title and custom window-control buttons |
| `src/renderer/styles.css` | Sets the dark page colors and draggable title-bar area |
| `src/renderer/global.d.ts` | Adds the preload interface to TypeScript's Window type |
| `index.html` | Supplies the renderer's HTML entry point |
| `scripts/build-electron.mjs` | Compiles main and preload into CommonJS for Electron |
| `scripts/run-electron.mjs` | Launches Electron in development or built mode and forwards shutdown signals |
| `vite.config.ts` | Configures the renderer's development server and build |
| `tsconfig.json` | Configures strict TypeScript checking |

The renderer has no Node access. Context isolation and sandboxing are enabled.
Window controls cross a small preload bridge into the main process, which acts
on the requesting window. The bridge exposes three commands, not general IPC
or filesystem access.
