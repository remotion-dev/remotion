<img src="https://github.com/remotion-dev/template-next/assets/1629785/9092db5f-7c0c-4d38-97c4-5f5a61f5cc098" />
<br/>
<br/>

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=Render%20your%20Remotion%20videos%20on%20Vercel.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4pq2kfE4t05fMkDCKGsfqz%2F1444f1b559d50391052fdf5102502ac9%2FFlagsmith_Dark.png&demo-title=Remotion%20on%20Vercel&demo-url=https%3A%2F%2Ftemplate-vercel.remotion.dev%2F&from=templates&products=%255B%257B%2522type%2522%253A%2522blob%2522%257D%255D&project-name=Remotion%20on%20Vercel&project-names=Comma%20separated%20list%20of%20project%20names%2Cto%20match%20the%20root-directories&repository-name=remotion-on-vercel&repository-url=https%3A%2F%2Fgithub.com%2Fremotion-dev%2Ftemplate-vercel&root-directories=List%20of%20directory%20paths%20for%20the%20directories%20to%20clone%20into%20projects)

This is a Next.js template for building programmatic video apps with [`@remotion/player`](https://remotion.dev/player) and rendering via [Vercel Sandbox](https://vercel.com/docs/functions/sandbox).

This template uses the Next.js App directory with TailwindCSS. Videos are rendered in a Vercel Sandbox environment and stored in [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) storage.

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

The only requirement is to set up a Vercel Blob store and attach it to your project.  
It is advisable to first deploy the template to Vercel so you have a project to attach the Blob store to.

1. Go to your Vercel dashboard
2. Navigate to Storage > Create > Blob
3. Create a new Blob store and attach it to your project

If you deploy your app to the same Vercel project where your Blob store is attached, the `BLOB_READ_WRITE_TOKEN` environment variable is automatically available.

## Local Development

To get access to sandboxes, just make sure you are logged in with the [Vercel CLI](https://vercel.com/docs/cli):

```bash
vercel login
```

To run renders locally, pull the `BLOB_READ_WRITE_TOKEN` environment variable from your attached Blob store:

```bash
vercel link  # Link to your Vercel project (if not already linked)
vercel env pull .env.local
```

This pulls `BLOB_READ_WRITE_TOKEN` from your attached Blob store.

Then start the dev server:

```bash
npm run dev
```

## Docs

Read more about this template [here](https://remotion.dev/docs/vercel-sandbox).

## Help

We provide help on our [Discord server](https://remotion.dev/discord).

## Issues

Found an issue with Remotion? [File an issue here](https://remotion.dev/issue).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
