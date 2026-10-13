# Mosaic implementation plan

Created: 2026-09-26. Design direction merged in: 2026-10-13.
Status: living technical direction. No document behavior or performance
acceptance is claimed.

[CONTEXT.md](CONTEXT.md) holds Mosaic's ethos and priority hierarchy. It changes
rarely and governs every tradeoff here. This plan records how Mosaic is built:
settled decisions, architecture rules, the direction for upcoming work, open
questions, and progress. It is expected to change as work proceeds. Keeping a
capability in scope here does not give it equal priority or authorize it to
disrupt a higher priority capability.

## 1. Working from this plan

Mosaic is a new desktop writing application that combines the useful parts of
Amanite and Fractal. It starts in a new repository so their existing boundaries
do not dictate its architecture. Reuse substantial code where it fits; do not
copy either application's architecture wholesale.

The user is keeping Fractal's structural philosophy and Amanite's broader
writing capabilities, and is redesigning the interface after experiencing Neo's
focused writing workflow. This is not an abandonment of structured projects, a
Neo clone, or a cosmetic refresh of Amanite. Neo is a reference for product
scope, writing interactions, and how little an ordinary editing operation needs
to involve.

The sibling repositories are sources of code and evidence, not additional
implementation requirements. Amanite's
`docs/document-runtime-replacement-plan.md` describes useful findings but is not
Mosaic's roadmap. Do not complete that migration as a prerequisite for Mosaic.

### Instructions for implementation agents

1. Read CONTEXT.md, this document, and the repository AGENTS.md before
   implementing behavior.
2. Distinguish settled decisions, proposed designs, and unresolved questions.
3. Implement the requested behavior in a small, complete change and verify it.
   This plan does not authorize implementing features ahead of the user's work.
4. Keep correctness requirements when simplifying code. Do not silently remove
   recovery or overwrite protection to achieve a performance target.
5. Do not recreate old synchronization layers under new names.
6. Do not change settled product decisions merely because an alternative is
   easier to implement. Record a concrete problem and request a decision.
7. Mark work complete only with evidence. A passing build is not proof of
   responsive editing, safe persistence, or a good writing experience.
8. Update the progress record with implementation, tests, limitations, and the
   next bounded task. Keep this plan self-contained for subsequent agents.

### Delivery approach

Implementation proceeds in small changes that the user can understand and
review. Proof-of-concept features, mocks, placeholder services, and speculative
abstractions are not part of this approach. The earlier prototype has been
archived and removed; it is not the starting point for feature development.

For each agreed behavior:

1. State what the user should be able to do and how to verify it.
2. Review the relevant product decisions and explain where the state belongs.
3. Implement the behavior without temporary mocks or speculative interfaces.
4. Verify the behavior and explain the changed code together.
5. Record the result and any concrete unresolved issue.

The intended work includes document format and editing, persistence and
recovery, structured projects and links, the writing workflow, headless
commands, and release packaging. These are areas of work, not permission to
implement several systems at once.

## 2. Settled decisions

These decisions come from the user and are not open technology-selection tasks.

| Decision | Meaning |
| --- | --- |
| Product name | Mosaic |
| Desktop stack | Electron, TypeScript, React |
| Package manager | pnpm; Electron retains its bundled Node.js and Chromium runtimes |
| Initial appearance | Dark native theme and renderer, with a custom title bar and window controls |
| Initial language scope | No Rust or Tauri dependency; justify any future native component separately |
| Product priority | Desktop writing first; headless support is secondary |
| Headless authority | Same editing rules and authority as the desktop, not a separate disk-editing engine |
| Document ownership | Exactly one live editable instance of a document per owning application session |
| Duplicate opening | Focus and reveal the existing location; never create a second editor for the same document |
| Title semantics | Changing a document title is renaming the document; keep title-derived filenames |
| Compatibility | Treat Mosaic as a new major version; old Fractal projects may fail to load |
| Format freedom | Backward compatibility must not block a better design; do not build a migration layer by default |
| Storage format | Markdown documents in structured folders that remain useful outside the app; HTML is an export target (see section 8) |
| Concurrent editing | No automatic merging of independently edited document sections is required |
| Code reuse | Copy useful implementation and tests selectively from Amanite and Fractal |
| UI direction | Redesign around writing tasks; existing panels, tabs, and controls are not requirements |
| Vocabulary | Very slim support with high reliability; a limited document vocabulary can be permanent |

