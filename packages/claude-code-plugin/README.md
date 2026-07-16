# Remotion plugin for Claude Code

Create programmatic videos with Remotion and React using Claude Code. The plugin
includes Remotion's Agent Skills for animations, audio, captions, rendering,
media processing, and more.

## Installation

Add the Remotion marketplace and install the plugin:

```bash
claude plugin marketplace add remotion-dev/claude-code-plugin
claude plugin install remotion@remotion
```

Restart Claude Code after installing the plugin.

## Usage

Ask Claude Code to create or edit a Remotion video. Claude automatically loads
the relevant skills, or you can invoke the main skill directly:

```text
/remotion:remotion-best-practices
```
