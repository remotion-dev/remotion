# Make a first video with Remotion

Use your terminal and file editor to set up the project, open a preview and render the user's first video.

## Set up the project and skills

Check that Node.js, npm and Git are available. Help the user install any missing tools, then inspect the working directory, including hidden files.

- If it already contains a Remotion project, use it and preserve its compositions.
- If the directory is empty and its name is a valid npm package name, use `.` as the destination.
- Otherwise, choose an unused subdirectory such as `my-video`.

For a new project, this command scaffolds the blank template and installs the Remotion skills in the project.

```sh
npx --yes create-video@latest --yes --blank --skills my-video
```

Run the remaining steps from the project root. If dependency installation failed or the existing project has no installed dependencies, install them using the project's package manager.

Check for the `remotion-create`, `remotion-studio` and `remotion-render` skills in the project. If any are missing, run `npx remotion skills add` from the project root and verify the installation. If your agent hasn't picked up the new skills yet, read their `SKILL.md` files directly. New projects store them under `.agents/skills/`.

## Make the first video

1. Follow `remotion-studio` to open Remotion Studio. Share the URL it prints and keep Studio running so the user can see your edits.
2. Use the idea the user supplied. If they haven't given one, ask “What would you like your first video to be about?” and offer a 10-second animated title card as a starting point.
3. Follow `remotion-create` to build the composition for that idea in the project you just set up. Preview the animation in Studio.
4. Follow `remotion-render` to export an MP4. Pass the actual composition ID and an unused output path, for example `npx remotion render MyComp out/first-video.mp4`.

Verify that the render succeeded and the MP4 exists. Give the user the rendered file, the project directory and the Studio link where they can keep editing.
