---
name: studio-dev
description: Develop or review Remotion Studio features and UI. Apply Studio principles for optimistic updates, agent access through code or WebMCP, iframe-safe hover behavior, design consistency, mode availability, and performance verification.
---

# Studio development

Apply these principles when implementing or reviewing Studio itself. They cover
the regular Studio and Browser Studio at `remotion.new`.

## Optimistic operations

Every operation must have an optimistic update. Reflect the user's intent
immediately instead of waiting for a server request, filesystem write, codemod,
or hot reload. For work whose result is not yet known, show its pending state
immediately without claiming completion.

Reconcile the optimistic state with the persisted result. Preserve it until the
updated source/configuration arrives through HMR, and handle failures with a
rollback and visible error. A late response or rollback must not overwrite a
newer edit or undo. Use the existing mutation queue and history mechanisms;
see [enqueueStudioSourceMutation](../../../packages/studio/src/helpers/enqueue-studio-source-mutation.ts)
and [optimistic composition metadata](../../../packages/studio/src/components/InspectorPanel/optimistic-composition-metadata.ts).

## Agent, interactive, and code parity

- Every state and action must be available to an agent through project code or
  WebMCP. Anything already editable in project source satisfies this requirement.
  Moving or trimming a sequence, for example, does not need a WebMCP tool.
  Do not add redundant tools solely to mirror source-backed editing actions.
- Expose transient Studio state and actions through WebMCP when project source
  cannot represent them, such as playback, selection, pending render jobs, and
  render cancellation. Follow the existing
  registrations in [WebMcp.tsx](../../../packages/studio/src/components/WebMcp.tsx)
  and the relevant feature's tools.
- Document every new WebMCP tool and changes to its inputs or outputs in the
  [WebMCP documentation](../../../packages/docs/docs/ai/webmcp.mdx), including
  pending state, results, and mode availability.
- Every source-backed edit must work interactively and by editing project code,
  which also provides agentic access. Direct code changes must appear correctly
  after hot reload. Where a WebMCP editing tool exists, it must use the same
  source mutation/history path as the UI. Avoid separate sources of truth.
- Keep validation, optimistic behavior, undo/redo, errors, and mode restrictions
  consistent across interactive and WebMCP entry points. Read current state when
  a tool executes instead of capturing a stale snapshot at registration time.

## Consider all four Studio modes

Read [studio-mode](../studio-mode/SKILL.md) when deciding availability. Check each
new action and its WebMCP entry point against all four modes:

| Mode                                        | Capabilities to consider                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Regular interactive Studio                  | Attached Studio server; source edits, codemods, dependency installation, server rendering, and supported “Open in” actions.                |
| Regular Studio with preview server detached | `previewServerConnected` is `false`; effectively read-only, with client-side rendering still available.                                    |
| Read-only deployed Studio                   | No attached server; hide or disable server-dependent actions. GitHub is the only supported “Open in” action.                               |
| Browser Studio (`remotion.new`)             | Runs in an iframe with a virtual filesystem hidden from the user; supports codemods and dependency installation, but no “Open in” actions. |

Use existing capability checks. A deployed Studio is not necessarily read-only:
Browser Studio has its own mutation capabilities. Hide or disable unsupported
UI actions and enforce the same restrictions when invoked agentically.

## Prevent the iframe hover bug

