import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(() => {
  return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = "NoMP4Import";

const NoMP4Import =
  "Importing MP4 will work while you are previewing the video, but will not work while rendering since Puppeteer does not include the codecs necessary for MP4 videos. Convert the video to WebM first.";

const rule = createRule<Options, MessageIds>({
  name: "no-mp4-import",
  meta: {
    type: "problem",
    docs: {
      description: NoMP4Import,
      recommended: "warn",
    },
    fixable: undefined,
    schema: [],
    messages: {
      NoMP4Import,
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      ImportDeclaration: (node) => {
        if (node.source.raw.includes(".mp4")) {
          context.report({
            messageId: "NoMP4Import",
            node,
          });
        }
      },
      CallExpression: (node) => {
        // @ts-expect-error
        if (node.callee.name !== "require") {
          return;
        }
        // @ts-expect-error
        const firstArgument = node.callee?.parent?.arguments?.[0]?.raw as
          | string
          | undefined;
        if (!firstArgument) {
          const sourceCode = context.getSourceCode().getText(node);
          if (sourceCode.includes(".mp4")) {
            context.report({
              messageId: "NoMP4Import",
              node,
            });
          }
          return;
        }
        if (firstArgument.includes(".mp4")) {
          context.report({
            messageId: "NoMP4Import",
            node,
          });
        }
      },
    };
  },
});

export default rule;
