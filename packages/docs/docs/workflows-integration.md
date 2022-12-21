---
image: /generated/articles-docs-workflows-integration.png
id: workflows-integration
title: Generate videos with Workflows
---

In order to generate videos, you can use your automated workflows in the tool of your choice.
This page will show you examples of workflows with different commonly used solutions.

## Global structure

The idea is to follow an implementation pattern regardless of the solution:

```
- Get composition props values from workflow inputs
- Fetch source code of the project
- Install ffmpeg (optional, remotion will do it anyways)
- Install dependencies
- Build video with CLI command (`remotion render` for example)
- Put rendered video inside workflow artifact
```

## Github action

Here is the example of integration with Github Action which is already available inside helloworld template.

- [See also: Render using GitHub Actions](/docs/ssr#render-using-github-actions)

```yaml
name: Render video
on:
  workflow_dispatch:
    inputs:
      titleText:
        description: "Which text should it say?"
        required: true
        default: "Welcome to Remotion"
      titleColor:
        description: "Which color should it be in?"
        required: true
        default: "black"
jobs:
  render:
    name: Render video
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@main
      - uses: actions/setup-node@main
      - run: sudo apt update
      - run: sudo apt install ffmpeg
      - run: npm i
      - run: echo $WORKFLOW_INPUT > input-props.json
        env:
          WORKFLOW_INPUT: ${{ toJson(github.event.inputs) }}
      - run: npm run build -- --props="./input-props.json"
      - uses: actions/upload-artifact@v2
        with:
          name: out.mp4
          path: out/video.mp4
```
