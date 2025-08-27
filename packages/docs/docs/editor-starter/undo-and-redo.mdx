---
image: /generated/articles-docs-editor-starter-undo-and-redo.png
title: Undo and Redo
sidebar_label: Undo and Redo
id: undo-redo
crumb: Editor Starter
---

The Editor Starter implements a basic Undo and Redo feature.  
It works by keeping an array of snapshots of the [undoable state](/docs/editor-starter/state-management#undoable-state) of the editor in memory.

## Undo stack

An undo stack is an array of previous states that is being kept in memory.  
By default, the undo stack holds 50 states.

Whenever updating a state, you should set the `commitToUndoStack` property appropriately to indicate whether the state update should be committed to the undo stack.

Actions that you may not want to add to the undo stack are high-frequency state update like:

- Dragging an item in the canvas
- Dragging an item in the timeline
- Trimming an item in the timeline
- Changing a value in the inspector with the slider

In these cases, it is appropriate to only commit to the undo stack once the **mouse cursor is released**.

## Preventing unnecessary additions to the undo stack

The undo stack only adds a new entry when the state object reference actually changes.  
If a state update results in `oldState === newState` evaluating to `true`, no entry is added to the undo stack.

See [Preventing state updates when nothing has changed](/docs/editor-starter/state-management#preventing-state-updates-when-nothing-has-changed) for more information.

## Undo and Redo interactions

You can undo and redo actions:

- by using the buttons
- the built-in keyboard shortcuts: <kbd>Ctrl</kbd> + <kbd>Z</kbd> for undo and <kbd>Ctrl</kbd> + <kbd>Y</kbd> for redo.

This behavior is controlled by the following [flags](/docs/editor-starter/features):

- [`FEATURE_UNDO_BUTTON`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_UNDO_BUTTON&type=code)
- [`FEATURE_REDO_BUTTON`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_REDO_BUTTON&type=code)
- [`FEATURE_UNDO_SHORTCUT`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_UNDO_SHORTCUT&type=code)
- [`FEATURE_REDO_SHORTCUT`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_REDO_SHORTCUT&type=code)

## See also

- [State management](/docs/editor-starter/state-management)