One-editor ownership and dropping section merging are separate simplifications.
The first removes duplicate live-editor synchronization. The second removes the
requirement to merge independent disk edits automatically.

## 3. What went wrong before

CONTEXT.md tells the story of Fractal and Amanite and its lesson. This section
records the technical detail behind it.

Amanite has recurring reports of buffered typing, caret jumps, and pauses that
grow with document size. Fixes to individual paths did not establish a
consistently responsive document lifecycle. The inspected implementation
contains several sources of complexity:

- Lexical state coexists with source buffers, snapshots, and migration bridges.
- Fractal can mutate saved documents that Amanite separately owns in memory.
- Ordinary section writes reload the project before and after committing.
- Saving several changed sections requires several operations and partial-save
  bookkeeping in the application.
- Mutation responses include project and active-document content state.
- External-change polling can refresh the whole project.
- Structural changes can require disk-to-editor reconciliation for open pages.

These are observed code paths, not a measured explanation of every stall.
The old three-second polling interval matches one reported rhythm, but that
alone does not establish causation. Preserve representative failing fixtures
and measure Mosaic rather than assuming Electron fixes the problem.

Neither Lexical, HTML, nor Rust has been established as the cause. The old
split added duplicate representations, cross-language interfaces, and ownership
coordination. Electron still has process boundaries and serialization costs.
Keep large recurring work off the typing path regardless of language.

## 4. Scope

### Keep as intended capabilities

- Documents that remain inspectable and useful outside the app.
- Projects with a folder tree, explicit child order, and writing across a
  collection of documents.
- Title-driven document renaming and managed moves.
- Explicit links, backlinks, and derived links from unambiguous title matches.
- Rich writing, document find/replace, project search, references, and export.
- Modest AI assistance that uses explicit document queries and editing commands
  where editing is supported. Do not build a second AI-owned content model.
- Autosave, recoverable drafts, safe close behavior, and visible save failures.
- Safe structural operations that preserve links and ordered collections.
- Secondary headless operation with the same document rules.

Keeping a capability does not require keeping its old UI or implementation, and
the initial changes need not implement all capabilities simultaneously.
Organizational conveniences must earn their complexity. A basic file tree is
Kernal, but elaborate folder views, manual ordering, panels, and workspace
arrangements are not prerequisites for establishing the editing experience.

### Remove as requirements

- A separately authoritative, independently published Fractal library/CLI
  through which every interactive edit must persist.
- Multiple simultaneously editable instances of the same document.
- Automatic merging of external edits to different document sections.
- Seamless concurrent writing by unrelated applications.
- Full-project refreshes around ordinary content saves.
- Independently editable source and rich-text representations of one document.
- Saving title, body, style, and metadata as separately acknowledged operations.
- Old-format compatibility and automatic conversion of existing projects.
- Preserving the old Amanite workspace arrangement.

### Review when designing interactions

Existing editor groups, tabs, reference inspectors, and health panels must earn
their place in the new workflow. Preserve useful tasks, not control layouts.

Neo's placeholders, notes, removed-passage storage, outlining, and repeated-Enter
gestures are design references. They are not an approved feature checklist.
Test proposed interactions with actual prose and structured projects before
making them permanent. In particular, chapter-specific Enter behavior may not
fit every kind of document Mosaic supports.

## 5. Architecture rules

### One authoritative live document

An open document has one live model, stable identity, edit revision, and history.
Its path is a mutable address. A rename must not recreate the document or reset
its selection just because a React key changed.

React displays subscribed state and issues commands. Component mounting and
effects must not determine persistence correctness or document ownership.

A separately loaded or validated saved document must not become a competing
authority that the editor continually reconciles with. Serialized content is
persistence output. It may be retained for explicit baseline or recovery
purposes, but it is a capture, not a second editable model.

