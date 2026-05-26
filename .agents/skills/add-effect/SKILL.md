---
name: add-effect
description: Add a new effect to @remotion/effects, including implementation, package exports, docs, demos, preview images, tests, formatting, and builds.
---

# Add a new `@remotion/effects` effect

Use this skill when adding a new effect to `@remotion/effects`.

## 1. Pick the effect shape

- Use a single file at `packages/effects/src/<effect-name>.ts` for simple 2D effects.
- Use a folder at `packages/effects/src/<effect-name>/` plus a top-level re-export file when the effect needs WebGL shaders, runtime helpers, or multiple files.
- Prefer the 2D backend for pixel-level color operations unless WebGL is needed for performance or sampling.
- Follow naming already used by the package:
  - File/subpath: kebab-case (`chromatic-aberration`)
  - Function: camelCase (`chromaticAberration`)
  - Type: PascalCase params (`ChromaticAberrationParams`)
  - Effect type string: `remotion/<kebab-case-name>`

## 2. Implement the effect

In the effect file:

- Import `SequenceSchema` and `Internals` from `remotion`.
- Use `const {createEffect} = Internals;`.
- Define defaults as `const` values.
- Define a schema with `satisfies SequenceSchema`; these fields appear in Studio visual editing.
- Export the params type.
- Resolve defaults in a `resolve()` helper.
- Validate params using helpers from:
  - `packages/effects/src/validate-effect-param.ts`
  - `packages/effects/src/color-utils.ts`
- Throw explicit errors when a canvas context cannot be acquired.
- Set `documentationLink` to `https://www.remotion.dev/docs/effects/<slug>`.
- Include every resolved parameter in `calculateKey()`.

For 2D effects, use this general structure:

```ts
import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {assertOptionalFiniteNumber} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect} = Internals;

const DEFAULT_AMOUNT = 1 as const;

const myEffectSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
	},
} as const satisfies SequenceSchema;

export type MyEffectParams = {
	readonly amount?: number;
};

type MyEffectResolved = {
	amount: number;
};

const resolve = (p: MyEffectParams): MyEffectResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
});

const validateMyEffectParams = (params: MyEffectParams): void => {
	assertEffectParamsObject(params, 'My effect');
	assertOptionalFiniteNumber(params.amount, 'amount');
};

export const myEffect = createEffect<MyEffectParams, null>({
	type: 'remotion/my-effect',
	label: 'My Effect',
	documentationLink: 'https://www.remotion.dev/docs/effects/my-effect',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolve(params);
		return `my-effect-${r.amount}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error(
				'Failed to acquire 2D context for my effect. The canvas may have been assigned a different context type.',
			);
		}

		const r = resolve(params);
		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(source, 0, 0, width, height);
	},
	cleanup: () => undefined,
	schema: myEffectSchema,
	validateParams: validateMyEffectParams,
});
```

## 3. Register package entry points

Update:

- `packages/effects/bundle.ts` — add the new `src/<effect-name>.ts` entrypoint.
- `packages/effects/package.json`:
  - Add `exports["./<effect-name>"]`.
  - Add the `typesVersions` entry.

If using a folder implementation, add a top-level file that re-exports from the folder:

```ts
export {myEffect, type MyEffectParams} from './my-effect/index.js';
```

## 4. Add tests

Update `packages/effects/src/test/effect-params.test.ts`:

- Import the new effect.
- Add it to the documentation link test.
- Test default params when all fields are optional.
- Test required params if any are required.
- Test invalid values and exact error substrings.
- Test that meaningful params produce distinct `effectKey` values.

Run:

```bash
cd packages/effects
bun test src/test
bunx turbo make --filter="@remotion/effects"
```

## 5. Add docs

Create `packages/docs/docs/effects/<effect-name>.mdx`.

Follow existing effect pages:

- Frontmatter: `slug`, `title`, `sidebar_label`, `crumb: '@remotion/effects'`.
- Add `image:` only after running `bun render-cards.ts`.
- H1: `# effectName()<AvailableFrom v="..." />`.
- Include `_Part of the [@remotion/effects](/docs/effects/api) package._`.
- Add a short description.
- Add `<Demo type="effects-<effect-name>" />`.
- Add a twoslash example with `title="MyComp.tsx"`.
- Document each option as its own `###` heading, using `?` for optional parameters.
- Add a `disabled?` section.
- Add a See also section.

Update:

- `packages/docs/sidebars.ts` — add `'effects/<effect-name>'`.
- `packages/docs/docs/effects/table-of-contents.tsx` — add a card in the right category.
- `packages/docs/src/data/articles.ts` by running the card generator, not by hand.

Use the `writing-docs` skill for documentation wording.

## 6. Add the interactive docs demo

Create `packages/docs/components/effects/effects-<effect-name>-preview.tsx`.

Use the same preview source as other effects:

```tsx
import {myEffect} from '@remotion/effects/my-effect';
import React from 'react';
import {CanvasImage} from 'remotion';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsMyEffectPreview: React.FC<{
	readonly amount: number;
}> = ({amount}) => {
	return (
		<CanvasImage
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			effects={[myEffect({amount})]}
		/>
	);
};
```

Register the demo:

- `packages/docs/components/demos/types.ts`
  - Import the preview component.
  - Export `effectsMyEffectDemo`.
  - Use `id: 'effects-<effect-name>'`.
  - Add controls matching the effect schema.
- `packages/docs/components/demos/index.tsx`
  - Import and add the demo to the `demos` array.

Use the `docs-demo` skill for demo details.

## 7. Render the table-of-contents preview image

The TOC card should use a rendered image from the same preview component, not a hand-written SVG.

Create a temporary Remotion entry point for the still render and delete it before committing:

```tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {EffectsMyEffectPreview} from '../../components/effects/effects-my-effect-preview';

const Root: React.FC = () => {
	return (
		<Composition
			id="effects-my-effect-preview"
			component={EffectsMyEffectPreview}
			width={1080}
			height={720}
			fps={30}
			durationInFrames={1}
			defaultProps={{
				amount: 1,
			}}
		/>
	);
};

registerRoot(Root);
```

Then render from `packages/docs`:

```bash
npx --no-install --package @remotion/cli remotion still src/remotion/effects-preview-entry.tsx effects-my-effect-preview static/img/effects-my-effect-preview.jpg --overwrite --image-format=jpeg
```

Add the rendered image to `packages/docs/static/img/`, reference it from `table-of-contents.tsx`, and delete the temporary entry point before committing.

## 8. Generate docs card

Run:

```bash
cd packages/docs
bun render-cards.ts
```

Commit the generated `packages/docs/static/generated/articles-docs-effects-<effect-name>.png` and the new `image:` frontmatter line.

If `render-cards.ts` opportunistically generates unrelated missing cards, remove those unrelated files unless they belong to the current change.

## 9. Format, build, and verify

Run:

```bash
cd packages/effects
bunx oxfmt src --write
cd ../..
bun run build
bun run formatting
```

If the change touches docs source, `bun run formatting` covers `packages/docs/src`. For MDX-only edits, do not run formatters on docs pages.

Before committing, check:

```bash
git diff --check
git status --short
```

## Common pitfalls

- Do not forget `package.json` `exports` and `typesVersions`; subpath imports like `@remotion/effects/my-effect` depend on them.
- Do not forget `bundle.ts`; otherwise the ESM subpath will not be built.
- Do not leave temporary render entry points in `packages/docs/src/remotion`.
- Do not use a hand-written SVG for the effect TOC preview.
- Preserve alpha unless the effect intentionally changes it.
- For pixel math, be aware canvases store premultiplied alpha.
