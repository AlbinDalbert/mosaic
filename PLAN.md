# Mosaic implementation plan

Created: 2026-09-26.
Status: planning. No implementation or performance acceptance is claimed.

## 1. Read this first

Mosaic is a new desktop writing application that combines the useful parts of
Amanite and Fractal. It starts in a new repository so their existing boundaries
do not dictate its architecture. Reuse substantial code where it fits; do not
copy either application's architecture wholesale.

The user is keeping Fractal's structural philosophy and Amanite's broader
writing capabilities. They are reconsidering the implementation and redesigning
the interface after experiencing Neo's focused writing workflow.

This is not an abandonment of structured projects, a Neo clone, or a cosmetic
refresh of Amanite. Neo is a reference for product scope, writing interactions,
and how little an ordinary editing operation needs to involve.

This document defines Mosaic's direction. The sibling repositories are sources
of code and evidence, not additional implementation requirements. Amanite's
`docs/document-runtime-replacement-plan.md` describes useful findings but is not
Mosaic's roadmap. Do not complete that migration as a prerequisite for Mosaic.

### Instructions for implementation agents

1. Read this document before implementing a milestone.
2. Distinguish settled decisions, proposed designs, and unresolved questions.
3. Implement the smallest complete milestone and verify its stated behavior.
4. Keep correctness requirements when simplifying code. Do not silently remove
   recovery or overwrite protection to achieve a performance target.
5. Do not recreate old synchronization layers under new names.
6. Do not change settled product decisions merely because an alternative is
   easier to implement. Record a concrete problem and request a decision.
7. Mark work complete only with evidence. A passing build is not proof of
   responsive editing, safe persistence, or a good writing experience.
8. Update the progress record with implementation, tests, limitations, and the
   next bounded task. Keep this plan self-contained for subsequent agents.

## 2. Settled decisions

These decisions come from the user and are not open technology-selection tasks.

| Decision | Meaning |
| --- | --- |
| Product name | Mosaic |
| Desktop stack | Electron, TypeScript, React |
| Initial language scope | No Rust or Tauri dependency; justify any future native component separately |
| Product priority | Desktop writing first; headless support is secondary |
| Headless authority | Same editing rules and authority as the desktop, not a separate disk-editing engine |
| Document ownership | Exactly one live editable instance of a document per owning application session |
| Duplicate opening | Focus and reveal the existing location; never create a second editor for the same document |
| Title semantics | Changing a document title is renaming the document; keep title-derived filenames |
| Compatibility | Treat Mosaic as a new major version; old Fractal projects may fail to load |
| Format freedom | Backward compatibility must not block a better design; do not build a migration layer by default |
| Storage direction | Native HTML documents and structured folders remain central |
| Concurrent editing | No automatic merging of independently edited HTML sections is required |
| Code reuse | Copy useful implementation and tests selectively from Amanite and Fractal |
| UI direction | Redesign around writing tasks; existing panels, tabs, and controls are not requirements |

One-editor ownership and dropping section merging are separate simplifications.
The first removes duplicate live-editor synchronization. The second removes the
requirement to merge independent disk edits automatically.

## 3. The problem Mosaic must solve

Amanite has recurring reports of buffered typing, caret jumps, and pauses that
grow with document size. Fixes to individual paths have not established a
consistently responsive document lifecycle.

The inspected implementation contains several sources of complexity:

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

Rust itself has not been established as the cause. The old split adds duplicate
representations, cross-language interfaces, and ownership coordination. Electron
still has process boundaries and serialization costs. Keep large recurring work
off the typing path regardless of language.

## 4. Product scope: keep, remove, and reconsider

### Keep as intended capabilities

- Native HTML documents that remain inspectable and useful outside the app.
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

Keeping a capability does not require keeping its current UI or implementation.
The initial milestones need not implement all capabilities simultaneously.

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
- Preserving the current Amanite workspace arrangement.

### Reconsider through product experiments

Existing editor groups, tabs, reference inspectors, and health panels must earn
their place in the new workflow. Preserve useful tasks, not control layouts.

