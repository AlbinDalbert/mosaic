import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const electronPath = require('electron');
const environment = { ...process.env };

delete environment.ELECTRON_RUN_AS_NODE;
if (process.argv.includes('--dev')) {
  environment.MOSAIC_DEV_SERVER_URL = 'http://127.0.0.1:5173';
} else {
  delete environment.MOSAIC_DEV_SERVER_URL;
}

const child = spawn(electronPath, ['.'], {
  env: environment,
  stdio: 'inherit',
  windowsHide: false,
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('error', (error) => {
  console.error('Failed to launch Electron.', error);
  process.exit(1);
});

child.on('close', (code, signal) => {
  if (code === null) {
    console.error(`Electron exited with signal ${signal ?? 'unknown'}.`);
    process.exit(1);
  }
  process.exit(code);
});
