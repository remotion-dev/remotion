<img src="https://github.com/remotion-dev/template-next/assets/1629785/9092db5f-7c0c-4d38-97c4-5f5a61f5cc098" />
<br/>
<br/>

This is a Next.js template for building programmatic video apps with [`@remotion/player`](https://remotion.dev/player) and rendering via [Vercel Sandbox](https://vercel.com/docs/functions/sandbox).

This template uses the Next.js App directory with TailwindCSS. Videos are rendered in a Vercel Sandbox environment and stored in [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) storage.

<img src="https://github.com/remotion-dev/template-next/assets/1629785/c9c2e5ca-2637-4ec8-8e40-a8feb5740d88" />

## Getting Started

[Use this template](https://github.com/new?template_name=template-vercel&template_owner=remotion-dev) to clone it into your GitHub account. Run

```
npm i
```

afterwards. Alternatively, use this command to scaffold a project:

```
npx create-video@latest --vercel
```

## Commands

Start the Next.js dev server:

```
npm run dev
```

Open the Remotion Studio:

```
npx remotion studio
```

Render a video locally:

```
npx remotion render
```

Upgrade Remotion:

```
npx remotion upgrade
```

## Deploy to Vercel

### 1. Deploy your Remotion bundle

First, build and deploy your Remotion bundle:

```bash
npx remotion bundle
cd build
vercel deploy --prod
```

Copy the deployment URL (e.g., `https://my-bundle.vercel.app`).

**Note:** The bundle must be publicly accessible (no Vercel Authentication) since the sandbox fetches it without credentials.

### 2. Create a Vercel Blob store

1. Go to your Vercel dashboard
2. Navigate to Storage > Create > Blob
3. Create a new Blob store and attach it to your project

If you deploy your app to the same Vercel project where your Blob store is attached, the `BLOB_READ_WRITE_TOKEN` environment variable is automatically available.

### 3. Set environment variables

In your Vercel project settings, add:

| Variable             | Description                          |
| -------------------- | ------------------------------------ |
| `REMOTION_SERVE_URL` | URL of your deployed Remotion bundle |

When deployed to Vercel, the `BLOB_READ_WRITE_TOKEN` is automatically available if your Blob store is attached to the same project. For local development, see below.

### 4. Deploy

Connect your GitHub repository to Vercel and it will automatically deploy your app.

## Local Development

To run renders locally, pull environment variables from Vercel:

```bash
vercel link  # Link to your Vercel project (if not already linked)
vercel env pull .env.local
```

This pulls `BLOB_READ_WRITE_TOKEN` from your attached Blob store. You'll also need to add `REMOTION_SERVE_URL` to `.env.local` manually:

```
REMOTION_SERVE_URL=https://your-bundle.vercel.app
```

Then start the dev server:

```bash
npm run dev
```

## How It Works

1. User clicks "Render" in the browser
2. API spawns a Vercel Sandbox (ephemeral Linux VM)
3. Sandbox runs `renderMedia()` from `@remotion/renderer`
4. Progress is streamed to the browser via Server-Sent Events
5. Completed video is uploaded to Vercel Blob
6. User receives the video URL

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://remotion.dev/discord).

## Issues

Found an issue with Remotion? [File an issue here](https://remotion.dev/issue).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
