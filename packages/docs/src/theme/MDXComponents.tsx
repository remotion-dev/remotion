import InitialComponents from "@theme-init/MDXComponents";

const newExport = {};
// Remove `pre` and `code` from the MDX parser because Shiki Twoslash will handle them
Object.entries(InitialComponents).forEach(([key]) => {
  if (key !== "pre" && key !== "code") newExport[key] = InitialComponents[key];
});

export default newExport;
