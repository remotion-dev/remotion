---
image: /generated/articles-docs-audio-order-of-operations.png
title: Order of Operations
sidebar_label: Order of Operations
id: order-of-operations
crumb: 'Audio'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {AvailableFrom} from '../../src/components/AvailableFrom';

Before Remotion v4.0.141, it was not defined in which order audio and video operations would be applied. Behavior in preview and render could deviate.

Since Remotion v4.0.141, the order of operations is guaranteed to be the following:

1. Trim audio (using [`trimBefore`](/docs/html5-audio#trimbefore--trimafter)).
2. Offset audio (by putting it in a [`<Sequence>`](/docs/sequence)).
3. Stretch audio (by adding a [`playbackRate`](/docs/html5-audio#playbackrate)).

Example for a 30 FPS composition which is 60 frames long:

1. An [`<Html5Audio>`](/docs/html5-audio) tag has a [`trimBefore`](/docs/html5-audio#trimbefore--trimafter) value of 45. The first 1.5 seconds of the audio get trimmed off.
2. The [`<Html5Audio>`](/docs/html5-audio) tag is in a [`<Sequence>`](/docs/sequence) which starts at `30`. The audio only begins playing at the 1.0 second timeline mark at the 1.5 second audio position.
3. The [`<Html5Audio>`](/docs/html5-audio) has a [`playbackRate`](/docs/html5-audio#playbackrate) of `2`. The audio gets sped up by 2x, but the starting position and start offset is not affected.
4. The composition is 60 frames long, so the audio must stop at the 3.5 second mark:
   > (comp_duration - offset) \* playback_rate + start_from  
   > (60 - 30) \* 2 + 45 => frame 105 or the 3.5 second mark
5. Result: The section of 1.5sec - 3.5sec gets cut out of the audio and is played in the Remotion timeline between frames 30 and 59 at 2x speed.
