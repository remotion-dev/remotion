---
image: /generated/articles-docs-miscellaneous-automatic-duration.png
sidebar_label: Automatic duration
title: Calculating the duration of a composition automatically
crumb: 'FAQ'
---

It is currently **not supported** to derive the duration of a composition be from the content. The reason for it are the following:

- **Not all compositions are finite:**  
  Here is an example of a component of which it is impossible to calculate the duration of:

  ```tsx twoslash title="InfiniteComposition.tsx"
  import React from 'react';
  import {useCurrentFrame} from 'remotion';

  const InfiniteComposition: React.FC = () => {
    const frame = useCurrentFrame();
    return <div>{frame}</div>;
  };
  ```

- **`<Series>` and `<Sequence>` can be dynamic too**  
  While it is true that many compositions use [`<Sequence>`](/docs/sequence) or [`<Series>`](/docs/series) from which the duration could be derived in many cases, it is also not a bulletproof solution.

  It is perfectly acceptable to change the values of the `from` or `durationInFrames` props of a [`<Sequence>`](/docs/sequence) over time:

  ```tsx twoslash title="ChangingDuration.tsx"
  import {Sequence, useCurrentFrame} from 'remotion';

  const ChangingDuration: React.FC = () => {
    const frame = useCurrentFrame();

    return (
      // This is fine!
      <Sequence from={frame} durationInFrames={30}>
        <div>Hello World!</div>
      </Sequence>
    );
  };
  ```

  A practical usecase of this is [to change the speed of a video over time](/docs/miscellaneous/snippets/accelerated-video).

- **Remotion is only aware of the current frame:**  
  Remotion does not see the component statically like we do as developers, instead it only renders it at a certain point in time. To reliably determine when a component stops rendering markup, Remotion would have to loop through all frames until the markup stops which could be an expensive operation.

In summary, the dynamicity of React does not allow for a simple solution of deriving the duration reliably. We foresee that if a heuristic is used to determine the duration and it gets it wrong, it will lead to hard to debug cases.

We suggest to calculate the duration using the [dynamic duration method](/docs/dynamic-metadata) described here.
