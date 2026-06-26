# @remotion/browser-studio

Experimental browser-only Remotion Studio prototype.

This package is currently intended for the `/experimental_new` prototype on remotion.dev.
It compiles a virtual Remotion project with `@rspack/browser` and boots the
Studio in read-only mode inside an iframe.

## Local development

Run the package-local prototype without the docs app:

```bash
cd packages/browser-studio
bun run dev
```

Then open <http://localhost:62338>.
