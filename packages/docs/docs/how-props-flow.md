---
image: /generated/articles-docs-how-props-flow.png
id: props-resolution
title: How props get resolved
crumb: "Parametrized videos"
---

import {HowPropsFlow} from '../components/HowPropsFlow';

## During rendering

Remotion performs an algorithm for determining the props that are being passed to your component when rendering the video.
Three factors play a role:

<Step>1</Step> <strong>Default props</strong> is the fallback data if no props are passed to the render. You can specify them using the <a href="/docs/composition#defaultprops"><code>defaultProps</code></a> property of your <a href="/docs/composition#defaultprops"><code>&lt;Composition /&gt;</code></a>.<br/>

<Step>2</Step> <strong>Input props</strong> is the data being passed while invoking a render, either via the <a href="/docs/renderer/render-media#inputprops"><code>inputProps</code></a> option, the <a href="/docs/cli/render#--props"><code>--props</code> flag</a> or using the render dialog in the Remotion Studio. <br/>

<Step>3</Step> <a href="/docs/composition#calculatemetadata"><code>calculateMetadata()</code></a> may be used to dynamically transform the props, as well as the metadata of the composition.

<br/>
<br/>

The following diagram shows how the props get resolved:

<HowPropsFlow/>

## In the Remotion Studio

In the Remotion Studio, the props are resolved in a similar way, but with a <strong>few differences</strong>:

<Step>1</Step> The default props can be <strong>edited in the right sidebar</strong>. Invalid modifications will be marked with a red outline and do not apply.<br/>
<Step>2</Step> If you render a video using the Render button, the <strong>input props form gets pre-propagated</strong> with the default props, including modifications in the right sidebar. <br/><br/>

The following rules <strong>stay the same</strong>, which you should be aware of:

<Step>1</Step> If you start the Studio with the <a href="/docs/cli/studio#--props"><code>--props</code></a> flag, this data will take priority over the default props, including modifications in the sidebar. It is not recommended to pass input props to the Studio. <br/>

<Step>2</Step> The passed input props may get transformed by <a href="/docs/composition#calculatemetadata"><code>calculateMetadata()</code></a>. <br/>
