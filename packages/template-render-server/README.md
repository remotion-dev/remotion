# Remotion Render Server Template

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.gif">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

This template provides an Express.js server that allows you to start new video render jobs, track the progress of ongoing renders, and cancel running render jobs.

The server exposes the following main endpoints:

- `POST /render` - Start a new render job
- `GET /renders/:id` - Get the status of a render
- `DELETE /renders/:id` - Cancel a running render

## Getting Started

**Install Dependencies**

```console
npm install
```

**Start the Render Server**

```console
npm run dev
```

This will start the Express server that handles render requests in watch mode for development.

**Run in Production**

```console
npm start
```

**Run Remotion Studio**

```console
npm run remotion:studio
```

**Render the example video locally**

```
npx remotion render
```

**Upgrade all Remotion packages:**

```
npx remotion upgrade
```

## Docker Support

The template includes Docker support out of the box. Build and run the container using:

```console
docker build -t remotion-render-server .
docker run -d -p 3000:3000 remotion-render-server
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
