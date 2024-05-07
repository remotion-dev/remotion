---
image: /generated/articles-docs-studio-write-static-file.png
title: writeStaticFile()
crumb: "@remotion/studio"
---

# writeStaticFile()<AvailableFrom v="4.0.147"/>

Saves some content into a file in the [`public` directory](/docs/).  
This API is useful for building interactive experiences in the [Remotion Studio](/docs/terminology/studio).

## Examples

```tsx twoslash title="Write 'Hello world' to public/file.txt"
import React, { useCallback } from "react";
import { writeStaticFile } from "@remotion/studio";

export const WriteStaticFileComp: React.FC = () => {
  const saveFile = useCallback(async () => {
    await writeStaticFile({
      filePath: "file.txt",
      contents: "Hello world",
    });

    console.log("Saved!");
  }, []);

  return <button onClick={saveFile}>Save</button>;
};
```

```tsx twoslash title="Allow a file upload"
import React, { useCallback } from "react";
import { writeStaticFile } from "@remotion/studio";

export const WriteStaticFileComp: React.FC = () => {
  const saveFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files![0];

      await writeStaticFile({
        filePath: file.name,
        contents: await file.arrayBuffer(),
      });

      console.log("Saved!");
    },
    [],
  );

  return <input type="file" onChange={saveFile} />;
};
```

## Rules

<Step>1</Step> This API can only be used while in the Remotion Studio.
<br />
<Step>2</Step> The file path must be relative to the <a href="/docs/terminology/public-dir">
  <code>public</code> directory
</a>.
<br />
<Step>3</Step> It's not allowed to write outside the <a href="/docs/terminology/public-dir">
  <code>public</code> directory
</a>.<br />
<Step>4</Step> To write into subfolders, use forward slashes <code>/</code> even
on Windows.
<Step>5</Step> You can pass a <code>string</code> or <code>ArrayBuffer</code>.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/studio/src/api/write-static-file.ts)
- [`staticFile()`](/docs/staticfile)
- [`getStaticFiles()`](/docs/studio/get-static-files)
- [`watchStaticFile()`](/docs/studio/watch-static-file)
