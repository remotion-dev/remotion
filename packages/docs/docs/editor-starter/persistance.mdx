---
image: /generated/articles-docs-editor-starter-persistance.png
title: Persistance in the Editor Starter
sidebar_label: Persistance
id: persistance
crumb: Editor Starter
---

There are 3 types of persistance in the Editor Starter:

- Saving the editor state
- Caching the [assets](/docs/editor-starter/tracks-items-assets) (videos, images, audio, etc.) in IndexedDB
- Saving the loop setting

## Saving the editor state

The functions [`saveState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20saveState&type=code) and [`loadState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20loadState&type=code) are used to save and load the editor state.

### Location

By default, the state is saved to the browser's local storage.

If you want to save the state remotely, you can:

1. change the implementation of these functions
2. turn these function into promises
3. `await` their usage.

### Triggering a save

There are 2 ways to save the state:

- By clicking the "Save" button in the top toolbar
- By using the keyboard shortcut <kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + <kbd>S</kbd> ([source](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+const+SaveShortcut&type=code))

See our suggestion for implementing an [auto-save](/docs/editor-starter/features-not-included#auto-save) feature if you want to save the state automatically.

### Scope

By default only the [undoable state](/docs/editor-starter/state-management#undoable-state) is persisted.

The Editor Starter has a simplified assumption that the undoable state portion of the state that should be persisted.

If you also want to persist parts of the non-undoable state, you can accept more data in the [`saveState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20saveState&type=code) and [`loadState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20loadState&type=code) functions.

### Disabling

The save functionality is behind the feature flags [`FEATURE_SAVE_BUTTON`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_SAVE_BUTTON&type=code) and [`FEATURE_SAVE_SHORTCUT`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_SAVE_SHORTCUT&type=code).

Disable the flag or delete the flag and all the code that is behind it to disable the save functionality.

### Persistance key

When using the default implementation of the `saveState()` and `loadState()` functions, the state is saved to the browser's local storage under a versioned key, e.g. `const key = 'remotion-editor-starter-state-v1'`.

Make sure to only save states to this key that are compatible with the schema you operate on at runtime.  
If you change the structure of your state, consider incrementing the version of the key, or migrating the state to the new schema at load.

## Caching assets

Because loading the assets remotely can be slow, the Editor Starter caches them in IndexedDB and prefers them over remote assets when displaying.

The [`indexeddb.ts`](https://github.com/remotion-dev/editor-starter/blob/main/src/editor/caching/indexeddb.ts) file contains the implementation of the IndexedDB.

Assets need to be manually cleaned up when they are no longer needed: [Asset cleanup](/docs/editor-starter/asset-cleanup)

The [`<DownloadRemoteAssets>`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20DownloadRemoteAssets&type=code) component downloads any assets that are remote and caches them locally.

The [`<UseLocalCachedAssets>`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20UseLocalCachedAssets&type=code) component loads cached assets from IndexedDB and turns them into blob URLs.  
In addition, the [`initialize()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+const+initialize&type=code) function will load any cached assets from IndexedDB before the initial editor state loaded, to prevent any requests to the remote server if possible.

## Loop setting

In [`src/editor/state/loop-persistance.ts`](https://github.com/remotion-dev/editor-starter/blob/main/src/editor/state/loop-persistance.ts), there is logic for persisting the loop setting.

## See also

- [Asset uploads](/docs/editor-starter/asset-uploads)
- [Asset cleanup](/docs/editor-starter/asset-cleanup)
