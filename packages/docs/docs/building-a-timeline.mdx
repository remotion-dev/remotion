---
image: /generated/articles-docs-building-a-timeline.png
id: building-a-timeline
title: Build a timeline-based video editor
sidebar_label: Build a timeline
crumb: 'Building video apps'
---

This document describes on a high-level how the [Remotion Player](/player) can be synchronized with a timeline.  
Read this document for guidance on building a video editor with the following characteristics:

- Multiple tracks that overlay each other
- Items can be arbitrarily placed on a track
- Items can be of different types (e.g. video, audio, text, etc.)

## Get the `<Timeline>` component

We offer a copy-pasteable `<Timeline>` component that follows Remotion's best practices and also already handles zoom.  
If you want to save time and get a head start, you can [purchase it in the Remotion Store](https://www.remotion.pro/timeline).

You can also build your own timeline component.  
The following steps will use the same approach we used to build our Timeline component.

## Watch the "Build a video editor in React" talk

Watch the talk "Build a video editor in React" by Jonny Burger, the creator of Remotion [here](https://www.youtube.com/watch?v=gYf_FWZGHng).  
You'll receive an outline of how to build a timeline, canvas, captioning and exporting functionality in just 30 minutes.

## Build your own timeline

<img src="/img/timelineitems.png" />
<br />
<br />
<Step>1</Step> Define a TypeScript type <code>Item</code> defining the different item types. Create another one for defining the shape of a <code>Track</code>:

```tsx twoslash title="types.ts"
type BaseItem = {
  from: number;
  durationInFrames: number;
  id: string;
};

export type SolidItem = BaseItem & {
  type: 'solid';
  color: string;
};

export type TextItem = BaseItem & {
  type: 'text';
  text: string;
  color: string;
};

export type VideoItem = BaseItem & {
  type: 'video';
  src: string;
};

export type Item = SolidItem | TextItem | VideoItem;

export type Track = {
  name: string;
  items: Item[];
};
```

<Step>2</Step> Create a component that can render a list of tracks.

```tsx twoslash title="remotion/Main.tsx"
// @filename: types.ts
type BaseItem = {
  from: number;
  durationInFrames: number;
  id: string;
};

export type SolidItem = BaseItem & {
  type: 'solid';
  color: string;
};

export type TextItem = BaseItem & {
  type: 'text';
  text: string;
  color: string;
};

export type VideoItem = BaseItem & {
  type: 'video';
  src: string;
};

export type Item = SolidItem | TextItem | VideoItem;

export type Track = {
  name: string;
  items: Item[];
};

// @filename: Main.tsx
// ---cut---
import type {Track, Item} from './types';
import React from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo} from 'remotion';

const ItemComp: React.FC<{
  item: Item;
}> = ({item}) => {
  if (item.type === 'solid') {
    return <AbsoluteFill style={{backgroundColor: item.color}} />;
  }

  if (item.type === 'text') {
    return <h1>{item.text}</h1>;
  }

  if (item.type === 'video') {
    return <OffthreadVideo src={item.src} />;
  }

  throw new Error(`Unknown item type: ${JSON.stringify(item)}`);
};

const Track: React.FC<{
  track: Track;
}> = ({track}) => {
  return (
    <AbsoluteFill>
      {track.items.map((item) => {
        return (
          <Sequence key={item.id} from={item.from} durationInFrames={item.durationInFrames}>
            <ItemComp item={item} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const Main: React.FC<{
  tracks: Track[];
}> = ({tracks}) => {
  return (
    <AbsoluteFill>
      {tracks.map((track) => {
        return <Track track={track} key={track.name} />;
      })}
    </AbsoluteFill>
  );
};
```

:::tip
In CSS, the elements that are rendered at the bottom appear at the top. See: [Layers](/docs/layers)
:::

<Step>3</Step> Keep a state of tracks each containing an array of items.{' '}

Render
a [`<Player />`](/docs/player/player) component and pass the `tracks` as [`inputProps`](/docs/player/player#inputprops).

```tsx twoslash title="Editor.tsx"
// @filename: types.ts
type BaseItem = {
  from: number;
  durationInFrames: number;
};

export type SolidItem = BaseItem & {
  type: 'shape';
  color: string;
};

export type TextItem = BaseItem & {
  type: 'text';
  text: string;
  color: string;
};

export type VideoItem = BaseItem & {
  type: 'video';
  src: string;
};

export type Item = SolidItem | TextItem | VideoItem;

export type Track = {
  name: string;
  items: Item[];
};

// @filename: remotion/Main.tsx
import React from 'react';
import type {Track} from '../types';
export const Main: React.FC<{
  tracks: Track[];
}> = ({tracks}) => {
  return null;
};

// @filename: Editor.tsx
// ---cut---
import React, {useMemo, useState} from 'react';
import {Player} from '@remotion/player';
import type {Item} from './types';
import {Main} from './remotion/Main';

type Track = {
  name: string;
  items: Item[];
};

export const Editor = () => {
  const [tracks, setTracks] = useState<Track[]>([
    {name: 'Track 1', items: []},
    {name: 'Track 2', items: []},
  ]);

  const inputProps = useMemo(() => {
    return {
      tracks,
    };
  }, [tracks]);

  return (
    <>
      <Player component={Main} fps={30} inputProps={inputProps} durationInFrames={600} compositionWidth={1280} compositionHeight={720} />
    </>
  );
};
```

<Step>4</Step> Build a timeline component: You now have access to the <code>tracks</code> state and can update it using the <code>setTracks</code> function.

We do not currently provide samples how to build a timeline component, since everybody has different needs and styling preferences.

An opinionated sample implementation is [available for purchase in the Remotion Store](https://www.remotion.pro/timeline).

```tsx twoslash title="remotion/Timeline.tsx" {23}
type Item = {};
type Track = {};
const inputProps = {};
import {Player} from '@remotion/player';
import {useState, useMemo} from 'react';

const Main: React.FC<{
  tracks: Track[];
}> = ({tracks}) => {
  return null;
};

const Timeline: React.FC<{
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}> = () => {
  return null;
};
// ---cut---
const Editor: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([
    {name: 'Track 1', items: []},
    {name: 'Track 2', items: []},
  ]);

  const inputProps = useMemo(() => {
    return {
      tracks,
    };
  }, [tracks]);

  return (
    <>
      <Player component={Main} fps={30} inputProps={inputProps} durationInFrames={600} compositionWidth={1280} compositionHeight={720} />
      <Timeline tracks={tracks} setTracks={setTracks} />
    </>
  );
};
```

## See also

- [Layers](/docs/layers)
