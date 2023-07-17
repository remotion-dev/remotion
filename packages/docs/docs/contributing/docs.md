---
image: /generated/articles-docs-contributing-docs.png
title: Contributing to the documentation
sidebar_label: Writing docs
crumb: Contributing
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Good documentation makes the difference between frustration and joy! We happily accept contributions to the Remotion documentation.

## Editing an existing page

At the bottom of each page, the `Improve this page` button is the easiest way to edit a page. You don't even need to setup the repository locally.

## Submitting a new page

<Tabs
defaultValue="quick"
values={[
{ label: 'Basic setup (quicker)', value: 'quick', },
{ label: 'Full docs', value: 'full', },
]
}>
<TabItem value="quick">

This method will avoid having to compile all docs. You cannot validate if links to other docs are valid.

<Step>1</Step> Set up the Remotion repository <a href="/docs/contributing">according the instructions here</a>. <br/>
<Step>2</Step> Run <code>node new-doc.mjs</code> and follow the instructions.<br/>

  </TabItem>

  <TabItem value="full">

<Step>1</Step> Set up the Remotion repository <a href="/docs/contributing">according the instructions here</a>. <br/>
<Step>2</Step> Create a new <code>.md</code> document in the <code>packages/docs/docs</code> folder. <br/>
<Step>3</Step> Add the document to <code>packages/docs/sidebars.js</code>.<br/>
<Step>4</Step> Write what you have to say!<br/>
<Step>5</Step> Run <code>node render-cards.mjs</code> in <code>packages/docs</code> to generate preview cards that will show up if the documentation page is shared on social media.<br/>

  </TabItem>

</Tabs>

## Language guidelines

- **Keep it brief**: Developers don't like to read, so adding too much words will lead to information being lost.
- **Link to terminology**: When using a Remotion-specific term, link to the [terminology](/docs/terminology) page that explains it.
- **Avoid emotions** and filler language ("Great! Let's move on to the next step"). Usually it can be removed without losing any information.
- **Separate into multiple paragraphs** if a section is becoming too long.
- **Address the reader as "you"** and not "we".
- **Don't blame the user**: Instead of "You have provided the wrong input", say "The input is invalid" or "the wrong input was provided".
- **Don't assume it is easy**: Avoid using the words "simply" and "just" as beginners might not find it as simple as you do.

## Adding code snippets

You can add codesnippets by beginning a paragraph with three backticks: <code>```</code>. The code will be highlighted according to the language you specify after the backticks.

<p>
<code>```ts</code> will highlight the code as TypeScript.
</p>

### Type safe snippets

<p>
<code>```ts twoslash</code> will make a snippet type-safe - it will be checked against the TypeScript compiler. This is the preferred way of writing docs, but if it is too hard, you don't have to do it.
</p>

<p>
When writing typesafe snippets, sometimes it does not make sense to list all import statements at the top.<br />You can add a line stating <code>// ---cut---</code> and only the content below will be displayed.
</p>

### Titles

Add a title to a code snippet by adding a line with <code>```ts twoslash title="file.ts"</code>:<br/>

```ts twoslash title="file.ts"
console.log("Hello World");
```

## Special formatting

### Steps

Use `<Step>` to create lists:

```md
- <Step>1</Step> Step 1
- <Step>2</Step> Step 2
```

- <Step>1</Step> Step 1
- <Step>2</Step> Step 2

### Mark as experimental

Use `<ExperimentalBadge />` to mark something as experimental:

```md
<ExperimentalBadge>
<p>This feature is still experimental.</p>
</ExperimentalBadge>
```

<ExperimentalBadge>
<p>This feature is still experimental.</p>
</ExperimentalBadge>

### Demos

Using `<Demo type="[demo-name]" />` you can render a [Remotion Player](/docs/terminology#remotion-player) and specify props that can be updated.

```md
<Demo type="rect"/>
```

<Demo type="rect"/>

The demo needs to be implemented in `packages/docs/components/demos/index.tsx`.

## See also

- [General information](/docs/contributing)
- [Implementing a new feature](/docs/contributing/feature)
- [Implementing a new option](/docs/contributing/option)
- [How to take a bounty issue](/docs/contributing/bounty)
