# Remotion + React Router 7 Starter Kit

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.gif">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

This is a [React Router 7 starter kit](https://reactrouter.com/home) with [Remotion](https://remotion.dev), [`@remotion/player`](https://remotion.dev/player) and [`@remotion/lambda`](https://remotion.dev/lambda) built in.  
It lets you render a video from a React Router app with AWS Lambda.

## Getting started

Install dependencies using

<!-- create-video will replace this with the package manager specific command -->

```
npm install
```

## Run the React Router app

Run the example app using:

```
npm run dev
```

## Edit the video

Start the Remotion Preview (the editor interface) using:

```
npm run remotion:studio
```

## Render videos with AWS Lambda

Follow these steps to set up video rendering:

1. Follow the steps in [Remotion Lambda setup guide](https://www.remotion.dev/docs/lambda/setup).
2. Rename the `.env.example` file to `.env`.
3. Fill in the `REMOTION_AWS_ACCESS_KEY_ID` and `REMOTION_AWS_SECRET_ACCESS_KEY` values that you got from the first step.

4. Run the following to deploy your Lambda function and Remotion site:

```
node deploy.mjs
```

> Rerun this command whenever you have upgraded to a new Remotion version.

5. Restart the server.

## Commands

Start the app in development mode:

```
npm run dev
```

Build the app for production:

```
npm run build
```

Start the app in production mode (after build is done):

```
npm run dev
```

Start the Remotion Studio:

```
npm run remotion:studio
```

Render the example video locally:

```
npx remotion render
```

Upgrade all Remotion packages:

```
npx remotion upgrade
```

Render the example video on AWS Lambda:

```
npm run remotion:renderlambda
```

Deploy/Update the Remotion video on S3 and the Lambda function:

```
node deploy.mjs
```

## Upgrading Remotion

When upgrading Remotion to a newer version, you will need to redeploy your function and update your site using the commands above.  
If your functions or sites are already used in production, make sure to not overwrite them - [read here](https://www.remotion.dev/docs/lambda/upgrading) for more details about upgrading.

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).  
See the [React Router Docs](https://reactrouter.com/) to read about the framework.

## Help

Join the [Remotion Discord server](https://remotion.dev/discord) to chat with other Remotion builders.

## Issues

Found an issue with Remotion? [File an issue here](https://remotion.dev/issue).

## License

Note that for some entities a Remotion company license is needed. Read [the terms here](https://remotion.dev/license).
