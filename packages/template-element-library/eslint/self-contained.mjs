import { importVisitors, staticString } from "./ast.mjs";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Keep copied Element source independent of project files.",
      url: "https://www.remotion.dev/docs/studio-protocol/component-library-integration#reuse-component-code",
    },
    schema: [],
    messages: {
      import:
        "Elements are installed as one source file. Inline local code and pass assets through props instead of importing project files or aliases. Package imports must also be declared in the Element's dependencies.",
    },
  },
  create(context) {
    return importVisitors(context.sourceCode, (node) => {
      const value = staticString(node, context.sourceCode);
      // Accept package specifiers, including scoped packages and subpaths.
      // Relative/absolute paths, @/, ~/, # aliases and URL schemes are not portable.
      if (value === null || !/^(?:@[\w.-]+\/)?[\w-]+(?:[./][\w.-]+)*(?:\/[^\s]*)?$/.test(value)) {
        context.report({ node, messageId: "import" });
      }
    });
  },
};
