# Working on Mosaic

Read PLAN.md for product direction and README.md for the current code layout.
The repository starts with a bare Electron, TypeScript, and React scaffold.

The user is rebuilding their understanding of the code while developing this
application. Keep changes small enough to explain and review together. Explain
ownership, data flow, and meaningful tradeoffs before introducing new concepts.
The product plan does not authorize implementing the entire roadmap in one go.

Implement the requested behavior completely. Do not add proof-of-concept
features, mocks, placeholder services, speculative APIs, or abstractions for
future work. Add a dependency only when current behavior needs it.

Keep sibling applications unchanged unless the user requests changes there.
Retain the product decisions in PLAN.md when choosing implementation details.

Run pnpm check after code or build changes. Verify affected desktop behavior
in Electron. Add tests when there is meaningful behavior or a regression to
protect; avoid tests that only assert the scaffold's shape.

Use the pnpm version declared in package.json. Commit pnpm-lock.yaml alongside
package.json when committing dependency changes. Keep generated artifacts out
of Git.
