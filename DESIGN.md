# Mosaic design direction

Written: 2026-10-12.
Status: design proposal based on the current discussion, not an implementation
record or authorization to build the full plan.

Read alongside [CONTEXT.md](CONTEXT.md) and [PLAN.md](PLAN.md). This note records
the renewed emphasis on a slim, trustworthy editor, possible X3 compatibility,
and a restrained amber retro interface. Existing implementation decisions remain
in force unless explicitly revised. In particular, this note proposes reviewing
the document format; it does not replace HTML with Markdown.

## 1. What Mosaic should do

Mosaic should make ordinary writing dependable and comfortable. Its central
capabilities are responsive typing, basic formatting, and implicit linking.
Support a small set of behaviors thoroughly before expanding the vocabulary.

The initial writing vocabulary is paragraphs, H1 through H3, bold, and italic.
Implicit links arise from unambiguous document-name mentions. Recognizing a link
must not insert markup into the saved prose or change the writer's text.

Organizational conveniences must earn their complexity. A basic file tree remains
part of the direction in CONTEXT.md, but elaborate folder views, manual ordering,
panels, and workspace arrangements are not prerequisites for establishing the
editing experience. Review their scope when the relevant work is requested.

The user prefers very slim support with high reliability. A limited document
vocabulary can remain a permanent product choice.

## 2. The failure this design must avoid

Mosaic follows Fractal and Amanite, an earlier split between a backend package
and a frontend using Lexical. Editing, saved content, validation, project
reloads, and synchronization became entangled. Saving and loading interfered
with writing, and the resulting complexity exhausted the project's momentum.

The inspected paths and reported symptoms are described in PLAN.md. They do not
establish that Lexical, HTML, or a particular language alone caused the failures.

The architectural requirement is one authority for an open document. An editing
session owns the current writing. Persistence records revisions of that writing.
A separately loaded or validated saved document must not become a competing
authority that the editor continually reconciles with.

An unsaved revision is normal. The design must make its persistence status
understandable without allowing saving to replace current content.

## 3. Editing and saving ownership

Keep the ownership rules from PLAN.md:

- Exactly one live editable instance of a document per owning application session.
- React presents state and issues editing commands. Mounting a component does not
  establish ownership or determine whether writing survives.
- Saving captures a consistent document revision and persists that capture.
- A save acknowledgement identifies what reached storage. It does not reinstall
  document content, recreate the editor, or reset selection and history.
- Acknowledging revision N leaves any newer revision pending.
- Pending saves are bounded and coalesced, with at most one conflicting write in
  flight per document.

The data flow is:

```text
Live document -> captured revision -> safe file persistence
                                          |
                               success or failure acknowledgement
                                          |
                               persistence status in the session
```

The acknowledgement changes persistence bookkeeping. It cannot replace the live
document. Serialized content used for a save or recovery is a capture, not another
editable model.

Typing must not synchronously export the full document, perform filesystem work,
or wait for a project scan or link index. Choosing an autosave timer alone does
not establish that expensive work stays off the typing path; measure it.

Failures remain visible, and writing remains recoverable. Closing must settle the
required persistence or obtain an explicit discard decision. Recovery must
preserve newer writing when an older save completes. A detected external change
requires explicit resolution for an open document.

Keeping the editor small does not remove safe writes, recovery, or overwrite
protection. These are part of trustworthy writing.

## 4. Compatibility with an X3 and phone

The intended X3 project is a writing device with a close connection to the phone,
potentially using it for backend work, while retaining independent operation.
The current intention is to use Git for moving changes between devices. This note
does not design a synchronization service or automatic merging.

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
when actual behavior needs them. Do not create a generic backend package or public
protocol solely for anticipated reuse.

Electron and React remain the desktop stack. Reusing desktop UI code on the X3 is
not a requirement. Whether desktop and phone can share implementation code depends
on the phone's eventual runtime and application design.

An interface may display less formatting than it preserves. For example, an X3
view might not visually distinguish bold, but editing nearby text must not silently
erase it. Replacing a rich document with a plain-text projection would violate
that requirement.

If independent operation includes writing with the phone absent, the device needs
local editing, persistence, and recovery for its supported content. Ownership
handoff and competing offline revisions need an explicit policy when that workflow
is implemented. Git does not define those editing semantics.

