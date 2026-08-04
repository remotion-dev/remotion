---
name: remotion-studio
description: Start a Remotion project in Remotion Studio, apply Studio CLI flags, and open the exact local URL. Use when the user invokes /remotion-studio or $remotion-studio, asks to launch or open Remotion Studio, or wants to configure the Studio startup command.
version: 4.0.505
---

# Open Remotion Studio

## Workflow

1. Find the Remotion project root and its package manager. Install dependencies with the project's package manager if they are missing.
2. Start the local Remotion CLI in a persistent terminal session. Append an entry point and any flags requested by the user, then append `--no-open` so the URL can be opened explicitly:

   ```bash
   npx remotion studio <entry-point>? <flags> --no-open
   ```

   Use the project's package runner instead of `npx` when appropriate: `pnpm exec remotion`, `yarn remotion`, or `bunx remotion`.

3. Do not probe an assumed port before starting Studio. Read the local URL from this CLI invocation; it may select a free port or report an existing Studio for this project.
4. Keep the Studio process running. Open the exact printed URL with the environment's browser tool. If browser control is unavailable, send `s` to the Studio terminal to open it in the default browser.
5. Only verify the URL after the CLI has identified it. Report the URL and whether Studio was newly started or was already running.

`remotion preview` is an alias for `remotion studio`. While Studio is running, pressing `s` in its terminal reopens it in the browser.

## CLI flags

Pass the user's requested flags through to `remotion studio`. Use `--flag=value` for valued flags when shell parsing could be ambiguous.

| Argument                                | Purpose                                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `<entry-point>`                         | Optional Remotion entry point. The CLI discovers it when omitted.                                                        |
| `--props=<json-or-file>`                | Pass input props as serialized JSON or a JSON file path. Prefer a file on Windows.                                       |
| `--config=<file>`                       | Use a specific Remotion config file.                                                                                     |
| `--env-file=<file>`                     | Use a specific dotenv file instead of `.env`.                                                                            |
| `--log=<level>`                         | Set `error`, `warn`, `info` (default), or `verbose` logging.                                                             |
| `--port=<number>`                       | Request a Studio server port; otherwise Remotion finds a free port.                                                      |
| `--public-dir=<dir>`                    | Override the project's `public` directory.                                                                               |
| `--disable-keyboard-shortcuts`          | Disable Studio keyboard shortcuts.                                                                                       |
| `--disable-interactivity`               | Disable visual editing while preserving preview and source navigation.                                                   |
| `--editor=<id>`                         | Choose the editor used to open source: `vscode`, `cursor`, `windsurf`, `zed`, `vscodium`, `webstorm`, or `sublime-text`. |
| `--coding-agent=<id>`                   | Choose the Studio coding agent: `codex`, `cursor`, `github-copilot`, or `claude-code`.                                   |
| `--rspack`                              | Use Rspack instead of Webpack.                                                                                           |
| `--webpack-poll=<ms>`                   | Poll for file changes; useful in VMs and on remote filesystems.                                                          |
| `--no-open`                             | Prevent CLI browser auto-opening. Use this when opening the printed URL explicitly.                                      |
| `--browser=<name-or-path>`              | Choose the auto-open browser, such as `chrome` or an absolute executable path.                                           |
| `--browser-args=<args>`                 | Pass command-line arguments to the auto-open browser.                                                                    |
| `--beep-on-finish`                      | Beep when a Studio render finishes.                                                                                      |
| `--ipv4`                                | Bind the Studio server to IPv4.                                                                                          |
| `--number-of-shared-audio-tags=<count>` | Set the number of shared audio tags used for preview playback.                                                           |
| `--preview-sample-rate=<hz>`            | Set preview audio sample rate; the default is 48000 Hz.                                                                  |
| `--cross-site-isolation`                | Set cross-origin isolation headers, as required by features such as `@remotion/whisper-web`.                             |
| `--disable-ask-ai`                      | Disable the Studio Ask AI modal.                                                                                         |
| `--force-new`                           | Start another Studio instance even when one is already running for the same project and port.                            |
| `--public-license-key=<key>`            | Set the public company license key or `free-license`.                                                                    |

For browser auto-opening, `BROWSER` behaves like `--browser`, `BROWSER_ARGS` behaves like `--browser-args`, and `BROWSER=none` behaves like `--no-open`.
