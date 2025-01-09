---
image: /generated/articles-docs-miscellaneous-snippets-freeze-portions.png
title: 'Freeze portions of a sequence'
sidebar_label: Freeze a portion
crumb: 'Snippets'
---

With the following snippet, two portions of a sequence are frozen and resumed afterwards from the point they were paused.

```tsx twoslash
import React, {useMemo} from 'react';
import {Freeze, Sequence, useCurrentFrame} from 'remotion';

export const Counter: React.FC = () => {
  return (
    <div className="flex h-full justify-center items-center text-6xl">
      {useCurrentFrame()}
    </div>
  );
};

const FREEZES = [
  {
    frame: 0,
    durationInFrames: 25,
  },
  {
    frame: 30,
    durationInFrames: 50,
  },
];

const getFreezes = () => {
  let summedUpFreezes = 0;
  const freezeFrames = [];
  for (const freeze of FREEZES) {
    freezeFrames.push({
      start: summedUpFreezes + freeze.frame,
      durationInFrames: freeze.durationInFrames,
      from: summedUpFreezes,
      frame: freeze.frame,
    });
    summedUpFreezes += freeze.durationInFrames;
  }
  return freezeFrames;
};

export const FreezePortion: React.FC = () => {
  const freezes = useMemo(() => {
    return getFreezes();
  }, []);
  const frame = useCurrentFrame();

  const nextFreeze = freezes.find(
    (freeze) => frame < freeze.start + freeze.durationInFrames,
  );
  const activeFreeze = freezes.find(
    (freeze) =>
      frame >= freeze.start && frame < freeze.start + freeze.durationInFrames,
  );

  const from = useMemo(() => {
    if (activeFreeze) {
      return 0;
    }

    if (nextFreeze) {
      return nextFreeze.from;
    }

    return (
      freezes[freezes.length - 1].from +
      freezes[freezes.length - 1].durationInFrames
    );
  }, [activeFreeze, freezes, nextFreeze]);

  return (
    <Freeze
      frame={activeFreeze ? activeFreeze.frame : 0}
      active={Boolean(activeFreeze)}
    >
      <Sequence layout="none" from={from}>
        <Counter />
      </Sequence>
    </Freeze>
  );
};
```
