---
image: /generated/articles-docs-editor-starter-asset-cleanup.png
title: Asset cleanup
sidebar_label: Asset cleanup
id: asset-cleanup
crumb: Editor Starter
---

You are responsible for cleaning up assets that were added by the user and are no longer needed.  
Assets may lay around in S3 storage buckets and in the local IndexedDB asset cache.

## When it is safe to delete assets

When the user deletes an asset, they may still undo the deletion by pressing <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd>.  
As long as the asset is referenced in the [undo stack](/docs/editor-starter/undo-redo), it is not safe to delete it.

If you want to clean up assets, you need to ensure that the undo stack is clean, or clear the undo stack.

## Getting deleted assets

When an asset is deleted, it is added to the `deletedAssets` array, part of the [`undoableState`](/docs/editor-starter/state-management).  
As mentioned above, you need to ensure that the user is unable to undo the deletion first.

## Deleting assets

### Deleting assets from IndexedDB

If you have a `assetId` from an object in the `deletedAssets` array, you can delete it from IndexedDB by calling the [`deleteCachedAsset`](https://github.com/remotion-dev/editor-starter/blob/9fdd35812f8505273edf29f207dd9d021c901491/src/editor/caching/indexeddb.ts#L92) method.

### Deleting assets from S3

If you have a `remoteFileKey` from an object in the `deletedAssets` array, you can delete it from S3 using the following code:

```ts title="Delete an asset from S3 - must be called from the backend"
import {getAwsClient} from '@remotion/lambda/client';
import {requireServerEnv} from '../../editor/utils/server-env';

const {REMOTION_AWS_BUCKET_NAME, REMOTION_AWS_REGION} = requireServerEnv();

const {client, sdk} = getAwsClient({
  region: REMOTION_AWS_REGION,
  service: 's3',
});

const command = new sdk.DeleteObjectCommand({
  Bucket: REMOTION_AWS_BUCKET_NAME,
  Key: remoteFileKey,
});

await client.send(command);
```

You only need to clear assets which have an `assetStatus` of `uploaded`.

### Removing from the state

Once an asset has been successfully deleted from S3 and IndexedDB, you can remove it from the state by calling the [`clearDeletedAsset()`](https://github.com/remotion-dev/editor-starter/blob/main/src/editor/state/actions/clear-deleted-asset.ts) method.

## See also

- [Asset uploads](/docs/editor-starter/asset-uploads)
- [Persistance](/docs/editor-starter/persistance)
