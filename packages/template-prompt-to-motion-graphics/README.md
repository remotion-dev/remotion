# template-code-generation

AI-powered code generation template for Remotion.

## Adding examples and capabilities

When adding new capabilities to the assistant, we have to first create some examples to let the system know what we can do. So first we add the example to the template, tweak it a bit more to get it right with our taste and then add it as an example potentially to the system prompt of the assistant.

## Model Selection

GPT5.1 Low reasoning seems to be a good middle ground between generation speed and output quality.

## Usage

```bash
npx create-video@latest --template code-generation
```

## Development

```bash
bun install
bun dev
```

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
