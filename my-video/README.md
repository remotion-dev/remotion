# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Working with Claude

This project is set up for all three Claude surfaces:

**Claude Code** (CLI, web, IDE) — open the repository or this folder; [CLAUDE.md](CLAUDE.md)/[AGENTS.md](AGENTS.md) and the Remotion skills in `.claude/skills/` load automatically. Claude can edit, preview (`npm run dev`) and render (`npx remotion render`).

**Claude Cowork** (desktop app) — open this `my-video` folder as the working folder. Cowork reads the same `CLAUDE.md` and `.claude/skills/`, and can run the preview and render commands.

**Claude Chat** (claude.ai) — chat has no filesystem, so upload the bundled skill instead: build `remotion-video-skill.zip` (below), then upload it under claude.ai **Settings → Capabilities → Skills**. Chat will then write complete, ready-to-save composition files for this project; preview and render them in Claude Code, Cowork, or a terminal. The uploaded skill also becomes available account-wide, including in Cowork sessions without this folder.

Build the uploadable skill bundle from this folder (claude.ai accepts at most 200 files per skill zip; this bundle is ~106):

```console
# macOS/Linux
mkdir -p /tmp/remotion-video && cp chat-skill/SKILL.md /tmp/remotion-video/ && cp -R .claude/skills/. /tmp/remotion-video/ && (cd /tmp && zip -rqD remotion-video-skill.zip remotion-video) && mv /tmp/remotion-video-skill.zip .

# Windows (PowerShell)
New-Item -ItemType Directory -Force remotion-video | Out-Null; Copy-Item chat-skill/SKILL.md remotion-video/; Copy-Item -Recurse .claude/skills/* remotion-video/; Compress-Archive -Force remotion-video remotion-video-skill.zip; Remove-Item -Recurse remotion-video
```

The skills in `.claude/skills/` are vendored by `node scripts/vendor-skills.mjs`, which flattens the symlinks the upstream skills use (they break on Windows checkouts and make `zip` duplicate every folder). Re-run it after `npx remotion upgrade`, then rebuild the bundle.

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
