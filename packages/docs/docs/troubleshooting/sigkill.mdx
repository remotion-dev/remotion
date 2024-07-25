---
image: /generated/articles-docs-troubleshooting-sigkill.png
sidebar_label: SIGKILL
title: Process quit with signal SIGKILL
crumb: "Troubleshooting"
---

This error comes in multiple variants:

```txt title="Remotion Rust process killed"
Compositor quit with signal SIGKILL: [...]
```

```txt title="FFmpeg process killed"
FFmpeg quit with code null (SIGKILL)
```

## What is happening?

The operating system is either killing the Remotion process or the FFmpeg process.  
Most likely this is due to it taking too much memory.

## Memory management in Remotion

Remotion opens a cache for extracting video frames, which by default allows itself to fill up to 50% of the available memory used at the begin of the render.  
If Remotion realizes that the system is short on memory, it will halfen the cache size and free up memory.

However, if other processes are filling up memory, the Remotion process can be killed as soon as it allocates any memory.  
The same goes for the FFmpeg process.

## Lower the memory usage of Remotion

You can decrease the cache size of Remotion using the [`offthreadVideoCacheSizeInBytes`](/docs/renderer/select-composition#offthreadvideocachesizeinbytes).

## Ensure your Remotion version is up to date

We continuously improve the memory management of Remotion.  
The last version with improvements is [`v4.0.171`](https://remotion.dev/changelog).

## Lower the concurrency of Remotion

Set a lower [`concurrency`](/docs/terminology/concurrency) to open less browser tabs at once and thus less memory.

## Allocate more memory to your system

As a last resort, you can allocate more memory to your system to alleviate the problem.
