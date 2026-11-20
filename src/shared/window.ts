export interface MosaicWindowApi {
  minimize(): void;
  toggleMaximize(): void;
  close(): void;
  // Sets what runs when the window is asked to close. The window closes only
  // if it resolves true. Without a handler the window closes immediately.
  onCloseRequested(handler: () => Promise<boolean>): void;
}