### Saving data flow

```text
Live document -> captured revision -> safe file persistence
                                          |
                               success or failure acknowledgement
                                          |
                               persistence status in the session
```

Saving captures a consistent document revision and persists that capture. The
acknowledgement identifies what reached storage and changes persistence
bookkeeping only. It does not reinstall content, recreate the editor, or reset
selection and history. Acknowledging revision N leaves any newer revision
pending. An unsaved revision is normal; its status must be understandable.

Typing must not synchronously export the full document, perform filesystem work,
or wait for a project scan or link index. Choosing an autosave timer alone does
not establish that expensive work stays off the typing path; measure it.

### Initial editor candidate

Lexical is the initial candidate, not a user-mandated permanent choice. Review
the editor integration against actual writing and save behavior when
implementing editing. Reuse useful nodes and commands without copying old
ownership machinery.

Lexical supports headless state operations through `@lexical/headless`. Verify
Markdown conversion with the actual nodes, including preservation of
unsupported content; do not assume headless state support makes every
browser-dependent plugin usable in Node.

Do not build a source-text editor with hidden markup as an assumed
implementation. Markdown storage does not imply one, and Neo does not use one:
it edits browser DOM and serializes HTML; its active-paragraph drop-cap
behavior is presentation. A source-backed editor would be a separate proposal
with substantial editing and selection-mapping requirements.

### Command and persistence separation

```text
Desktop UI                         Secondary headless interface
     |                                         |
     +---------- document/project commands ----+
                           |
                 Owning application session
                 live documents and history
                           |
                  capture a saved revision
                           |
                     file persistence
                           |
                         files
```

This describes ownership, not a mandatory class hierarchy or event framework.
Use small typed interfaces. Do not introduce a generic event bus, plugin system,
CRDT, or command-sourcing platform to implement it.

### Electron responsibilities

Proposed allocation, to review as each responsibility is implemented:

| Area | Responsibility |
| --- | --- |
| Renderer | React UI, mounted editor, live document sessions and editing commands |
| Main process | Window/application lifecycle, project ownership, narrow filesystem services |
| Shared TypeScript modules | Format rules, command logic where environment-independent, validation and result types |
| Workers/utility processes when justified | Measured expensive derived or persistence work using immutable captures |

Keep the renderer behind a narrow preload bridge with context isolation. Do not
grant arbitrary filesystem access to UI content. The main process persists
captures; it must not hold a competing editable copy of each open document.

Do not route ordinary keystrokes through IPC. Moving serialization to a timer
does not move it off the renderer thread. Worker preparation and transfer costs
count toward foreground responsiveness.

### Headless operation

Headless is another entry point into the same rules and commands. It must not
silently gain permission to bypass validation, conflict handling, or recovery.

- Without a desktop owner, a headless process can own the project and load,
  edit, and persist documents using the shared implementation.
- With a desktop owner, commands must reach that owner if supported. Until
  routing exists, refuse concurrent ownership with a clear explanation.
- Do not run a second independent writer against files behind the live editor.
- Reading disk does not expose unsaved desktop edits. A command targeting a live
  document must query or operate on its owning session.

Implement headless support when its scope is agreed, using the same semantics.
Do not make a daemon, public protocol, or CLI compatibility promise a
prerequisite for the desktop product.

## 6. Persistence and external changes

Keeping the editor small does not remove safe writes, recovery, or overwrite
protection. These are part of trustworthy writing.

### Ordinary saving

One save captures a consistent document and revision, validates and encodes it,
and persists it through one document-save operation. Preserve untouched format
content according to the format contract.

Acknowledgements contain the committed revision, baseline information, and any
relevant path changes. They cannot replace live editor content. Saving revision
N while the user reaches N+1 must leave N+1 pending and preserve current history.

Keep at most one conflicting write in flight per document and coalesce pending
requests. Acknowledging an older save must not clear newer dirty state or delete
a newer recovery draft. Slow storage must not create an unbounded queue.

