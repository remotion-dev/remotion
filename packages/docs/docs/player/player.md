---
id: player
title: "@remotion/player"
slug: /player
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { PlayerExample } from "../../components/Player.tsx";
import { ExperimentalBadge } from "../../components/Experimental.tsx";

Using the Remotion Player you can embed Remotion videos in any React app and customize the video content at runtime.

## Demo

Play the video, then tweak the parameters below the video.
<PlayerExample />

## Installation

To install the player, run the following command in a React project:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npm i remotion @remotion/player
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/player
```

  </TabItem>
</Tabs>