## 5. Review the format against the writing experience

HTML remains the current storage direction. The user has found it valuable for
parsing and rendering, but awkward for directly changing source text. That is a
concrete reason to review the decision before implementing the format contract.

Keep three responsibilities distinct:

- The durable format describes the saved writing.
- The live editing model owns ongoing changes.
- Rendering presents that writing on a particular device.

A browser interface can render HTML generated from Markdown. An HTML file can be
edited through a structured model. Choosing either format does not require a
save-and-reload feedback loop.

| Candidate | Main benefit | Cost to evaluate |
| --- | --- | --- |
| Defined HTML subset | Existing parsing and rendering capabilities; explicit structure | Source editing involves markup and escaping; conversion must preserve supported content |
| Defined Markdown dialect | Readable source that ordinary text tools can edit | Rich editing needs conversion; original syntax and whitespace may change when regenerated |

For HTML, define the supported vocabulary instead of making arbitrary HTML and
CSS necessary to understand a document. For Markdown, decide whether preserving
meaning is sufficient or whether original source spelling and layout must also
survive rich editing. Specify how unsupported content is handled without silent
destruction.

Neither choice establishes responsive editing or safe saving by itself. Avoid a
custom canonical format unless a concrete requirement justifies its tooling cost.
The terminal aesthetic does not settle the storage format or require source editing.

## 6. Visual direction

The proposed visual language draws on the user's preference for an Aperture
Science-like amber phosphor terminal, restrained pixel graphics, and a dedicated
writing device. Use the existing Ember palette as the starting point.

| Role | Existing color |
| --- | --- |
| Background | `#0c0b09` |
| Panel | `#15130f` |
| Prose | `#e6dfd4` |
| Border | `#302b23` |
| Amber accent | `#dfa13d` |
| Strong amber accent | `#f2c96f` |

Let compact controls, lettering, and simple shapes carry the retro character.
Use monospace or pixel typography with restraint in labels and status. Choose the
prose font for sustained reading and editing; its family remains open. The existing
warm prose color can coexist with amber controls without requiring every line of
writing to be saturated amber.

The editor should have a stable writing area, clear heading levels, recognizable
bold and italic, and minimal persistent controls. Add navigation around actual
writing tasks rather than inheriting Amanite's panel arrangement.

Give implicit links a restrained treatment that remains recognizable through a
non-color cue, such as an underline. Keep keyboard focus visible. Present save
status in ordinary language, such as "Saving", "Saved", or "Couldn't save", with
an available action when something fails. Internal revisions belong in diagnostics.

Favor stillness and predictable placement. Decorative scanlines, flicker, glow,
or motion must not compromise prose legibility or distract from typing. A
monochrome adaptation should retain meaning through typography, spacing, and
shapes. No essential action or status should depend on amber versus another color.

## 7. Small implementation steps and evidence

This note defines direction, not a combined feature milestone. Choose each next
behavior with the user and explain ownership, data flow, and tradeoffs before
implementing it.

The proposed first bounded behavior is one real document that can be opened,
edited with basic formatting, saved, and reopened. Settle the small format contract
and editor integration as part of that work. Establish persistence correctness
before introducing broader project operations. Implement implicit linking as a
separate complete behavior once document naming and lookup exist.

Verify in Electron that:

- Typing continues during slow saves, and acknowledgement preserves newer edits.
- Successful saves preserve selection, composition, and undo history.
- Failed saves remain visible and leave recoverable writing.
- Immediate close and restart preserve the required final writing or recovery.
- Detected external edits do not silently replace or overwrite local work.

Use meaningful regression tests for revision ordering and failure handling, plus
desktop checks for the actual writing experience. Run `pnpm check` after code or
build changes. Passing checks alone do not establish responsiveness or durability.

Keep the performance evidence and supported document-size limits honest. Slim
support should mean fewer well-verified behaviors, not weaker persistence rules.

## 8. Decisions still open

- Retain a defined HTML subset or deliberately revise the format to Markdown.
- Choose the editor integration against actual writing and save behavior.
- Select prose and utility typography within the amber retro direction.
- Agree on the first navigation interactions and organizational conveniences.
- Define the X3's independent writing scope and phone responsibilities when that
  implementation begins.

There is no immediate requirement to build a shared backend, device protocol,
plugin system, or expanded document vocabulary.
