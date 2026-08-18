---
name: offload-r2
description: Upload Remotion repository media assets to the Cloudflare R2 bucket behind remotion.media, switch source code to hosted URLs, and retain ignored local working copies. Use when binaries should remain available locally for editing or previewing but must not be committed to Git.
---

# Offload R2 Asset

Host media on `https://remotion.media/` while preserving the original file in the worktree as an ignored local copy.


## Workflow

1. Find the main worktree with `git worktree list --porcelain`. Prefer the worktree on `refs/heads/main`, normally `/Users/jonathanburger/remotion`.

2. Choose a stable, descriptive object key. Use a feature-specific directory prefix when it prevents collisions, for example `studio-close-ups/demo.mp4`.

3. Load credentials from the main worktree without printing them:

   ```bash
   --env-file=/Users/jonathanburger/remotion/packages/remotion-media/.env
   ```

   The required variables are `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

4. Upload to the `parser-media` bucket with Bun's S3-compatible client. Preserve an existing object when its size matches the local file:

   ```bash
   bun --env-file=/Users/jonathanburger/remotion/packages/remotion-media/.env -e "import {S3Client} from 'bun'; const filePath='<local-file>'; const key='<object-key>'; const client=new S3Client({accessKeyId:Bun.env.AWS_ACCESS_KEY_ID,secretAccessKey:Bun.env.AWS_SECRET_ACCESS_KEY,endpoint:'https://2fe488b3b0f4deee223aef7464784c46.r2.cloudflarestorage.com',bucket:'parser-media'}); const file=Bun.file(filePath); if (await client.exists(key)) { const stat=await client.stat(key); if (stat.size===file.size) { console.log('exists-same-size',key,file.size); process.exit(0); } } await client.write(key,file); const stat=await client.stat(key); if (stat.size!==file.size) throw new Error('Size mismatch'); console.log('uploaded',key,stat.size);"
   ```

5. Verify the public object:

   ```bash
   curl -I --fail https://remotion.media/<object-key>
   ```

6. Replace source usage with the public URL. Do not wrap remote URLs in `staticFile()` because it rejects `http://` and `https://` URLs.

7. Keep the local binary in place and add its exact repository-relative path to the nearest applicable `.gitignore`, following existing entries such as those in `packages/brand/.gitignore`. Do not delete the local file. If it was already tracked, remove it only from the Git index with `git rm --cached -- <local-file>`.

8. Verify both sides of the offload:

   ```bash
   test -f <local-file>
   git check-ignore -v <local-file>
   ```

9. Run focused lint or style checks for touched packages. Commit or push only when requested.
