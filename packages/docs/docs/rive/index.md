---
id: rive
sidebar_label: Overview
title: "@remotion/rive"
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

This package provides a component for rendering [Rive](https://rive.app) animations in Remotion

## Installation

Install `@remotion/rive`

<Tabs defaultValue="npm" values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm i @remotion/rive
```

</TabItem>
<TabItem value="yarn">
```bash
yarn add @remotion/rive
```
</TabItem>
<TabItem value="pnpm">
```bash
pnpm i @remotion/rive
```
</TabItem>
</Tabs>

## Props

- `src`: a valid URL of the rive file to load. When it is left empty, the default animation is rendered.

## Usage

```jsx
import { Rive } from "@remotion/rive";

function App() {
  return (
    <div>
      <Rive src="https://example.com/myAnimation.riv" />
    </div>
  );
}
```
