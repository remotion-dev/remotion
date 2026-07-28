---
name: writing-tests
description: Rules for writing and reviewing tests in the Remotion repository. Use whenever adding, editing, or reviewing tests, especially for Studio UI, rendering, CLI, server, media, and cross-package changes, to prefer complete integration workflows over narrow helper tests and implementation details.
---

# Writing Tests

The purpose of a test is confidence that a workflow or contract works for a Studio user, CLI user, package consumer, or renderer consumer.

> Test the feature at the widest stable boundary that gives useful confidence. Prefer one complete integration workflow; use focused unit tests for genuinely complex logic and E2E tests for critical cross-process workflows.

Test count, assertion count, file count, and coverage percentage are not quality metrics. One rendered frame, final artifact, or persisted-source assertion can give more confidence than many narrow unit assertions.

A test that stays green when the feature is disconnected is not useful primary coverage. For a user-facing or cross-layer feature, a private helper unit test must not be the only coverage.

## Choose the boundary before writing the test

Answer these questions first:

1. What failure would a user or public API consumer notice?
2. What is the widest stable boundary that can reproduce it economically?
3. Is there an existing integration or E2E workflow that can be extended?
4. Would the proposed test fail if the feature entry point stopped calling the tested helper?
5. Which edge cases, if any, still justify focused unit tests?

Test type is determined by the boundary, not the directory or runner. A Bun test can be an integration test, while a Playwright test can still be coupled to implementation details.

Use these primary boundaries:

| Change                                                                   | Preferred primary coverage                                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Studio interaction                                                       | Playwright action followed by a visible, source-file, persistence, URL, or rendered outcome      |
| Studio Server or codemod                                                 | Realistic source fixture through the route or handler, followed by the resulting source or event |
| Core, Player, or Media                                                   | Mount or render the real component with real neighboring modules and representative media        |
| Web renderer or visual effect                                            | Browser render, image comparison, pixel probe, or produced frame                                 |
| CLI                                                                      | Execute the command and assert exit code, output, and filesystem effects                         |
| Renderer, SSR, templates, or packaging                                   | Public API through `packages/it-tests` or a realistic temporary project                          |
| Lambda or cloud orchestration                                            | Full orchestration with only the remote provider mocked or faked                                 |
| Pure math, parser, serializer, protocol transformation, or state machine | Focused, preferably table-driven unit tests                                                      |

Do not force every change through Playwright. A route-level or filesystem integration is often the best stable boundary. Reserve full E2E tests for important risks that cross browser, server, filesystem, HMR, or process boundaries.

## Assert contracts and outcomes

Prefer outcomes a user or integrator can observe:

- Rendered frames, pixels, media timestamps, image output, and visual regressions
- Generated or persisted source code and files
- Public return values, events, errors, and protocol messages
- CLI exit status, output, prompts, and filesystem changes
- Studio text, accessible names, focus, enabled state, navigation, and persistence
- Requests to external boundaries, including method, path, and payload when those are the contract

Prefer a positive final outcome proving the path ran. `does not throw`, `not visible`, `not present`, or “error absent” is weak as the only proof. First assert the expected reorder, file mutation, request, rendered output, persisted state, or successful result; add the negative assertion only when it provides additional confidence.

When generated code is the user-visible artifact, source assertions are legitimate. Assert the meaningful output and avoid coupling to irrelevant formatting unless formatting itself is part of the contract.

## Studio and product UI tests

Locate controls as users find them: `getByRole`, `getByLabel`, `getByText`, and accessible names. Prefer semantic state matchers such as `toBeDisabled()` and `toBeFocused()` over inspecting attributes.

Avoid using these as assertion targets when an external result exists:

- CSS classes and library-private attributes
- Tag names, wrapper hierarchy, parent traversal, or icon presence
- Internal menu IDs and descriptor objects
- Callback payloads obtained by invoking internal menu items directly
- Hook, context, reducer, or modal-state objects
- Internal ARIA values used merely as state storage

If no semantic locator exists, improve accessibility or add a stable interaction hook. A CSS selector or test attribute may be used to perform an action against third-party or otherwise inaccessible internals, but the assertion should still target an observable result.

### Remotion's visual exception

Do not apply a blanket ban to styles, geometry, DOM output, or pixels. In Remotion, visual output is often the product.

For renderers, effects, layout, media, and generated source, the following may be public contracts:

- Pixels, screenshots, opacity, color, and compositing
- Geometry, positions, dimensions, and timing
- CSS behavior or DOM output
- Frames, timestamps, decoded media, and rendered artifacts
- Exact generated source where consumers receive or edit that source

When practical, test the rendered result rather than only an intermediate style object. Focused geometry unit tests remain appropriate for edge-heavy layout algorithms, especially when paired with one browser or visual test that proves the result is wired into rendering.

## Use real owned collaborators

Use real Remotion modules, routes, filesystem operations, servers, components, and browser rendering by default. Mock or fake the boundary Remotion does not own, such as AWS, an unavailable remote service, time, or a nondeterministic external dependency.

Do not mock internal production modules or neighboring owned packages merely to make setup easier. If an internal fake is unavoidable, explain why the real boundary is impractical and ensure another test covers the wiring that the fake bypasses.

A good integration test may use a temporary directory, real fixture project, real server route, real package entry point, or real media file while replacing only the external provider.

## Write fewer, complete workflow tests

Model a test on a coherent manual workflow: one setup, followed by as many actions and assertions as that workflow needs.

