import type { MosaicProjectApi } from '../shared/project';
import type { MosaicWindowApi } from '../shared/window';

declare global {
  interface Window {
    mosaicWindow: MosaicWindowApi;
    mosaicProject: MosaicProjectApi;
  }
}