Normal saving must not require scanning all projects, serializing all open
documents, or rebuilding the entire catalog. Derived indexes are disposable
read models, not prerequisites for reporting a successfully persisted document.

### Filesystem safety

Retain safe writes and explicit recovery. Evaluate a staged single-file
replacement for ordinary saves and recoverable grouped operations for changes
that affect multiple files. Verify platform behavior and durability claims.
Do not equate a direct overwrite with an atomic or crash-safe write.

Project ownership coordinates Mosaic processes. Advisory locks do not stop
arbitrary external editors. Baseline checks detect stale content, but do not
provide a universal atomic compare-and-swap against noncooperating writers.
Document the supported concurrency policy honestly.

Exact hash granularity and lock implementation are open implementation choices.
Section merging is not required. Retain sufficient baseline information to avoid
silently overwriting a detected external change.

### External changes

Proposed initial policy: notify and offer explicit resolution for open
documents. Keep local work recoverable. Never install external content into an
actively edited document as a background side effect.

Observe relevant files without routinely reloading the complete project.
Own writes must not generate false conflicts. File observation is a notification
mechanism, not a second document owner or a guarantee against races.

### Recovery and close

Failures remain visible, and writing remains recoverable. Recovery records must
identify what revision actually reached storage. Keep recovery data until a
save or explicit discard makes it safe to remove.

Close settles composition, captures a finite final revision, and waits for the
required persistence or an explicit discard decision. Failure leaves the
document available. Do not depend on fire-and-forget unload handlers.

Timing policies for autosave and recovery are to be chosen and measured. Do not
inherit deadlines from Amanite without checking their cost and actual completion.

## 7. Titles, moves, links, and collections

Title changes remain file renames. Do not reopen this product decision as an
automatic simplification. Title keystrokes need not perform filesystem renames
individually; specify a deliberate title-commit interaction.

A structural command operates through the same owner as editing:

1. Determine the affected documents and folder metadata.
2. Use live models for open documents. Load closed documents as needed.
3. Plan title/path/link/order changes and preserve unsaved content.
4. Apply the chosen command with explicit undo and failure semantics.
5. Persist affected files using recoverable ordering or a grouped transaction.
6. Update addresses and derived information without recreating editors.

The ordering of live changes versus durable commit requires a concrete design
and tests before implementation. Briefly suspending affected edits during an
explicit structural command is acceptable if necessary and clearly presented.
Do not claim that unification makes multi-file failure handling disappear.

Undo after a rename or link rewrite must not restore stale paths. Specify and
verify history behavior rather than assuming editor-instance survival proves it.

Implicit links arise from unambiguous document-name mentions and remain derived:
recognizing a link must not insert markup into the saved prose or change the
writer's text. Implement implicit linking as its own complete behavior once
document naming and lookup exist.

## 8. Document format

Write a short new-version format specification before expanding feature work.
Decide the manifest/version marker, filename convention, document title
representation, content/style/metadata ownership, folder ordering, and links.
Define which content Mosaic supports and how unsupported content is handled
without silent destruction. Define how unrelated files in project folders are
treated.

Old Fractal projects may be rejected clearly. No compatibility layer, import
pipeline, or format migration is required unless the user later requests one.
Do not use that freedom to silently reinterpret or overwrite an old project.

Do not add a second canonical JSON document format as an implementation
shortcut. Internal captures, indexes, and recovery metadata are not separate
canonical formats. Avoid a custom canonical format unless a concrete
requirement justifies its tooling cost.

### Markdown storage, HTML export

Decided 2026-10-13: documents are stored as Markdown. HTML had been the
direction, but it is awkward to edit by hand and hard to read in Git diffs,
which matters for moving work between devices with Git. Markdown is readable
in any text editor, widely supported by other writing tools, and an existing
Markdown folder is already close to a Mosaic project. Mosaic's value lies in
its rendering, implicit linking, folder structure, and metadata.

HTML becomes an export target. For the supported vocabulary, conversion to
HTML is direct; export may also turn implicit links into real links.

Keep three responsibilities distinct:

