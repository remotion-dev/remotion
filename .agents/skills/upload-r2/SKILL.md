---
name: upload-r2
description: Upload large Remotion repository assets to the Cloudflare R2 bucket behind remotion.media and replace local public/ assets with hosted URLs. Use when a file is too large for Git or when a PR should avoid committing media binaries by hosting them on remotion.media.
---

# Upload R2 Asset

Use this for large media assets that should be hosted on `https://remotion.media/` instead of committed to Git.

## Workflow

1. Find the main worktree:
   ```bash
   git worktree list --porcelain
   ```
   Prefer the worktree on `refs/heads/main`, usually `/Users/jonathanburger/remotion`.

2. Load R2 credentials from the main worktree:
   ```bash
   --env-file=/Users/jonathanburger/remotion/packages/remotion-media/.env
   ```
   Do not print secret values. The required variables are `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

3. Upload the file to the `parser-media` bucket using Bun's S3-compatible client:
   ```bash
   bun --env-file=/Users/jonathanburger/remotion/packages/remotion-media/.env -e "import {S3Client} from 'bun'; const filePath='<local-file>'; const key='<remote-file-name>'; const client=new S3Client({accessKeyId:Bun.env.AWS_ACCESS_KEY_ID, secretAccessKey:Bun.env.AWS_SECRET_ACCESS_KEY, endpoint:'https://2fe488b3b0f4deee223aef7464784c46.r2.cloudflarestorage.com', bucket:'parser-media'}); const file=Bun.file(filePath); if (await client.exists(key)) { const stat=await client.stat(key); if (stat.size===file.size) { console.log('exists-same-size', key, file.size); process.exit(0); } } await client.write(key, file); const stat=await client.stat(key); console.log('uploaded', key, stat.size);"
   ```

4. Verify the public URL:
   ```bash
   curl -I --fail https://remotion.media/<remote-file-name>
   ```

5. Replace local asset usage with the hosted URL and delete the local binary.

   Do not wrap remote URLs in `staticFile()`: `staticFile()` rejects `http://` and `https://` URLs. Use the URL string directly, for example:
   ```tsx
   <Video src="https://remotion.media/example.mp4" />
   ```

6. Run the focused lint or stylecheck for touched packages, then commit and push.
