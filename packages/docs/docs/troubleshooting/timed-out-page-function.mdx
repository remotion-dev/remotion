---
image: /generated/articles-docs-troubleshooting-timed-out-page-function.png
title: "Timed out evaluating page function"
sidebar_label: Timed out evaluating page function
crumb: "Troubleshooting"
---

The error message "Timed out evaluating page function"

```
Error: Timed out evaluating page function (f, c) => {
  window.remotion_setFrame(f, c);
}
```

generally happens if the Remotion renderer is trying to send a JavaScript command to the browser, but the browser does not respond to it within the timeout (before `v4.0.73`: 5 second, from `v4.0.73`: the [`--timeout`](/docs/cli/render#--timeout) flag, by default 30 seconds).

This means that the browser is hanging due to CPU and memory overload. It does not imply that a [`delayRender()`](/docs/delay-render) was not cleared.

To resolve this, consider:

- Decreasing the [`--concurrency`](/docs/cli/render#--concurrency) of the render
- Measuring memory and CPU usage of your render and adding more resources to it
- Increasing the [`--timeout`](/docs/cli/render#--timeout) flag
- Looking for ways to speed up your JavaScript code
  - Watch out for infinite loops in your code and [debug your render](/docs/troubleshooting/debug-failed-render)

## See also

- [Debugging timeouts](/docs/timeout)
