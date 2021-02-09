import { ESLintUtils } from "@typescript-eslint/experimental-utils";

const createRule = ESLintUtils.RuleCreator((name) => {
  return `https://github.com/JonnyBurger/remotion`;
});

type Options = [];

type MessageIds = "NoNativeImgTag" | "NoNativeIFrameTag";

const NoNativeImgTag =
  "Prefer the <Img /> tag from 'remotion' package, because it will wait until the image is loaded when you are rendering your video.";
const NoNativeIFrameTag =
  "Prefer the <IFrame /> tag from 'remotion' package, because it will wait until the iframe is loaded when you are rendering your video.";

export default createRule<Options, MessageIds>({
  name: "warn-native-media-tag",
  meta: {
    type: "problem",
    docs: {
      description: NoNativeImgTag,
      category: "Best Practices",
      recommended: "warn",
    },
    fixable: undefined,
    schema: [],
    messages: {
      NoNativeImgTag,
      NoNativeIFrameTag,
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      JSXOpeningElement: (node) => {
        // @ts-expect-error
        if (node.name.name === "img") {
          context.report({
            messageId: "NoNativeImgTag",
            node,
          });
        }
        // @ts-expect-error
        if (node.name.name === "iframe") {
          context.report({
            messageId: "NoNativeIFrameTag",
            node,
          });
        }
      },
    };
  },
});
