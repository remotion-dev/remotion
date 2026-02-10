# Add a new CLI option

How to convert a hardcoded CLI flag into a proper `AnyRemotionOption`, or add a brand new one.

## 1. Create the option definition

Create `packages/renderer/src/options/<name>.tsx`:

```tsx
import type {AnyRemotionOption} from './option';

let myValue = false; // module-level default state

const cliFlag = 'my-flag' as const;

export const myFlagOption = {
  name: 'Human-readable Name',
  cliFlag,
  description: () => <>Description shown in docs.</>,
  ssrName: null, // or 'myFlag' if used in SSR APIs
  docLink: 'https://www.remotion.dev/docs/config#setmyflagenabled',
  type: false as boolean, // default value, also sets the TypeScript type
  getValue: ({commandLine}) => {
    if (commandLine[cliFlag] !== undefined) {
      return {value: commandLine[cliFlag] as boolean, source: 'cli'};
    }
    return {value: myValue, source: 'config'};
  },
  setConfig(value) {
    myValue = value;
  },
} satisfies AnyRemotionOption<boolean>;
```

The type in `AnyRemotionOption<T>` and `type: <default> as T` determines the option's value type. Use `boolean`, `string | null`, `number | null`, etc.

For negating flags (like `--disable-ask-ai` → `askAIEnabled = false`), handle the inversion in `getValue`.

## 2. Register in options index

**`packages/renderer/src/options/index.tsx`**:

- Add the import (keep alphabetical within the import block)
- Add the option to the `allOptions` object

This makes it available as `BrowserSafeApis.options.myFlagOption` throughout the codebase.

## 3. Update CLI parsed flags

**`packages/cli/src/parsed-cli.ts`**:

- For boolean flags, add `BrowserSafeApis.options.myFlagOption.cliFlag` to the `BooleanFlags` array
- For non-boolean flags, no entry needed here (minimist handles them as strings/numbers automatically)

**`packages/cli/src/parse-command-line.ts`**:

- Add to the destructured `BrowserSafeApis.options`
- In the `CommandLineOptions` type, add: `[myFlagOption.cliFlag]: TypeOfOption<typeof myFlagOption>;`

## 4. Use the option where needed

Instead of reading `parsedCli['my-flag']` directly, resolve via:

```ts
const myFlag = myFlagOption.getValue({commandLine: parsedCli}).value;
```

For Studio options, this is typically in `packages/cli/src/studio.ts`. For render options, in the relevant render command file.

## 5. Add to Config

**`packages/cli/src/config/index.ts`**:

- Add to the destructured `BrowserSafeApis.options`
- Add the setter signature to the `FlatConfig` type (either in the `RemotionConfigObject` global interface or the `FlatConfig` intersection)
- Add the implementation to the `Config` object: `setMyFlagEnabled: myFlagOption.setConfig`

## 6. Update docs

In the relevant CLI command page:

- Add a `### \`--my-flag\`` section
- Use `<Options id="my-flag" />` to pull the description from the option definition automatically
- The `id` matches the option's `cliFlag` value

**`packages/docs/docs/config.mdx`**:

- Add a `## \`setMyFlagEnabled()\`` section with:
  - `<Options id="my-flag" />` for the description
  - A twoslash config example
  - A note that the CLI flag takes precedence

Follow the pattern of nearby entries (e.g., `setAskAIEnabled`, `setEnableCrossSiteIsolation`).

## 7. Build and verify

```sh
cd packages/renderer && bun run make
cd packages/cli && bun run make
```

## Reference files

- Option type definition: `packages/renderer/src/options/option.ts`
- Good example to copy: `packages/renderer/src/options/ask-ai.tsx` (boolean, studio-only)
- Options index: `packages/renderer/src/options/index.tsx`
- CLI flag registration: `packages/cli/src/parsed-cli.ts`
- CLI type definitions: `packages/cli/src/parse-command-line.ts`
- Config registration: `packages/cli/src/config/index.ts`
