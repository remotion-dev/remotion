---
name: v5-breaking-changes
description: Implement or review a Remotion 5 breaking change while the v4 and v5 release lines still share code. Use when v4 behavior and public types must remain compatible on main, but flipping the central v5 flag should activate a new runtime behavior, default, or TypeScript API.
---

# Remotion 5 Breaking Changes

Use the central compile-time flag in `packages/core/src/v5-flag.ts`:

```ts
export const ENABLE_V5_BREAKING_CHANGES = false as const;
```

## Preserve the compile-time flag

- Keep the flag as the literal `false as const` on the v4/main release line.
- Do not turn it into an environment variable, runtime option, or general `boolean`. Its literal type selects the public TypeScript API as well as runtime behavior.
- Do not introduce another v5 flag.
- Inside `packages/core`, import the flag from `v5-flag.ts`. From another package, use `NoReactInternals.ENABLE_V5_BREAKING_CHANGES` from `remotion/no-react` so all packages use the same value.

When the v5 release line is cut, changing this one constant to `true as const` must activate the v5 runtime behavior and public TypeScript API together.

## Gate runtime behavior

Branch defaults and behavior on the central flag while preserving the existing v4 path:

```ts
const effectiveValue =
	value ??
	(NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? v5Default : v4Default);
```

An explicit user value should continue to take precedence unless the v5 API intentionally removes that value. Keep runtime validation aligned with the selected public type so JavaScript callers and callers bypassing TypeScript get the v5 behavior too.

## Gate public types

For a breaking signature or options change, select the entire incompatible part with a conditional type based on the literal flag:

```ts
type VersionedOptions =
	typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES extends true
		? V5Options
		: V4Options;
```

The v4 branch must expose the compatible API. The v5 branch must expose only the intended v5 API; do not leave removed fields optional or union both versions together.

Use these existing implementations as references:

- `packages/renderer/src/v5-required-input-props.ts` for required options in v5.
- `packages/renderer/src/open-browser.ts` for removing an option from a public type while retaining v4 compatibility.
- `packages/google-fonts/src/base.ts` for pairing a conditional public type with runtime enforcement.

## Document every user-facing break

Add or update the corresponding entry in `packages/docs/docs/5-0-migration.mdx`. State:

- what changed in v5;
- the v4 behavior or signature;
- how users should migrate;
- replacement code or options where useful.

## Verify the change

Before finishing, check that:

1. With the flag left as `false as const`, v4 runtime behavior and public types remain compatible.
2. Changing only the central flag to `true as const` selects both the v5 runtime path and v5 public types.
3. Runtime validation agrees with the conditional TypeScript API.
4. Focused tests cover both versioned outcomes where practical.
5. The migration guide includes the user-facing change.
6. Focused builds, tests, linting, and formatting pass for every affected package.

Do not commit the flag flipped merely to test v5. Restore it to `false as const` on the shared v4/main line.

The compatibility branches may be removed after v5 no longer shares its implementation with v4.

Source: [Remotion 5.0 masterplan implementation mechanism](https://github.com/remotion-dev/remotion/issues/3310#issuecomment-5055834391).
