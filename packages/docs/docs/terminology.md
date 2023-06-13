---
image: /generated/articles-docs-terminology.png
title: Terminology
crumb: "The Remotion dictionary"
---

Here we try to explain the meaning of some terms that are used often in the documentation, but are not self-explanatory. Which terms would you like to have explained? [Let us know](https://remotion.dev/issue)!

## Composition

A composition is the definition of a renderable asset. It consists of a React component, width, height, FPS and a duration. It can be registered in the [Remotion Studio](#remotion-studio) by rendering a [`<Composition>`](/docs/composition) (to render video or audio render target) or a [`<Still>`](/docs/still).

In the [Remotion Player](#remotion-player), you don't use the `<Composition>` component, rather you pass the component and metadata directly to the [`<Player>`](/docs/player).

## Sequence

A [`<Sequence>`](/docs/sequence) is a built-in component that manipulates the time for its children. For example, you might have an animation that starts at frame `0`. If you would like to delay the animation, rather than refactoring the animation, you can wrap it in a `<Sequence>` and define a delay using the [`from`](/docs/sequence#from) prop.

Using a sequence, you can also trim the start and end of an animation by passing the [`durationInFrames`](/docs/sequence#durationinframes) prop.

## Composition ID

The string that you pass to the [`<Composition>` component](#composition). You need the composition ID to reference what you would like to render, for example: `npx remotion render src/index <composition-id>`. See: [Defining compositions](/docs/the-fundamentals#defining-compositions)

## Bundle

Once you have written your video in React, you need to bundle it using Webpack in order to render it. The output artifact of the bundling process is called the bundle. It is a folder containing HTML, CSS, JavaScript and other assets.

When you render using the command line, a bundle is automatically generated. When you are using the Node.JS APIs, you need to use the [`bundle()`](/docs/bundle) method.

## Serve URL

A serve URL is a URL under which [the bundle](#bundle) is hosted. When rendering your video, Remotion will open a headless browser and visit that URL in order to make screenshots of it.

The most common use case for a serve URL is when rendering a video on Lambda, you need to deploy your [bundle](#bundle) to Amazon S3, which will turn [the bundle into a serve URL](/docs/lambda/cli/sites#create).

If you have a serve URL, you can also render a video locally by passing a serve URL instead of an [entry point](#entry-point). A serve URL doesn't have to be on S3, it can be on any provider that supports static deployments (e.g. Netlify, Vercel or GitHub pages) or even be a URL that runs on Localhost.

## Public Dir

The public dir is the directory in which you can put assets that can be loaded using [`staticFile()`](/docs/staticfile). By default, it is the directory that is named `public/` inside the [Remotion Root](#remotion-root).

## Remotion Root

The Remotion Root is the directory in which Remotion commands get executed in. It influences the default location of the [public dir](#public-dir), the `.env` file and the [config file](/docs/config) amongst others. To determine the Remotion Root, take the directory from which you execute commands or run scripts, and go upwards until you hit a directory that contains a `package.json` file. Many Remotion CLI commands also print the Remotion Root directory if you pass `--log=verbose`.

## Entry point

The entry point is the file where the Remotion CLI and Node.JS APIs will look for a Remotion project.

- By default in most templates, it is `src/index.ts`.
- In older projects, it may have an `.tsx` extension instead of `.ts`.
- The entry point can be passed to the render command, for example: `npx remotion render src/index.ts`.
- The entry point should call [`registerRoot()`](/docs/register-root).
- If you render a video using [`npx remotion render`](/docs/cli/render), the entry point is printed in grey.
- You can customize the entry point in the config file using [`Config.setEntryPoint()`](/docs/config#setentrypoint).

In the [Remotion Player](#remotion-player), there is no concept of an entry point. You directly pass a React component and metadata to the [`<Player>`](/docs/player/player).

## Remotion Studio

The Remotion Studio is the editor that opens that when you run [`npx remotion studio`](/docs/cli/studio) or `npx remotion preview`. It allows fast editing and playback of [compositions](#composition). It is included in the `@remotion/cli` package. It is not the same as the [Remotion Player](#remotion-player).

## Remotion Preview

The former name of the [Remotion Studio](#remotion-studio), renamed in v4.0. Since the Preview gained more capabilities than just previewing, the name was not fitting anymore.

## Remotion Player

The Remotion Player is a React component [`<Player>`](/docs/player) that can be embedded into a React app. It can be used by installing the `@remotion/player` package into a React app (for example: Create React App, Next.JS, Remix). It is not the same as the [Remotion Studio](#remotion-studio).

## Concurrency

For local rendering, concurrency refers to how many render processes are started in parallel. Each process holds a Chrome tab that renders web content and then screenshots it.

For rendering on Lambda, concurrency refers to the amount of Lambda functions that are spawned for a render.

Higher concurrency can lead to faster render times, but too high concurrency will lead to diminishing returns and to overload of the machines.

## Input props

Input props are data that can be passed to a render in order to parametrize the video. They can be obtained in two ways:

- This data is passed as actual React props to the component that you defined in your [composition](#composition)
- Using the [`getInputProps()`](/docs/get-input-props) function, you can retrieve the props even outside your component, for example to dynamically change the [duration or dimensions](/docs/dynamic-metadata).

In the [Remotion Studio](#remotion-studio), you can set [default props](/docs/composition#defaultprops) to serve as placeholder data for designing your video. If your input props don't override the default props, the default props will be used. See: [How props get resolved](/docs/props-resolution)

In the [Remotion Player](#remotion-player), there are no default props, but you can pass [`inputProps`](/docs/player/player#inputprops) directly to the [`<Player>`](/docs/player).

## Cloud Run Url

For rendering on Cloud Run, this url is the address you use to access the service that performs the render. It is possible to make use of a custom domain, by visiting the console in GCP and navigating to Cloud Run.

## Service Name

For rendering on Cloud Run, this is the name of the deployed service. It can be used as an alternative to the full Cloud Run url.
