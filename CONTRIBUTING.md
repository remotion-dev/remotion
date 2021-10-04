Want to watch a tutorial video instead? [Click here](https://www.youtube.com/watch?v=edWIkrjFgoQ)

---

## Contributing

Issues and pull requests of all sorts are welcome!

For bigger projects, please coordinate with [Jonny Burger](https://jonny.io) to make sure your changes get merged.

Please note that since I charge for Remotion when companies are using it, this is a **commercial project** by me (Jonny Burger). By sending pull requests, you agree that I can use your code changes in a commercial context.

Furthermore, also note that you **cannot redistribute** this project. Please see [LICENSE.md](LICENSE.md) for what's allowed and what's not.

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

### Code setup

Clone the repo and run

Since we use NPM and Lerna, we suggest to check which version of Node and NPM you're using, we're compatible with both but steps changes.

#### Node 16

```console
npm i

npm run build

npm run test
```

#### Node 12, 14

```console
npm i

npm run bootstrap

npm run build

npm run test
```

We recommend keeping a terminal open with the command

```console

npm run watch

```

running to keep the monorepos building and synchronized.

As a testbed, you can use the `example` folder. Run `npm start` to trigger the preview and `npm run render` to trigger the render process.

### Testing

For information about testing, please consult [TESTING.md](./TESTING.md).
