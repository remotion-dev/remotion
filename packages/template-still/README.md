# Remotion Still Image template

A template for designing still images with dynamic data with built-in server for deploying to the cloud.

<p align="center">
    <img src="https://remotion-still.herokuapp.com/PreviewCard.jpeg?title=Still%20image%20generator&description=Dynamic%20images%20generation%20service%20with%20full%20design%20freedom&slogan=Powered%20by%0ARemotion&c=1">
</p>

## Commands

**Design mode: Create an image in React**

```console
npm run dev
```

**Render it**

```console
npx remotion render
```

**Keep Remotion up to date**

```console
npx remotion upgrade
```

## Server

You can run a server that serves dynamic images based on it's URL. Run

```console
npm run server
```

And then visit `http://localhost:8000/PreviewCard.png?title=Hello+World` in your browser to render an image.

- Specify the ID of the composition you want to render after the `/`. You can edit the compositions in `src/Video.tsx`.
- Add either a `.png` or a `.jpeg` extension depending on which image format you want.
- You can add input props to your React component by adding query strings: `?title=Hello+World&description=foobar` will pass `{"title": "Hello World", "description": "foo bar"}` to the component.

### Caching

In `src/server/config.ts`, you can configure three types of caching:

- `"filesystem"`, the default, will cache generated images locally. This is a good way of caching if you host the server on a non-ephemereal platform and have enough storage.
- `"none"` will disable all caching and calculate all images on the fly.

- `"s3-bucket"` will cache images in a S3 bucket. If you choose this option, you need to provide `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables containing AWS credentials which have permission of reading and writing to S3 as well as configure a bucket name and region in `src/server/config.ts`.

<details>
<summary>How to set up an S3 bucket</summary>
<ul>
<li>Go to https://s3.console.aws.amazon.com/s3/home and create a new bucket. You can leave the "Deny all public access" checkbox checked.
</li>
<li>
Fill out region and bucket name in <code>src/server/config.ts</code>.
</li>
<li>
Go to https://console.aws.amazon.com/iamv2/home?#/users to create a new user. While creating, enable "Programmatic Access". When adding permissions, choose "Attach existing policies directly" and then search for "AmazonS3FullAccess" and assign it.
</li>
<li>
In the last step you will get a value for <code>AWS_ACCESS_KEY_ID</code> and <code>AWS_SECRET_ACCESS_KEY</code> which you need to set as an environment variable. Locally, you can rename the <code>.env.example</code> file to <code>.env</code>. When you deploy the server, you can set the environment variables in the dashboard of your provider.
</li>
</ul>
</details>

### Deploy to Heroku

To deploy the server to Heroku, you need to add the Google Chrome Buildpack. Go to the settings of your Heroku app and in the `Buildpacks` section, add `https://github.com/heroku/heroku-buildpack-google-chrome` as a buildpack.

### Deploy to DigitalOcean

The easiest way to deploy to DigitalOcean is to use the dockerized image and run it on the DigitalOcean App Platform. Go to https://cloud.digitalocean.com/apps/new and connect your Github repository and deploy the

### Serverless

Use [Remotion Lambda](https://remotion.dev/lambda) if you want to render stills inside a Lambda function.

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