- The durable format describes the saved writing.
- The live editing model owns ongoing changes.
- Rendering presents that writing on a particular device.

Storing Markdown does not make Mosaic a source-text editor or require a
save-and-reload feedback loop. The editor works on a structured model; Markdown
is what a save writes and what opening a document reads.

Markdown means CommonMark. Reading accepts every CommonMark spelling, such as
both `*x*` and `_x_` for italic.

Saving preserves source at block level. A block is a top-level CommonMark
unit: a paragraph, heading, list, table, code block, or similar. Each block
keeps the exact source it was read from. A save writes untouched blocks back
byte for byte and regenerates only the blocks the writer edited. This keeps Git
diffs limited to actual edits and preserves constructs outside Mosaic's
vocabulary: they are never edited, so they are never rewritten.

The format specification must settle:

- Which Markdown constructs Mosaic edits. The vocabulary starts as paragraphs,
  H1 through H3, bold, and italic.
- How an edited block is regenerated: a single house style, the file's
  detected style, or the original spelling of each surviving span; and whether
  edited paragraphs are unwrapped or re-wrapped.

## 9. Compatibility with an X3 and phone

The intended X3 project is a writing device with a close connection to the phone,
potentially using it for backend work, while retaining independent operation.
The current intention is to use Git for moving changes between devices. This
plan does not design a synchronization service or automatic merging.

The most useful shared agreement is what a document means. Shared code is a
possible consequence, not a prerequisite.

| Area | Compatibility requirement |
| --- | --- |
| Content | A small, documented vocabulary that another implementation can understand |
| Presentation | Formatting meaning survives different fonts, colors, and screen layouts |
| Identity | Document identity remains distinguishable from its mutable title and path |
| Linking | Document-name recognition follows consistent rules and remains derived |
| Persistence | Each editing owner saves revisions without creating a second live authority |

Keep document meaning independent of React components, Electron APIs, CSS, and
browser layout. Environment-independent rules can become small shared modules
when actual behavior needs them. Do not create a generic backend package or
public protocol solely for anticipated reuse. Reusing desktop UI code on the X3
is not a requirement.

An interface may display less formatting than it preserves. For example, an X3
view might not visually distinguish bold, but editing nearby text must not
silently erase it. Replacing a rich document with a plain-text projection would
violate that requirement.

If independent operation includes writing with the phone absent, the device needs
local editing, persistence, and recovery for its supported content. Ownership
handoff and competing offline revisions need an explicit policy when that
workflow is implemented. Git does not define those editing semantics.

## 10. Visual language

The interface draws on an Aperture Science-like phosphor terminal, restrained
pixel graphics, and a dedicated writing device. It currently has switchable
amber (default) and green phosphor themes defined as CSS variables in
`src/renderer/theme.css`, a hand-drawn 5×7 bitmap font for titles, and bitmap
icons. Static design explorations live in `design/`; they are references, not
specifications.

Let compact controls, lettering, and simple shapes carry the retro character.
Use pixel typography with restraint in labels and status. Choose the prose font
for sustained reading and editing; its family remains open.

The editor should have a stable writing area, clear heading levels, recognizable
bold and italic, and minimal persistent controls. Add navigation around actual
writing tasks rather than inheriting Amanite's panel arrangement.

Give implicit links a restrained treatment that remains recognizable through a
non-color cue, such as an underline. Keep keyboard focus visible. Present save
status in ordinary language, such as "Saving", "Saved", or "Couldn't save", with
an available action when something fails. Internal revisions belong in
diagnostics.

Favor stillness and predictable placement. Decorative scanlines, flicker, glow,
or motion must not compromise prose legibility or distract from typing. A
monochrome adaptation should retain meaning through typography, spacing, and
shapes. No essential action or status should depend on color.

Do not change the color palette merely to distinguish Mosaic from Neo. The
similarity was an observation, not a problem the user asked to solve.

## 11. Reuse policy

