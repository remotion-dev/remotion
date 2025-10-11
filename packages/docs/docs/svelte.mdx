---
image: /generated/articles-docs-svelte.png
id: svelte
sidebar_label: 'Integration into Svelte'
title: 'Using Remotion in Svelte'
crumb: 'Integrations'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Using Remotion in Svelte

This guide explains how to integrate Remotion into a **Svelte** project.

## Install required packages

Install Remotion and necessary dependencies:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'pnpm', value: 'pnpm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'bun', value: 'bun', },
]
}>
<TabItem value="npm">

```bash title="Use npm as the package manager"
npm i remotion @remotion/player @remotion/cli react react-dom
npm i --save-dev @types/react @types/react-dom
```

  </TabItem>
  <TabItem value="pnpm">

```bash title="Use pnpm as the package manager"
pnpm i remotion @remotion/player @remotion/cli react react-dom
pnpm i --dev @types/react @types/react-dom
```

  </TabItem>

  <TabItem value="yarn">

```bash title="Use Yarn as the package manager"
yarn add remotion @remotion/player @remotion/cli react react-dom
yarn add --dev @types/react @types/react-dom
```

  </TabItem>

  <TabItem value="bun">

```bash title="Use Bun as the package manager and runtime"
bun i remotion @remotion/player @remotion/cli react react-dom
bun --dev @types/react @types/react-dom
```

:::note
Bun as a runtime is mostly supported. [Read more here](/docs/bun).
:::

  </TabItem>
</Tabs>

## Create a Remotion folder

For better separation, create a folder to hold your Remotion files:

```plaintext
src/remotion
```

Copy the contents of your Remotion project or a starter template (e.g., HelloWorld) into this new folder. This will help separate Remotion related files from the rest of your Svelte codebase.

## Copy `remotion.config.ts`

Copy the `remotion.config.ts` file to the root directory of your Svelte project, placing it at the same level as `package.json`.

This configuration file is necessary for Remotion to recognize and compile your project settings.

## Configure TypeScript for JSX

To enable JSX support in Svelte, update the `tsconfig.app.json` file by setting `"jsx": "react"` under `compilerOptions`. This configuration allows Svelte to interpret JSX syntax used in Remotion's React components.

```json title="tsconfig.json"
{
  "compilerOptions": {
    "jsx": "react",
    // other options
  }
}
```

## Create a React wrapper component for Svelte

To embed Remotion components in Svelte, create a **wrapper component**:

1. In your `remotion` folder, create a file named `PlayerViewWrapper.svelte`.

```html title="PlayerViewWrapper.svelte"
<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import React from "react";
    import {createRoot, type Root} from "react-dom/client";
    import {type PlayerSchema, PlayerView} from "./PlayerView";
    import {type PlayerRef} from "@remotion/player";

    let {data, player = $bindable<PlayerRef>(), onPaused} = $props<{ data: PlayerSchema, player: PlayerRef, onPaused: void }>()
    let containerRef;
    let root: Root;

    // used to rerender the player when changes made
    $effect(() => {
        // we need to access the property in the $effect, because Svelte doesn't automatically detect deep changes. Use flat structure or Svelte Store instead.
        console.log(data.titleText)
        render()
    });

    function render() {
        if (!containerRef || !root) return;
        root.render(
            React.createElement(PlayerView, {
                ref: (ref) => {
                    player = ref?.playerRef
                }, data, onPaused,
            }),
        );
    }

    onMount(() => {
        root = createRoot(containerRef);
        render();
    });

    onDestroy(() => {
        root?.unmount();
    });
</script>

<div bind:this={containerRef}></div>
```

This wrapper component will serve as the bridge between Svelte and Remotion’s React components.

## Create a wrapper for the Remotion Player

1. In your `remotion` folder, create a file named `PlayerView.tsx`.
2. Ensure each `.tsx` file imports React explicitly at the top of the file:

This will get the reference to the player with `createRef`.

```tsx title="PlayerView.tsx"
import React, {forwardRef, useEffect, useImperativeHandle} from "react";
import {Player, type PlayerRef} from "@remotion/player";
import {HelloWorld} from "./HelloWorld";

export interface PlayerSchema {
    titleText: string
    titleColor: string
    logoColor1: string
    logoColor2: string
}

export const PlayerView = forwardRef((props: { data: PlayerSchema, onPaused?: () => void }, ref) => {

    const playerRef: React.RefObject<PlayerRef> = React.createRef()

    useEffect(() => {
        if (playerRef.current) {

            // add callback when player pauses
            playerRef.current.addEventListener('pause', () => {
                props.onPaused?.()
            })
        }
    }, [])

    useImperativeHandle(ref, () => ({
        get playerRef() {
            return playerRef.current;
        },
    }));

    return <Player
        ref={playerRef}
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        compositionHeight={1080}
        compositionWidth={1920}
        inputProps={props.data}
        style={{width: '100%'}}
        controls
    />
})
```

## Use the component in Svelte

To display the Remotion player within an Svelte template, add your new wrapper component wherever you'd like the Player to appear:

```html
<PlayerViewWrapper bind:player={player} {onPaused} {data}/>
```

This Svelte component tag will render the Remotion Player, allowing you to pass data or configuration as needed through Svelte's data binding.

You're now able to use the [`API`](/docs/player/player) of the player via the `player` binding.

## See also

- [Source code for this documentation](https://github.com/remotion-dev/svelte-starter)
- [Integration into Angular](/docs/angular)
- [Integration into Vue](/docs/vue)

<Credits
  contributors={[
    {
      username: 'dothem1337',
      contribution: 'Author',
    },
  ]}
/>
