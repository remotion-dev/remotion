---
id: 2-0-migration
title: v2.0 Migration guide
---

:::warning
This function is part of Remotion 2.0 which is not yet released. The information on this page might not yet accurately reflect the current state of Remotions API.
:::warning

The following is a list of breaking changes in Remotion 2.0, as a reference for projects wanting to upgrade.

## Sequences are 1 frame shorter

Because of a mistake in v1, sequences were 1 frame too long. The new behavior sees each composition be 1 frame shorter, but be consistent with the the duration of compositions.

The behavior of sequences is now the following, as explained by an example: If `durationInFrames` is 60 and `from` is 0, the sequence goes from frame 0 to 59 (60 frames in total), same as a composition with the same duration. In versions 1.x of Remotion, a sequence with the same attributes would go from frame 0 to 60 (61 frames in total).

**Upgrade path**: Check your sequence lengths and if necessary, increase the duration by 1 frame.
