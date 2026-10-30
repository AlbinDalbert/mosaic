// A folder opened in Mosaic. Paths are relative to the opened folder, joined
// with '/', and are the only way the renderer refers to files.
export type ProjectEntry =
  | { kind: 'folder'; name: string; path: string; children: ProjectEntry[] }
  | { kind: 'document'; name: string; path: string };

export interface Project {
  name: string;
  entries: ProjectEntry[];
}

export interface MosaicProjectApi {
  // Asks for a folder and opens it; null if the dialog was cancelled.
  open(): Promise<Project | null>;
  // Reads a document from the opened folder.
  readDocument(path: string): Promise<string>;
}
