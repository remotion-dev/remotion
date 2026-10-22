---
name: offload-r2
description: Upload Remotion repository media assets to the Cloudflare R2 bucket behind remotion.media, switch source code to hosted URLs, verify the public objects, and remove repository-local copies.
---

# Offload R2 Asset

Host media on `https://remotion.media/`, update every in-scope source reference to the public object, and remove the repository-local copy after verification.


## Workflow

1. Find the main worktree with `git worktree list --porcelain`. Prefer the worktree on `refs/heads/main`, normally `/Users/jonathanburger/remotion`.

2. Choose a stable, descriptive object key. Use a feature-specific directory prefix when it prevents collisions, for example `studio-close-ups/demo.mp4`. When replacing an asset, prefer a new versioned key so browser and Studio caches cannot serve the previous bytes.

3. Load credentials from the main worktree without printing them:

   ```bash
   --env-file=/Users/jonathanburger/remotion/packages/remotion-media/.env
   ```

   The required variables are `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

4. Upload to the `parser-media` bucket with Bun's S3-compatible client:

   ```bash
   bun --env-file=/Users/jonathanburger/remotion/packages/remotion-media/.env -e "import {S3Client} from 'bun'; const filePath='<local-file>'; const key='<object-key>'; const client=new S3Client({accessKeyId:Bun.env.AWS_ACCESS_KEY_ID,secretAccessKey:Bun.env.AWS_SECRET_ACCESS_KEY,endpoint:'https://2fe488b3b0f4deee223aef7464784c46.r2.cloudflarestorage.com',bucket:'parser-media'}); const bytes=new Uint8Array(await Bun.file(filePath).arrayBuffer()); await client.write(key,bytes); const remote=await client.file(key).arrayBuffer(); if (remote.byteLength!==bytes.byteLength) throw new Error('Size mismatch'); console.log('uploaded',key,remote.byteLength);"
   ```

5. Verify the public object and compare its SHA-256 hash with the local file before removing anything:

   ```bash
   curl -I --fail https://remotion.media/<object-key>
   test "$(shasum -a 256 <local-file> | cut -d' ' -f1)" = "$(curl --fail --silent https://remotion.media/<object-key> | shasum -a 256 | cut -d' ' -f1)"
   ```

6. Replace every in-scope source usage with the public URL. Do not wrap remote URLs in `staticFile()` because it rejects `http://` and `https://` URLs.

7. After the public hash matches and source references are remote, remove the local copy. Use `git rm -- <local-file>` for a tracked file or remove the exact untracked/ignored file directly. Remove obsolete asset-specific `.gitignore` entries and empty asset directories. Do not use recursive deletion or broad globs.

8. Verify the local copy is gone and search the affected package for remaining local references:

   ```bash
   test ! -e <local-file>
   rg -n '<local-filename>|staticFile\(' <affected-package>
   ```

9. Run focused lint or style checks for touched packages. Commit or push only when requested.