| Source | Good candidates | Do not inherit automatically |
| --- | --- | --- |
| Amanite | Editor nodes/commands, UI pieces, fixtures, search/export behavior, regression scenarios | Buffers/snapshot bridges, project publications as content transport, mounted save controllers, workspace layout |
| Fractal | Format knowledge, validation cases, path/link logic, ordering/export semantics, integrity tests | Disk-first public mutation contract, per-section commits, full reloads, Rust dependency |
| Neo | Writing workflows and concrete interaction ideas | Raw DOM editing, per-input HTML capture, save/close guarantees, chapter-specific assumptions |

Inspect copied code's dependencies and ownership assumptions. Port useful tests
as behavior checks, not assertions of old internal structure. Check licenses
and preserve required notices when copying code from any source.

Keep sibling repositories unchanged during Mosaic implementation unless the
user specifically asks for changes there.

## 12. Required evidence

Use the actual Electron desktop app. Browser-only tests cannot establish desktop
composition, lifecycle, IPC, or filesystem behavior. Choose an Electron-compatible
automation setup; Amanite's Tauri WebDriver scripts do not apply to Mosaic.

Include short prose, long prose, huge paragraphs, many small paragraphs, lists,
tables, dense links, many-page projects, and multiple open documents. Reuse the
100k, 1m, and 5m visible-character fixtures where available. Label unsupported
cases honestly rather than quietly excluding failing sizes. Slim support should
mean fewer well-verified behaviors, not weaker persistence rules.

Proposed starting performance targets, to validate against the supported matrix:

| Measure | Initial target |
| --- | --- |
| Input-to-paint | p95 at most 50 ms |
| Longest foreground stall during sustained writing and save pauses | at most 100 ms |
| Serialization or storage directly triggered synchronously by a keystroke | zero full-document exports or storage calls |
| Routine save causing editor content installation | zero |
| Unrelated open-editor content updates during typing | zero |
| Pending persistence work | bounded regardless of typing duration |

These numbers are proposed engineering targets, not user-approved guarantees
or achieved results. Record platform, hardware, build type, fixture, sample size,
median/p95/maximum latency, encoding cost, transfer cost, and confirmed recovery
lag. Run at least a 60-second typing sequence through repeated save cycles.

Correctness scenarios must include:

- Save revision N while N+1 is being typed.
- Successful saves preserve selection, composition, and undo history.
- Type and immediately close, switch document, or rename.
- Undo after save and after structural changes.
- Slow/failing storage, with failures visible and writing recoverable.
- External modifications that must not silently replace or overwrite local work.
- Own-write observations without false conflict UI.
- Duplicate-open requests without duplicate editors.
- Restart after process termination with exact recovery content.
- Rename/link rewriting with dirty affected documents.
- No growing listeners, retained closed editors, or unbounded queues.

Use deterministic core tests for ordering and failures, and desktop tests for
caret/selection, composition, and responsiveness. Do not expand the test suite
with tests that merely repeat implementation details.

## 13. Next direction

The proposed first bounded behavior is one real document that can be opened,
edited with basic formatting, saved, and reopened. Settle the small format
contract and editor integration as part of that work. Establish persistence
correctness before introducing broader project operations. Implicit linking
follows once document naming and lookup exist.

## 14. Open decisions

Resolve these when implementing the relevant behavior; retain the settled stack.

- The Markdown format specification: edited constructs and how an edited
  block's spelling and wrapping are regenerated.
- Editor choice and integration when actual editing behavior is implemented.
- Prose and utility typography within the phosphor direction.
- Title-commit interaction and structural undo behavior.
- External-change resolution details and baseline granularity.
- Autosave/recovery deadlines and durability guarantees.
- Encoding strategy for large documents if synchronous export exceeds budgets.
- Initial headless command scope and owner-routing mechanism.
- The first navigation interactions and organizational conveniences, including
  which tabs/groups and Neo-inspired writing interactions belong in the product.
- The X3's independent writing scope and phone responsibilities.
- Initial supported platforms and measured document-size expectations.

## 15. Progress record

