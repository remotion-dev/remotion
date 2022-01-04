---
id: player
title: "@remotion/player"
slug: /player
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { PlayerExample } from "../../components/Player.tsx";
import { ExperimentalBadge } from "../../components/Experimental.tsx";

<ExperimentalBadge message="This player is currently in a beta state. We are done with the most important features we wanted to implement and will promote the Player to stable in the next version, if there is no feedback from users."/>

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
