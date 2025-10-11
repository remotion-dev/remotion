---
image: /generated/articles-docs-editor-starter-fonts.png
title: Fonts in the Editor Starter
sidebar_label: Fonts
id: fonts
crumb: Editor Starter
---

The Editor Starter comes with various features for controlling which fonts are used by the text and caption items.  
The font stack is implemented on [`@remotion/google-fonts`](/docs/google-fonts).

## Supported font features

- Changing the font family ("Helvetica" / "Roboto")
- Changing the font style ("Regular" / "Bold" / "Italic")
- Changing the font size
- Changing the text color
- Changing the font stroke (width and color)
- Changing the line height
- Changing the letter spacing
- Changing the text alignment ("Left" / "Center" / "Right")
- Changing the text direction (to support right-to-left languages like Arabic)

The controls for text are mostly collected in the [`TextInspector`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20TextInspector&type=code) component.

## Default font families

By default, the [top 250 most popular fonts from the Google Fonts](/docs/font-picker#show-only-the-250-most-popular-google-fonts) catalog are included in the font selector.  
In addition, `TikTok Sans` was added, because it is the default font for TikTok.

### Changing the default font families

Change the script [`generate-google-font-info.ts`](https://github.com/remotion-dev/editor-starter/blob/main/src/scripts/generate-google-font-info.ts) to include the fonts you want to include.

See the [font picker docs](/docs/font-picker) to for example get a list of more fonts.

Then run:

```bash
bun src/scripts/generate-google-font-info.ts
```

To regenerate the necessary files in `src/editor/data`.

## Lazy-loading font metadata

Every font has metadata which includes the available font family, font style, font weight, font display, font subsets, font variations, and links to the font files.

Storing all of this metadata on the client for all of the 250 default fonts would already result in a bundle size increase of 10MB.

Because of this, font metadata is being stored in the backend and only the metadata of the fonts that are required are loaded to the client. This is the reason for the [`GET /api/font/:name`](/docs/editor-starter/backend-routes#get-apifontname) endpoint.

## Previews in the font dropdown

Each font family in the font dropdown is rendered in the font itself.  
For this, a special font file is loaded from the Google Fonts CDN which only contains the characters that are needed to render the font family.

See the [`FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT`](/docs/editor-starter/features#font-family-preview) feature to see how it works.

## Hover to preview font family

When hovering over an item in the font dropdown, the text item in the canvas updates with a preview of what the item would look like if the hovered item was selected.

See the [`FEATURE_FONT_FAMILY_DROPDOWN_HOVER_PREVIEW`](/docs/editor-starter/features#hover-to-preview-font-family) feature to see how it works.

## Custom fonts

Loading fonts from another source than Google Fonts is not foreseen in the Editor Starter.  
You will have to refactor the Editor Starter to be able to load fonts from other sources. We recommend using [`@remotion/fonts`](/docs/fonts-api) for this.
