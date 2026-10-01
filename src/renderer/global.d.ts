import type { MosaicWindowApi } from '../shared/window';

declare global {
  interface Window {
    mosaicWindow: MosaicWindowApi;
  }
}