| Date | Stage | Work and evidence | Remaining work |
| --- | --- | --- | --- |
| 2026-09-26 | Discarded prototype | A standalone HTML format and Electron + React + Lexical editor were created. They were not accepted as the foundation for Mosaic and were archived and removed on 2026-10-01. | Product and format decisions remain to be implemented through reviewed changes |
| 2026-10-01 | Scaffold reset | Retained Electron, TypeScript, React, and build/run tooling. Removed document code, editor dependencies, UI styling, preload/IPC, the provisional format contract, and demo fixture. `npm run check` and dependency-tree validation pass. Electron launches with both the built HTML and Vite renderer were checked on Linux in a virtual display: one window, empty mounted React root, context isolation and sandboxing enabled, no renderer Node access. | Choose the next small behavior with the user |
| 2026-10-01 | Window appearance and package manager | Added a dark native theme, dark initial window/renderer backgrounds, and a custom draggable title bar with minimize, maximize/restore, and close commands through a narrow preload bridge. Removed the native frame and default application menu. Migrated to pnpm 10.29.3; all 162 locked package versions match the previous npm lockfile. Frozen installation and `pnpm check` pass. Built and development Electron window controls, dark color scheme, drag-region CSS, and renderer isolation were checked on Linux/Wayland. | Add actual application behavior in a small reviewed change; other desktop platforms remain untested |
| 2026-10-01 | Default amber palette | Applied Amanite's default Ember colors from `src/styles/tokens.css` at commit `480c4a47fea0d49fefcb1147d970eb4f44e2cf6d` to the existing shell and matching Electron startup background. `pnpm check` passes; background, text, title bar, border, amber accent, and hover colors were verified in Electron on Linux/Wayland. | Continue with the next user-selected change |
| 2026-10-12 | Phosphor visual language | Replaced the Ember palette with switchable amber (default) and green phosphor themes defined as CSS variables; the choice is stored in renderer localStorage and applied before first render. Added a hand-drawn 5×7 bitmap font and bitmap icons rendered as crisp SVG, a pixel title bar with theme switch and pixel window controls, and a home screen with the pixel logo and name. Design exploration mocks are committed in `design/`. `pnpm check` passes, including new bitmap tests run with Node's built-in test runner. In built Electron on Linux/Wayland: default amber, switching to green, and green surviving a restart were checked through the DevTools protocol. | Bitmap font is uppercase-only; pixel edges are only guaranteed at whole-number display scales. File sidebar arrives with project opening |
| 2026-10-12 | Fonts and writing area | Bundled JetBrains Mono, Courier Prime, and Exo 2 through Fontsource so no fonts are fetched from the network. A title-bar selector switches the interface and writing font, with per-font weight and letter spacing, remembered in localStorage. The home screen's Write button opens an unsaved plain-text writing area with a centred 72-character column. | The theme and font switchers stay in the title bar until a settings page replaces them, so both can be tried while the choice is unsettled; the writing area saves nothing; the green theme's window background is amber until the renderer loads |
| 2026-10-13 | Planning documents | Merged DESIGN.md into this plan and reorganized it as the living technical document; CONTEXT.md remains the stable ethos and gained a short account of where Mosaic comes from. Chose CommonMark Markdown as the stored format, with HTML as an export target and block-level source preservation on save, and updated CONTEXT.md to match. | Write the Markdown format specification |

## 16. Reference material

- `../amanite/docs/document-runtime-replacement-plan.md`: failure history,
  document-ownership rules, fixtures, and prior verification gaps.
- `../amanite/src/features/workspace/documents/`: existing runtime and persistence
  work to inspect selectively, not copy as the new architecture.
- `../fractal/docs/format-contract.md` and `../fractal/src/`: prior format and
  structural behavior; backward compatibility is not required.
- `../neo/app.js`, `../neo/main.js`, and `../neo/README.md`: observed interaction
  and persistence implementation, with different product scope and guarantees.
- [Lexical headless](https://github.com/facebook/lexical/blob/main/packages/lexical-headless/README.md).
- [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model).

Reference repositories can change. Record commits when copying code or relying
on implementation findings. This plan is the starting point, not a claim that
any candidate implementation already satisfies its requirements.
