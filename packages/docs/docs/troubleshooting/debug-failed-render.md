---
image: /generated/articles-docs-troubleshooting-debug-failed-render.png
sidebar_label: Debug failed render
title: How to debug failed renders ?
crumb: "Troubleshooting"
---

When using Remotion to render videos, it's possible that your render may fail. If this happens, don't panic ! There are several steps you can follow to troubleshoot the issue.

- <Step>1</Step> Use the `log=verbose` flag
  
First and foremost, it's important to mention the "log=verbose" method. This allows you to add detailed logs to your project to understand the order of execution of elements and to verify your assumptions.

- <Step>2</Step> Adding logs to your project

Add logs to try to understand the order things are executing in and verifying your assumptions !

- <Step>3</Step> Remove components one by one

Try removing components until the video is empty. At which point does the error disappear ? This can help you identify the component responsible for the render failure.

- <Step>4</Step> Github issues

It's also helpful to check for issues on Github to see if other people have encountered similar problems. If you find an issue that matches your problem, you can add a comment to the issue to help the community troubleshoot the problem.

- <Step>5</Step> Discord

If you can't find a solution on Github, don't hesitate to ask for help on Discord. The community is very helpful and will be happy to assist you in troubleshooting any issues you encounter.