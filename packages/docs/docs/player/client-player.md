---
image: /generated/articles-docs-player-index.png
title: "ClientPlayer "
---
import {TableOfContents} from '../../components/TableOfContents/player';

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Using the Remotion Client Player in React

The Remotion Client Player is a package that allows you to use Remotion's video player functionality on the client-side in React applications. This guide will walk you through the steps to integrate and use the client-player package in your React project.

All the usage is the same but instead of importing and installing @remotion/player you will import and install @remotion/client-player.

### Installation

To install the Player, run the following command in a React project:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm i remotion @remotion/client-player
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i remotion @remotion/client-player
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarn add remotion @remotion/client-player
```

  </TabItem>

</Tabs>
Rest docs remain the same

- [API](/docs/player/player)
