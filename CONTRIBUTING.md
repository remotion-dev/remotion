Want to watch a tutorial video instead? [Click here](https://www.youtube.com/watch?v=edWIkrjFgoQ)

---

## Contributing

Issues and pull requests of all sorts are welcome!

For bigger projects, please coordinate with [Jonny Burger](https://jonny.io) to make sure your changes get merged.

Please note that since I charge for Remotion when companies are using it, this is a **commercial project** by me (Jonny Burger). By sending pull requests, you agree that I can use your code changes in a commercial context.

Furthermore, also note that you **cannot redistribute** this project. Please see [LICENSE.md](LICENSE.md) for what's allowed and what's not.

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

### Code setup

Remotion uses [`pnpm`](https://pnpm.io/) as the package manager for development in this repository.

If you are using pnpm for the first time the [pnpm configuration documentation](https://pnpm.io/configuring) may be useful to avoid any potential problems with the following steps.

To begin your development setup, please install the latest version of pnpm globally:

```
npm i -g pnpm
```

With pnpm installed, the first step is installing all dependencies:

```
pnpm install
```

### Building the project

To build the project run

```
pnpm build
```

### Watch mode

To enable watch mode run

```
pnpm watch
```

### Running test

```
pnpm test
```

As a testbed, you can use the `example` folder. Run `pnpm start` to trigger the preview and `pnpm render` to trigger the render process.

### Testing

For information about testing, please consult [TESTING.md](./TESTING.md).
