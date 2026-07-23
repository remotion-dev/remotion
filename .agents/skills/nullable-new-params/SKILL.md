---
name: nullable-new-params
description: 'Fix newly added optional parameters, optional React props, and optional type/interface members in Remotion monorepo diffs by converting internal APIs to required nullable values and updating call sites. Use when a PR, review, or user asks to forbid new `foo?: T` / `param?: T` additions except for exported or documented public APIs where requiring the value would be breaking.'
---

# Nullable new params

Use this skill when a change added a new parameter or type member as optional. In internal Remotion code, new inputs must be required and nullable so every caller makes an explicit choice.

## Rule

- Internal contracts: write `name: T | null`, not `name?: T`.
- Call sites must pass `null` explicitly when no value exists.
- Implementation checks should prefer `value === null` / `value !== null` when null is the absence sentinel.
- Do not use `undefined` as the absence sentinel for new internal APIs unless the surrounding local contract already standardizes on `undefined`.
- The anti-pattern includes redundant shapes such as `frozenFrame?: number | null`; make it `frozenFrame: number | null`.

Public APIs are the exception. If the changed signature, props type, or options object is exported from a package public entrypoint or documented in `packages/docs/docs`, making the new field/argument required is a breaking change. Keep it optional or add a backwards-compatible overload/options path, then document/default it as appropriate.

## Workflow

1. Inspect the diff for newly added optional members or parameters:

```sh
bun .agents/skills/nullable-new-params/scripts/find-new-optional-params.ts
```

Useful variants:

```sh
bun .agents/skills/nullable-new-params/scripts/find-new-optional-params.ts origin/main...HEAD
bun .agents/skills/nullable-new-params/scripts/find-new-optional-params.ts --cached
```

2. For each candidate, classify whether it is public:
   - Public: exported from a package entrypoint, included in package `exports`, or documented in `packages/docs/docs`.
   - Internal: local helpers, internal component props, cross-file monorepo helpers, test utilities, internal context data, and types not exposed through package entrypoints.
   - If unsure, grep package entrypoints and docs before changing API shape.

3. For internal candidates, refactor the type from optional to required nullable:

```ts
type Before = {
  readonly frame?: number;
};

type After = {
  readonly frame: number | null;
};
```

For function parameters:

```ts
const before = (frame?: number) => {};
const after = (frame: number | null) => {};
```

4. Update every caller/object literal to pass the value explicitly:
   - Use `field: null` when absent.
   - Preserve existing values with `field: maybeValue ?? null` only when `undefined` can still enter from surrounding code.
   - Avoid hiding the required choice behind defaults in destructuring.

5. Update implementation logic:
   - Replace truthy checks when `0`, `''`, or `false` are valid values.
   - Prefer `value !== null` over `value` for nullable numbers/strings/booleans.
   - Keep tests and fixtures explicit; do not make large fixtures `Partial<T>` only to dodge the new field.

6. For public candidates, preserve backwards compatibility:
   - Keep the new field optional in the public type.
   - Resolve a concrete internal value at the boundary, usually with `const internal = publicValue ?? null`.
   - Keep internal downstream types required nullable.

7. Verify:
   - Run the scanner again until only intentional public API exceptions remain.
   - Run focused tests or package builds for touched packages, for example `bunx turbo run make --filter='<package-name>'`.
   - If docs changed, follow the `writing-docs` skill.

## Review checklist

- No new internal `?:` member or `param?:` parameter remains.
- Every internal caller passes either a real value or `null`.
- Public APIs remain backwards-compatible.
- Nullable checks do not treat valid falsy values as absent.
- Tests cover at least one explicit `null` path when behavior depends on absence.
