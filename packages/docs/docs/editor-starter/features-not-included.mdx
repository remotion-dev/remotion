---
image: /generated/articles-docs-editor-starter-features-not-included.png
title: Features not included in the Editor Starter
sidebar_label: Features not included
id: features-not-included
crumb: Editor Starter
---

The Remotion Editor Starter aims to include only the obvious features that every video editor needs.

Certain features may:

- require a too opinionated implementation or
- be too complex for buyers to understand and adopt or
- not be essential.

We design the Editor Starter to be a starting point for developers wanting to build apps with video editing capabilities, not a complete product.

Our focus is to give you something simple that you are able to understand and iterate on.

This means that if you want the include certain features, you will have to implement them yourself.  
The following list is an **incomplete** list of features that **we do not include**.

## Keyframing and animation

The properties of a layer are static and are not animated over time.

Should you want to include support for keyframes, we recommend that you replace the value type of a property with an array of keyframes and interpolate between them using the [`interpolate`](/docs/interpolate) function.  
Consider that most video editors allow you to edit the timing as well, you can achieve it using the [`Easing`](/docs/easing) functions.

## Transitions

No transition support is included in the Editor Starter.

If you would like to include support for transitions, we recommend that you first detect whether items on a track are adjacent (similar to what the [rolling edits](/docs/editor-starter/features#rolling-edits) feature does).
If items are adjacent, you can replace their normal rendering and render them in a [`<TransitionSeries>`](/docs/transitions/transitionseries) instead.

## Project management

You are responsible for building an interface for the user to manage their projects.  
Each instance of `<Editor />` is an isolated editor experience.

State is loaded through the [`loadState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+loadState&type=code) function if the [Save button](/docs/editor-starter/features#save-button) is enabled, or through [`getInitialState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20getInitialState&type=code) otherwise.  
State is saved through the [`saveState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+saveState&type=code) function if the [Save button](/docs/editor-starter/features#save-button) feature is enabled, or not at all otherwise.

If you want an user to allow to work on multiple projects, we foresee that you change these functions to properly load and save the corresponding projects and identify the current project for example through a URL parameter.

## Auto-save

We only [provide a feature](/docs/editor-starter/features#save-and-load) to manually save the state of the editor to local storage.  
Should you want to include an auto-save functionality, we recommend that you use the [`useFullState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+useFullState&type=code) hook to get the full state of the editor and use an `useEffect` to run code when the state changes.

See [the logic of `<SaveButton />`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+SaveButton&type=code) to see an example of [`useFullState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+useFullState&type=code).

## Mobile support

The Editor Starter is not optimized for use on phones.  
We foresee that you offer your video editing interface only for desktop users.

## Multiple frame rates

The frame rate of the editor starter is fixed to 30 fps by default, set by the [`DEFAULT_FPS`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+DEFAULT_FPS&type=code) constant.

If you would like to have a different default frame rate, you can change the constant.

If you want to support multiple frame rates, you need to mutate the state so that `undoableState.fps` changes to your desire. In addition, when you change the frame rate dynamically, you need to convert the items to the new frame rate.  
For example, each item has a `from` and `durationInFrames` property which is expressed in frames and needs to be converted to the new frame rate.

## Authentication

There is no login, authentication, authorization or user management included in the Editor Starter.  
We foresee that you mount the `<Editor />` component in a page that is shown only if the user is logged in if you desire to have a login flow.

Make sure to add adequate protection to the asset uploading, captioning and rendering endpoints that come with the template, as we have not added any protection to them.

## Arbitrary fonts

Our Font Picker is fully based on Google Fonts and by default only includes the most popular fonts.

If you would like to allow users to upload their own fonts or provide other fonts for your users, you need to refactor the Editor Starter to load the correct fonts during preview and rendering.  
[`@remotion/fonts`](/docs/fonts-api) is a good way to achieve this.

You also need to refactor the Font Picker to show the additional fonts from additional sources and may need to adjust the logic for [loading the dropdown preview font](/docs/editor-starter/features#font-family-preview) and for [loading the preview font when hovering over a font](/docs/editor-starter/features#hover-to-preview-font-family).

## Captioning long audio files

Currently, we use the OpenAI Whisper API to caption audio files, which is limited to audio files up to 25MB in size.  
It is left up to you to decide how to handle long audio files.

See: [Captioning - Limits](/docs/editor-starter/captioning#limits)

## Light mode

There is only one theme, a dark one.

## See also

- [Features included in the Editor Starter](/docs/editor-starter/features)
