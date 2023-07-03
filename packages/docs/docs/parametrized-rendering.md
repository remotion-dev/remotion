---
id: parametrized-rendering
title: Parametrized videos
sidebar_label: Passing props
crumb: "How To"
---

Remotion allows for [ingesting](/docs/passing-props), [validating](/docs/schemas), [visually editing](/docs/visual-editing), and transforming data that may be used to parametrize a video.

Data may [influence the content](/docs/data-fetching) of the video, or the [metadata](/docs/dynamic-metadata) such as width, height, duration or framerate.

## High-level overview

Remotion allows the passing of [props](https://react.dev/learn/passing-props-to-a-component) to a React component.  
Props are a React concept and take the shape of a JavaScript object.

To determine the data which gets passed to the video, the following steps are taken:

<Step>1</Step> <strong>Default props</strong> are defined statically, so that the video can be designed in the Studio without any data. <br/>

<ul>
<li>
The default props define the shape of the data.
</li>
<li>
A schema can be defined and validated.
</li>
<li>
In absence of data, default props can be edited in the Remotion Studio.
</li>
</ul>
<Step>2</Step> <strong>Input props</strong> may be specified when rendering a video to override the default props.<br/>
<ul>
<li>
Input props will be merged together with default props, where input props have priority.
</li>
</ul>

<Step>3</Step> <strong>Using <a href="/docs/data-fetching"><code>calculateMetadata()</code></a></strong>, postprocessing of the props may be performed and metadata be dynamically calculated.<br/>

<ul>
<li>
For example, given a URL is passed as a prop, it may be fetched and the content added to the props.
</li>
<li>
Asynchronous calculation of the video duration and other metadata is also possible here.
</li>
</ul>
<Step>4</Step> <strong>The final props</strong> are passed to the React component.
<ul>
<li>
The component may dynamically render content based on the props.
</li>
</ul>

See [here](/docs/props-resolution) for a visual explanation and more details of how the resolution process works.

## Table of contents

- [Passing props](/docs/passing-props)
- [Defining a Schema](/docs/schemas)
- [Visual editing](/docs/visual-editing)
- [Data fetching](/docs/data-fetching)
- [Variable metadata](/docs/dynamic-metadata)
- [How props get resolved](/docs/props-resolution)

## See also

You can use the [Remotion Player](/docs/player) to display a Remotion component in a React app and dynamically change the content without rendering the video, to create experiences where the content updates in real-time.
