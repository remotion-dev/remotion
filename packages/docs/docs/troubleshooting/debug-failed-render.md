---
image: /generated/articles-docs-troubleshooting-debug-failed-render.png
sidebar_label: Debugging render failures
title: Debugging render failures
crumb: "Troubleshooting"
---

Since JavaScript code is executing, it may happen that a render may due to an exception. Here are general tips to troubleshoot the issue.

<Step>1</Step> <strong>Enable verbose logging</strong>

By enabling more detailed logging, all `console.log` statements from your code will be made visible alongside other debugging information.

From the CLI: Add the [`--log=verbose`](/docs/cli/render#--log) flag to your render command.  
From Node.JS: Add the [`verbose: true`](/docs/renderer/render-media#verbose) options to `renderMedia()`.

:::note
If you see a log multiple times, it is because the render is split up to multiple threads. Set `--concurrency=1` temporarily to only see each log once.
:::

<Step>2</Step> <strong>Adding logs to your project</strong>

Use `console.log` in your code to understand the order things are executing in and verify your assumptions about how your code should behave.

<Step>3</Step> <strong>Remove components one by one</strong>

Remove components until the video is empty. At which point does the error disappear? This can help you identify the component responsible for the render failure.

<Step>4</Step> <strong>Search issues and documentation</strong>

It's also helpful to check for [issues on GitHub](https://github.com/remotion-dev/remotion/issues) to see if other people have encountered similar problems. If you find an issue that matches your problem, you can add a comment to the issue to help the community troubleshoot the problem.

Also [search the documentation](/search) which has over 300 pages and contains troubleshooting instructions for many common problems.

<Step>5</Step> <strong>Ask for help</strong>

You can ask for help on GitHub and Discord. [Read on to see how to get help](/docs/get-help)!

## See also

- [Debug failed Lambda renders](/docs/lambda/troubleshooting/debug)
- [Ask for help](/docs/get-help)
