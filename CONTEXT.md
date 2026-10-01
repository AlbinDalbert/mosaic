# Mosaic product ethos

Mosaic brings together Fractal's structural philosophy and Amanite's writing
capabilities. Its guiding ideas remain *Implicit Linking, Just Write* and
*Your Data, Always Transformable*. Writing lives in native HTML documents and
structured folders that remain understandable and useful outside the app.

The previous attempts made the importance of uninterrupted writing concrete.
Saving, state changes, and background work repeatedly interfered with the
editor. Mosaic's priorities come from that experience and from what the user
actually used, especially implicit links and the file tree.

This document records the product's philosophy and how to make tradeoffs.
PLAN.md contains implementation direction and technical decisions. Read those
decisions through the priorities here.

## The priority hierarchy

The categories express importance throughout the life of the product. They do
not define an MVP, a delivery sequence, or a complete specification. A lower
priority capability may be implemented early; it still has to respect the
higher priorities.

### Kernal

1. Uninhibited editing: snappy, responsive typing without editor disruptions.
2. Implicit linking at runtime.
3. A basic, standard file tree.

Writing must remain responsive as the application does its other work. Saving,
background processing, and application state changes must not interfere with
the writer's ongoing editing.

Implicit links arise from document-name mentions while writing. The application
recognizes and renders those connections at runtime without changing the text
or inserting explicit links into the saved document. The user should be able
to write a document's name correctly and follow the resulting connection.
Efficient lookup matters, but the choice of data structure belongs to the
implementation.

The file tree provides a familiar way to navigate and organize the project.
Its importance does not make a special folder view or explicit document
ordering equally important.

### Core

1. Rich text editing.
2. Rich text rendering while editing.

Start with a slim vocabulary: paragraphs, H1 through H3 headings, bold, and
italic. The writer can edit these structures and see their formatting while
working. This does not settle the input gestures or require Markdown as the
document format.

### Features

1. Folder view in the main editor.
2. Manual, explicit ordering of documents inside a folder.
3. Explicit linking.

These capabilities have a place in Mosaic, with lower priority than the writing
experience above. In the previous attempts, the user relied on typing document
names to trigger implicit links and did not use explicit linking. Preserve
that distinction when deciding where effort and interface space belong.

### Niceities

1. Arbitrary HTML embedding.
2. Extension support.
3. Generic HTML editing.

These capabilities must fit within the priorities above them. Native HTML
storage does not itself require arbitrary HTML editing in the writing interface.

## How to use this model

A capability must respect every higher priority category. If a Core capability
causes problems for a Kernal capability, the Kernal capability always takes
precedence. The same rule applies throughout the hierarchy.

Consider indirect effects too. A folder view that triggers background work
which disrupts typing is interfering with a Kernal capability. Change,
constrain, or remove the lower priority behavior rather than accepting the
damage to writing.

This is a philosophical and methodological model. It gives development a
direction without pretending to define every interaction or an objectively
testable contract. Concrete behavior and verification can be worked out when
the relevant work is undertaken. Safe persistence and recovery remain
obligations of the application under PLAN.md.