Neo's placeholders, notes, removed-passage storage, outlining, and repeated-Enter
gestures are design references. They are not an approved feature checklist.
Test proposed interactions with actual prose and structured projects before
making them permanent. In particular, chapter-specific Enter behavior may not
fit every kind of document Mosaic supports.

Do not change the color palette merely to distinguish Mosaic from Neo. The
similarity was an observation, not a problem the user asked to solve.

## 5. Architecture rules

### One authoritative live document

An open document has one live model, stable identity, edit revision, and history.
Its path is a mutable address. A rename must not recreate the document or reset
its selection just because a React key changed.

React displays subscribed state and issues commands. Component mounting and
effects must not determine persistence correctness or document ownership.

Saving captures a document revision and records it. It does not reinstall
content, rebuild the editor, or publish source back into the editing model.

Serialized HTML is persistence output. It may be retained for explicit baseline
or recovery purposes, but must not become a second live editing authority.

### Initial editor candidate

Lexical is the initial candidate, not a user-mandated permanent choice. Prove it
with a small desktop experiment before porting the full editor integration.
Reuse useful nodes and commands without copying old ownership machinery.

Lexical supports headless state operations through `@lexical/headless`. HTML
import/export may need DOM facilities or an appropriate conversion environment.
Prove conversion with the actual nodes and format; do not assume headless state
support makes every browser-dependent plugin usable in Node.

Do not build a source-text editor with hidden HTML markup as an assumed Neo
implementation. Neo edits browser DOM and serializes HTML; its active-paragraph
drop-cap behavior is presentation. A source-backed editor would be a separate
proposal with substantial editing and selection-mapping requirements.

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
                 native HTML persistence
                           |
                         files
