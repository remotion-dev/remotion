## Contributing

Issues and pull requests of all sorts are welcome!

For bigger projects, please coordinate with [Jonny Burger](https://jonny.io) to make sure your changes get merged.

Please note that since I charge for Remotion when companies are using it, this is a **commercial project** by me (Jonny Burger). By sending pull requests, you agree that I can use your code changes in a commercial context.

Furthermore, also note that you **cannot redistribute** this project. Please see [LICENSE.md](LICENSE.md) for what's allowed and what's not.

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

### Code setup

Clone the repo and run

```console

npm i

npx lerna bootstrap

npm run build

npx lerna bootstrap

```

to set up the project. Make sure to run `npx lerna bootstrap` twice - the reason is that during the build phase new CLI binaries are being created so another symlink is necessary. You only have to do this once.

We recommend keeping a terminal open with the command

```console

npm run watch

```

running to keep the monorepos building and synchronized.

As a testbed, you can use the `example` folder. Run `npm start` to trigger the preview and `npm run render` to trigger the render process.

### Mutation Testing

In case you want to check the quality of your test code while contributing, you can use mutation testing with the help of the [Stryker Mutator](https://stryker-mutator.io/).

#### Stryker Setup

To setup mutation testing in the core package, cd to the `packages/core`directory and then run `npm i @stryker-mutator/core @stryker-mutator/jest-runner`. Further, add a `stryker.conf.json` file in the same directory.

**Example stryker.conf.json:**

    {
        "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
        "packageManager": "npm",
        "reporters": [ "html", "clear-text", "progress" ],
         "testRunner": "jest",
         "mutate": [
         // specify files to mutate!
    	     "src/interpolate.ts",
    	     "src/volume-prop.ts",
    	     "src/config/codec.ts",
    	     "src/config/image-format.ts"
    	     ],
        "coverageAnalysis": "off"
    }

Under `"mutate"` you can specify the files you want stryker to mutate for you.
Then to run the mutation tests use `npx stryker run`.
In case you run into error on _Windows_ where Stryker and Jest won't run any test cases, try one of these [workarounds](https://github.com/stryker-mutator/stryker-js/issues/2122#issuecomment-605783668).
After running Stryker you can find the report under `packages/core/reports/mutation` and see how many mutants have been killed by your test cases and how many have survived.

Once you have checked your test code quality with the help of mutation testing, make sure to omit any Stryker related changes from your code before contributing.
