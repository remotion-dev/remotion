---
name: add-effect
description: Add a new effect to @remotion/effects, including implementation, package exports, docs, demos, preview images, Remotion skill updates, tests, formatting, and builds.
---

# Add a new `@remotion/effects` effect

Use this skill when adding a new effect to `@remotion/effects`.

## 1. Pick the effect shape

- Prefer the WebGL2 backend for new effects. Use 2D only when WebGL cannot express the effect.
- Use a single file at `packages/effects/src/<effect-name>.ts` for simple effects.
- Use a folder at `packages/effects/src/<effect-name>/` plus a top-level re-export file when the effect needs multiple shaders, runtime helpers, or multiple files.
- Follow naming already used by the package:
  - File/subpath: kebab-case (`chromatic-aberration`)
  - Function: camelCase (`chromaticAberration`)
  - Type: PascalCase params (`ChromaticAberrationParams`)
  - Effect type string: `remotion/<kebab-case-name>`

## 2. Implement the effect

In the effect file:

- Import `SequenceSchema` and `Internals` from `remotion`.
- Use `const {createEffect, createWebGL2ContextError} = Internals;`.
- Define defaults as `const` values.
- Define a schema with `satisfies SequenceSchema`; these fields appear in Studio visual editing.
- Export the params type.
- Resolve defaults in a `resolve()` helper.
- Validate params using helpers from:
  - `packages/effects/src/validate-effect-param.ts`
  - `packages/effects/src/color-utils.ts`
- Throw `createWebGL2ContextError('<effect name> effect')` if WebGL2 cannot be acquired.
- Set `documentationLink` to `https://www.remotion.dev/docs/effects/<slug>`.
- Include every resolved parameter in `calculateKey()`.

For WebGL2 effects, use this general structure:

```ts
import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {assertOptionalFiniteNumber, validateUnitInterval} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

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
	validateUnitInterval(params.amount ?? DEFAULT_AMOUNT, 'amount');
};

type MyEffectState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uAmount;

void main() {
	vec4 color = texture(uSource, vUv);
	fragColor = vec4(color.rgb * uAmount, color.a);
}
`;

// Follow existing helpers in halftone.ts or a runtime file for shader
// compilation, program linking, fullscreen-quad setup, and texture setup.

export const myEffect = createEffect<MyEffectParams, MyEffectState>({
	type: 'remotion/my-effect',
	label: 'My Effect',
	documentationLink: 'https://www.remotion.dev/docs/effects/my-effect',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `my-effect-${r.amount}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('my effect effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		return createMyEffectState(gl, VERTEX_SHADER, FRAGMENT_SHADER);
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);

		state.gl.viewport(0, 0, width, height);
		state.gl.bindFramebuffer(state.gl.FRAMEBUFFER, null);
		state.gl.activeTexture(state.gl.TEXTURE0);
		state.gl.bindTexture(state.gl.TEXTURE_2D, state.texture);
		state.gl.pixelStorei(state.gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		state.gl.texImage2D(
			state.gl.TEXTURE_2D,
			0,
			state.gl.RGBA,
			state.gl.RGBA,
			state.gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		state.gl.useProgram(state.program);
		if (state.uSource) state.gl.uniform1i(state.uSource, 0);
		if (state.uAmount) state.gl.uniform1f(state.uAmount, r.amount);
		state.gl.bindVertexArray(state.vao);
		state.gl.drawArrays(state.gl.TRIANGLE_STRIP, 0, 4);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: myEffectSchema,
	validateParams: validateMyEffectParams,
});
```

Look at existing WebGL2 effects such as `halftone.ts`,
`blur/blur-runtime.ts`, `chromatic-aberration/chromatic-aberration-runtime.ts`,
and `wave/wave-runtime.ts` before adding new helpers. In the template above,
`createMyEffectState()` stands for the shader compilation, program linking,
fullscreen-quad, texture, and uniform-location setup used by those files.

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
- Add `<EffectsDemo type="effects-<effect-name>" />`.
- Add a twoslash example with `title="MyComp.tsx"`.
- Document each option as its own `###` heading, using `?` for optional parameters.
- Add a `disabled?` section.
- Add a See also section.

Update:

- `packages/docs/sidebars.ts` — add `'effects/<effect-name>'` in alphabetical order.
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
			fit="cover"
			effects={[myEffect({amount})]}
		/>
	);
};
```

Use `fit="cover"` for docs effect previews so the shared preview image fills
the 16:9 canvas and does not leave transparent bars.

Register the demo in `packages/docs/components/effects-demos/registry.ts`:

- Import the preview component and the real effect schema (or read it from `effect().definition.schema`).
- Add an entry with `id: 'effects-<effect-name>'`.
- Add `initialValues` only for required fields whose schema default is `undefined`.

Use the `docs-demo` skill for demo details.

## 7. Add and render the table-of-contents preview composition

The TOC card must come from a real Remotion composition in `packages/docs`, not a hand-written asset.
Always render preview assets as PNG files.

Add a `Still` to `packages/docs/src/remotion/Root.tsx` under the `effect-previews` folder:

```tsx
<Still
	id="effects-my-effect-preview"
	component={EffectsMyEffectPreview}
	width={1280}
	height={720}
	defaultProps={{
		amount: 1,
	}}
/>
```

Use the same `width` and `height` as the preview component's `CanvasImage`.
If the preview component uses the shared docs preview image, keep
`fit="cover"` on `CanvasImage`. Rendering a 16:9 preview component into a
different aspect ratio can leave black bars in the generated TOC image.

Then render from `packages/docs`:

```bash
bunx remotion still src/remotion/entry.ts effects-my-effect-preview static/img/effects-my-effect-preview.png --overwrite --image-format=png
```

Commit both:

- The composition entry in `packages/docs/src/remotion/Root.tsx`
- The rendered image in `packages/docs/static/img/`

## 8. Generate docs card

Run:

```bash
cd packages/docs
bun render-cards.ts
```

Commit the generated `packages/docs/static/generated/articles-docs-effects-<effect-name>.png` and the new `image:` frontmatter line.

If `render-cards.ts` opportunistically generates unrelated missing cards, remove those unrelated files unless they belong to the current change.

## 9. Update the Remotion skill

Keep the agent-facing Remotion skill in sync with the new effect.

Update `packages/skills/skills/remotion/SKILL.md`:

- Add `effectName()` to the `Available effects:` line under `## Visual and pixel effects`.
- Keep the list sorted in the same order as `packages/docs/docs/effects/table-of-contents.tsx`.
- Keep this top-level entry concise; do not add props or examples here.

Do not duplicate the full list in `packages/skills/skills/remotion/rules/effects.md`; keep that rule limited to general usage mechanics unless the new effect changes import or installation conventions.

## 10. Format, build, and verify

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
- Do not forget to update the top-level available effects list in `packages/skills/skills/remotion/SKILL.md`.
- Do not leave temporary render entry points in `packages/docs/src/remotion`.
- Do not use a hand-written SVG for the effect TOC preview.
- Preserve alpha unless the effect intentionally changes it.
- For pixel math, be aware canvases store premultiplied alpha.
- WebGL color math often needs to unpremultiply the sampled RGB before luminance
  or threshold calculations, then premultiply the output RGB again.