The hover bug is stale hover state after the pointer leaves Studio's iframe.
Browsers can miss `pointerleave`/mouse leave events, leaving event-driven React
hover state stuck: buttons and menu rows stay highlighted, or tooltips remain
visible after the pointer has gone. See [issue #9886](https://github.com/remotion-dev/remotion/issues/9886)
and the [tooltip and hover fix](https://github.com/remotion-dev/remotion/pull/12107).

- Drive purely visual hover styling with CSS `:hover`, using
  `HOVERABLE_CLASS_NAME` and `hoverableStyle()` from
  [hoverable.ts](../../../packages/studio/src/helpers/hoverable.ts). Use the
  existing hover-group classes to reveal row actions. Do not introduce React
  hover state just to change colors, backgrounds, or visibility.
- When JavaScript behavior depends on hover, such as a delayed menu or tooltip,
  use [observeHover()](../../../packages/studio/src/helpers/observe-hover.ts).
  It handles recovery from missed leave events, window blur, visibility changes,
  and Browser Studio's forwarded `remotion-browser-studio-pointerleave` event.
  Dispose the observer and cancel pending timers during cleanup and dismissal.
- Preserve intentional selected, keyboard-focused, and open-menu states.
  Nested actions must not appear hovered just because their parent row is
  hovered. Keep actions usable with keyboard and touch.
- Verify in an iframe as well as regular Studio: hover, leave the frame,
  re-enter, and switch window focus. Highlights and pending/visible tooltips
  must clear correctly. The existing regression in
  [browser-studio.test.ts](../../../packages/browser-studio/e2e/browser-studio.test.ts),
  `clears hover backgrounds even if pointer leave events are lost`, deliberately
  suppresses leave events to exercise this failure.

## Follow the Studio design and CSS reset

Read [studio-css-reset](../studio-css-reset/SKILL.md) and
[no-pointer](../no-pointer/SKILL.md) when adding or changing UI.

- Reuse the closest existing Studio controls, layouts, and interaction patterns.
  Match their colors, fonts, font sizes, control sizes, spacing, borders, icons,
  and hover, focus, selected, and disabled traits. Use shared tokens from
  [colors.ts](../../../packages/studio/src/helpers/colors.ts) and existing
  component styles instead of introducing a separate visual language.
- The `.css-reset, .css-reset *` rule applies to every descendant in a reset
  container, not just the parent. It resets font size, line height, color, font
  family, background, and box sizing. Parent text styles alone do not override
  each child's reset. Style the element that paints the text or SVG, or use an
  appropriate descendant selector. Check computed styles, including nested
  labels and icons.
- Never add a DOM `title` attribute for a tooltip, including `title=""`. Use a
  tooltip component: the existing Studio implementation exposes `ActionTooltip`
  and `ClippedTextTooltip` in
  [ActionTooltip.tsx](../../../packages/studio/src/components/ActionTooltip.tsx).
  Preserve accessible labels and keyboard focus behavior.
- Never use `cursor: 'pointer'` for Studio controls or links. Use
  `cursor: 'default'`. Follow the shared hover and `:focus-visible` conventions;
  keep a visible keyboard focus indicator.

## Performance must not regress

Read [studio-perf](../studio-perf/SKILL.md). Prefer consuming context through an
existing stable ref or imperative getter when the value is needed only during
an action. Copying a reactive context value into a ref after subscribing does
not avoid the subscription's re-renders.

For example, read `getCurrentFrame()` from
[imperative-state.ts](../../../packages/studio/src/components/Timeline/imperative-state.ts)
inside event handlers and WebMCP tools instead of importing
`Internals.Timeline.useTimelinePosition()` into their owning component. Subscribe
to the frame only in the smallest leaf whose visible output must change on
every frame. Keep props and context values stable across memoized boundaries.

Test performance when adding features; source inspection is not enough. Capture
a baseline and repeat the same representative interaction after the change,
including playback/scrubbing when the feature participates in frame updates.
Use [react-scan](../react-scan/SKILL.md) for render/commit measurements and browser
profiling for non-React work. Keep the composition, viewport, and repetitions
comparable. Check unnecessary renders, commit duration, interaction latency,
and playback smoothness as relevant, and resolve regressions before finishing.
Report the measured result and any verification limits.

## Verify the feature

Exercise source-backed edits through the UI and direct code changes. Exercise
WebMCP where a tool is provided or needed for transient Studio state and actions.
Check immediate feedback, persistence after HMR, failure recovery, and undo/redo
for edits that participate in history. Check availability in each mode and the
relevant hover, focus, cursor, and CSS-reset behavior above.

For Studio code changes, run the package build and relevant existing checks:

```sh
bunx turbo run make --filter='@remotion/studio'
bunx turbo run lint test --filter='@remotion/studio'
```

Include affected packages and existing browser regression tests when the change
crosses those boundaries. Follow [writing-tests](../writing-tests/SKILL.md) when
adding or changing tests.