- Multiple assertions in one test are good.
- Keep every test independently runnable and isolated.
- Do not split one workflow into ordered tests, shared mutable variables, or `beforeAll` steps.
- Do not relaunch the same browser, renderer, or Studio process for individual assertions.
- Extend an existing workflow when the setup, actor, and goal are the same.
- Add a separate test for a genuinely distinct setup, contract, or failure path.
- Put table-like edge cases for pure functions in a table-driven unit test rather than an artificial browser workflow.
- Do not combine unrelated behavior merely to reduce the number of test files.

In `packages/example/e2e`, starting Studio is expensive and the suite runs serially. Title, visibility, navigation, interaction, and final-result assertions that form one workflow should not each restart Studio. Combine them into one independently runnable test instead of sharing process state through `beforeAll`.

Before adding an assertion, ask whether an adjacent stronger assertion already proves it. One strong outcome is preferable to several redundant intermediate observations.

## Role of unit tests

Unit tests are valuable for:

- Pure algorithms with many meaningful inputs
- Parsers, serializers, codemods, and protocol transformations
- State machines and error handling with combinatorial branches
- Geometry and timing math where edge cases would make a broad test unwieldy
- Public utility functions whose return values are themselves the contract

For a cross-layer feature, first add or identify the primary integration workflow. Add unit tests only for important edge cases that the broad test cannot cover economically.

Do not extract or export a trivial helper solely to make it testable. If the helper works but the feature entry point can stop calling it without failing the test, that test is not sufficient primary coverage.

It is acceptable to add no automated test when the only affordable test would assert implementation details and the regression risk is low. Report explicit manual verification rather than adding a misleading green test.

## Avoid these anti-patterns

- Testing a coalescing, mapping, or array-building helper as the sole coverage for a UI feature
- Asserting internal menu IDs, callback descriptors, reducer state, or hook state
- Calling a formatter directly when the risk is CLI wiring
- Testing each changed production line only to increase coverage
- Duplicating the same behavior at unit, route, component, and E2E layers without a distinct risk at each layer
- Snapshotting large internal objects or whole markup trees when a smaller contract or final artifact exists
- Mocking the module that contains the integration most likely to break
- Creating one test block per requirement sentence despite identical setup
- Proving only that no error occurred, without proving the intended operation succeeded

## Verify regressions red and green

For a bug fix, verify when practical that the new test detects the regression:

1. Run the test with the fix.
2. Temporarily revert or disconnect the relevant production hunk.
3. Confirm the test fails for the expected reason.
4. Restore the fix and confirm the test passes.

Use this mutation heuristic:

> If the tested helper still works but the feature entry point stops calling it, would this test fail?

If not, move the primary test to a wider boundary.

Report `Red/green verified` in the final response. If verification is impractical, state why rather than implying it was performed.

## Examples

### New Composition defaults

Weak primary coverage:

```ts
expect(getNewCompositionDefaults(selected)).toEqual(selected);
```

Stronger workflow:

1. Select a portrait composition.
2. Open New Composition.
3. Verify width, height, FPS, and duration are populated.
4. Create the composition.
5. Assert the resulting composition or source contains those values.

Focused units may still cover unusual fallback inputs if they represent meaningful independent logic.

### CLI help

Weak primary coverage:

```ts
expect(getCreateVideoHelp()).toContain('--help');
```

Stronger integration:

1. Execute `create-video --help` through the real CLI entry point.
2. Assert successful exit and expected output.
3. Assert no prompt appeared and no project was created.

### Read-only Studio

Weak primary coverage:

```ts
expect(getItem(items, 'rename').disabled).toBe(true);
```

Stronger workflow:

1. Open Studio in read-only mode.
2. Use a safe action and assert its visible or external effect.
3. Verify a mutation action is unavailable or cannot change source.

### Negative regression

Weak coverage:

```ts
await expect(page.getByText(error)).toBeHidden();
```

Stronger coverage performs the operation and asserts its positive result, such as the new sequence order, source mutation, request, persisted value, or rendered output. Error absence may then be a secondary assertion.

## Repository examples

Use these as models for test shape and boundary selection:

- Complete HMR workflow: `packages/example/e2e/error-overlay.test.mts`
- Cross-boundary watcher workflow: `packages/example/e2e/suppress-rebuild.test.mts`
- Real Player and media visual test: `packages/media/src/test/player-preview-frame-accuracy.test.tsx`
- Cloud orchestration with a provider boundary fake: `packages/lambda/src/test/integration/deploy-site-from-bundle.test.ts`
- Browser visual output: `packages/web-renderer/src/test/opaque-layer-over-fading-layer.test.tsx`

Follow specialized skills such as `web-renderer-test` for subsystem mechanics while retaining the principles in this skill.

## Review and report

Before finishing:

- Confirm the test exercises the primary public or user-visible contract.
- Confirm it would fail if the actual feature wiring broke.
- Remove redundant assertions and duplicate lower-level coverage.
- Run the focused test command for every changed test.
- Perform red/green regression verification when practical.

When reporting test changes, include:

- The primary behavior or contract tested
- The chosen boundary: unit, integration, visual/browser, or E2E
- Why that boundary gives useful confidence
- Which internal dependencies were mocked, if any, and why
- Whether an existing workflow was extended, or why a new scenario was needed
- `Red/green verified`, or why it was impractical

Principles adapted from:

- https://kentcdodds.com/blog/write-fewer-longer-tests
- https://kentcdodds.com/blog/write-tests
