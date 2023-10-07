---
image: /generated/articles-docs-contributing-feature.png
title: Implementing a new feature
crumb: Contributing
---

We are happy to accept contributions to the Remotion project that implement new features.

## Setup

See the [CONTRIBUTING.md](https://github.com/remotion-dev/remotion/blob/main/CONTRIBUTING.md) file for instructions on how to set up the project.

## What's important to us

- **Planning**: Signal beforehand that you would like to propose the feature by opening an issue and mentioning that you would like to work on it.  
  This gives us the chance to comment on whether we like the feature and lets us discuss the architecture.
- **Generic:** The feature should be as unopinionated as possible. Instead of making decisions that are specific to your usecase, try to make the feature as generic as possible so that it can be used by everyone.
- **Size**: The feature should not bloat lightweight packages by adding dependencies that can be avoided. Consider if the feature should be a new package in a monorepo if there are a lot of dependencies that are not needed by everyone.
- **Documentation:** The feature should be documented and the documentation should have the same level of quality as the rest docs.

## Technical standards

- **TypeScript or Rust**: The code should be written in one of these two languages.
- **Tests**: Add tests if you think it makes sense.
- **Forward-compatibility**: Be mindful of how the feature might evolve in the future. Using objects in the input and output of an API makes it easier to add new properties in the future.
- **Backwards-compatibility**: Your feature cannot break existing code if Remotion is upgraded, unless the feature lands in a major version.
- **Naming conventions**: Use `camelCase` for variables. If the API interfaces with numeric values, the unit should be included. For example `durationInFrames` instead of `duration` or `timeoutInMilliseconds` instead of `timeout`.

## Icons

Remotion uses [Font Awesome](https://fontawesome.com/) v5.15.4 for the icons in the Remotion Studio.

We have a license and can grant access to Pro icons if needed.

## Communicate with us

Use the `#development` channel on [Discord](https://remotion.dev/discord) to quickly ask questions and get feedback.

## See also

- [Implementing a new option](/docs/contributing/option)
- [Writing documentation](/docs/contributing/docs)
- [How to take a bounty issue](/docs/contributing/bounty)