```

This describes ownership, not a mandatory class hierarchy or event framework.
Use small typed interfaces. Do not introduce a generic event bus, plugin system,
CRDT, or command-sourcing platform to implement it.

### Electron responsibilities

Proposed starting allocation, to verify in the first experiment:

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

Build only enough early headless support to prove shared semantics. Do not make
a daemon, public protocol, or CLI compatibility promise a prerequisite for the
desktop product.

## 6. Persistence and external changes

### Ordinary saving

One save captures a consistent document and revision, validates/encodes native
HTML, and persists it through one document-save operation. Preserve untouched
format content according to the new format contract.

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

Recovery records must identify what revision actually reached storage. Keep
recovery data until a save or explicit discard makes it safe to remove.

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

## 8. Format contract

Write a short new-version format specification before expanding feature work.
Decide the manifest/version marker, native filename convention, document title
representation, content/style/metadata ownership, folder ordering, and links.

Keep files understandable with ordinary HTML tools. Define which markup Mosaic
supports and how unsupported content is handled without silent destruction.
Define how unrelated files in project folders are treated.

Old Fractal projects may be rejected clearly. No compatibility layer, import
pipeline, or format migration is required unless the user later requests one.
Do not use that freedom to silently reinterpret or overwrite an old project.

Native HTML remains the intended durable document representation. Do not add a
second canonical JSON document format as an implementation shortcut. Internal
captures, indexes, and recovery metadata are not separate canonical formats.

## 9. Reuse policy

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

## 10. Milestones and exit criteria

### M0: Record the product and format contract

- Create the new-version format specification and representative fixtures.
- Record the initial external-change, title-commit, and unsupported-content policies.
- Record intended writing tasks and a minimal UI flow for testing them.
- Identify reusable code without copying entire subsystems.

Exit: remaining questions are explicit; no accidental compatibility or CLI-first
requirements remain. Desktop implementation can start without guessing format
ownership.

### M1: Prove the editor and document owner

- Scaffold Electron, TypeScript, React, and a minimal real desktop editor.
- Start with Lexical; import one native document and capture it for export.
- Implement stable document sessions and focus-existing duplicate opening.
- Retain selection/history across navigation. Keep React out of keystroke-wide
  workspace updates.
- Measure ordinary and large-document typing before adding background features.

Exit: real desktop evidence of responsive typing, correct round-trip content,
one editor per document, and stable selection/history. Record engine limitations
instead of attributing all failures to application code.

### M2: Prove saving, recovery, and external-change behavior

- Add one document-save path, bounded scheduling, and revision acknowledgements.
- Implement recovery, save failures, close barriers, and explicit external-change
  resolution.
- Instrument encoding and IPC costs; compare against M1.

Exit: sustained typing through saves retains exact text, caret, and undo; slow
or failing storage does not interrupt editing; crash recovery restores the latest
confirmed recovery revision. No ordinary save imports content into the editor.

### M3: Prove structure and shared commands

- Implement the folder tree/order and title-driven rename/move behavior.
- Maintain explicit links across changes, including dirty open documents.
- Implement one headless editing path using the shared rules and enforce
  exclusive project ownership or routing to the current owner.
- Define structural undo and multi-file recovery behavior.

Exit: rename a linked document while another affected document has unsaved
edits, then save/reopen without loss or stale references. A headless command
produces equivalent semantic results and cannot bypass desktop ownership.

### M4: Design and build the writing workflow

- Test writing, navigating a collection, and consulting references with real
  material. Use Neo as a concrete reference for interaction quality.
- Build the intentional UI around the proven core.
- Add search, derived links, exports, AI, and selected writing tools in bounded
  increments. Recheck responsiveness when a feature adds recurring work.
- Decide which existing Amanite workspace capabilities belong in Mosaic.

Exit: agreed tasks are comfortable in actual use, not only attractive in an
empty screenshot. Features neither bypass commands nor introduce a second live
document representation.

### M5: Release hardening

- Package and test target desktop platforms.
- Exercise process termination, failed writes, interrupted structural changes,
  recovery, repeated open/close, and real composition input.
- Review format validation, preload permissions, imported HTML handling, and
  lifecycle cleanup.
- Document headless limitations and the external-editing contract.

Exit: publish actual test coverage and limitations. Do not claim tested power-loss
durability or cross-platform behavior without evidence.

## 11. Required evidence

Use the actual Electron desktop app. Browser-only tests cannot establish desktop
composition, lifecycle, IPC, or filesystem behavior. Choose an Electron-compatible
automation setup; Amanite's Tauri WebDriver scripts do not apply to Mosaic.

Include short prose, long prose, huge paragraphs, many small paragraphs, lists,
tables, dense links, many-page projects, and multiple open documents. Reuse the
100k, 1m, and 5m visible-character fixtures where available. Label unsupported
cases honestly rather than quietly excluding failing sizes.

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
- Type and immediately close, switch document, or rename.
- Undo after save and after structural changes.
- Slow/failing storage and external modifications.
- Own-write observations without false conflict UI.
- Duplicate-open requests without duplicate editors.
- Restart after process termination with exact recovery content.
- Rename/link rewriting with dirty affected documents.
- No growing listeners, retained closed editors, or unbounded queues.

Use deterministic core tests for ordering and failures, and desktop tests for
caret/selection, composition, and responsiveness. Do not expand the test suite
with tests that merely repeat implementation details.

## 12. Open decisions

Resolve these at the relevant milestone; do not reopen the settled stack.

- Exact new-version format and supported markup.
- Lexical acceptance after the initial desktop experiment.
- Title-commit interaction and structural undo behavior.
- External-change resolution details and baseline granularity.
- Autosave/recovery deadlines and durability guarantees.
- Encoding strategy for large documents if synchronous export exceeds budgets.
- Initial headless command scope and owner-routing mechanism.
- Which tabs/groups and Neo-inspired writing interactions belong in the product.
- Initial supported platforms and measured document-size expectations.

## 13. Progress record

| Date | Milestone | Work and evidence | Remaining work |
| --- | --- | --- | --- |
| 2026-09-26 | Planning | Recorded discussion decisions and proposed architecture; no application code copied | M0 contract and fixtures; M1 desktop experiment |

## 14. Reference material

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
