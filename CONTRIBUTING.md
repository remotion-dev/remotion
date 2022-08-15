Want to watch a tutorial video instead? [Click here](https://www.youtube.com/watch?v=tgBfJw2tET8)

---

## Contributing

Issues and pull requests of all sorts are welcome!

For bigger projects, please coordinate with [Jonny Burger](https://jonny.io) to make sure your changes get merged.

Please note that since I charge for Remotion when companies are using it, this is a **commercial project** by me (Jonny Burger). By sending pull requests, you agree that I can use your code changes in a commercial context.

Furthermore, also note that you **cannot redistribute** this project. Please see [LICENSE.md](LICENSE.md) for what's allowed and what's not.

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

### Code setup

1. Remotion uses [`pnpm`](https://pnpm.io/) as the package manager for development in this repository. Please install the latest version of pnpm globally:

```console
[sudo] npm i -g pnpm
```

2. Clone the Remotion repository

```console
git clone https://github.com/remotion-dev/remotion.git && cd remotion
```

3. Install all dependencies:

```console
pnpm i
```

4. Build the project initially:

```console
pnpm build
```

5. Rebuild whenever a file changes:

```console
pnpm watch
```

6. You can start making changes!

### Testing your changes

You can start the Testbed using

```console
cd packages/example
npm start
```

You can render a test video using

```console
cd packages/example
pnpm render
```

You can run tests using

```console
pnpm test
```

in either a subpackage to run tests for that package or in the root to run all tests.

You can test changes to [@remotion/player](https://remotion.dev/docs/player) using:

```console
cd packages/player-example
pnpm start
```

For information about testing, please consult [TESTING.md](./TESTING.md).
