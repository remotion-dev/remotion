---
id: 3-0-migration
sidebar_title: v3.0 Migration
title: v3.0 Breaking changes
---

When upgrading from Remotion 2 to Remotion 3, note the following changes and apply them to your project.

## `renderFrames` doesn't take `compositionId` parameter anymore

Instead, the composition ID is now embedded in the `config` object.

**Upgrade path:** Remove the `compositionId` property from `renderFrames()`.
