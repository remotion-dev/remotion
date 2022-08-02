import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(() => {
  return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds = "UseGifComponent";

const UseGifComponent = [
  "Use the <Gif> component for animated GIFs instead.",
  "See: https://www.remotion.dev/docs/gif",
].join("\n");

export default createRule<Options, MessageIds>({
  name: "use-gif-component",
  meta: {
    type: "problem",
    docs: {
      description: UseGifComponent,
      recommended: "warn",
    },
    fixable: undefined,
    schema: [],
    messages: {
      UseGifComponent: UseGifComponent,
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      JSXAttribute: (node) => {
        if (node.type !== "JSXAttribute") {
          return;
        }
        if (node.name.name !== "src") {
          return;
        }
        const value = node.value;
        // src={"some string"}
        const insideCurlyBraces =
          value &&
          value.type === "JSXExpressionContainer" &&
          value.expression.type === "Literal";
        if (!value || (value.type !== "Literal" && !insideCurlyBraces)) {
          return;
        }
        const stringValue =
          value &&
          value.type === "JSXExpressionContainer" &&
          value.expression.type === "Literal"
            ? value.expression.value
            : value.type === "Literal"
            ? value.value
            : null;
        if (typeof stringValue !== "string") {
          return;
        }

        const parent = node.parent;
        if (!parent) {
          return;
        }
        if (parent.type !== "JSXOpeningElement") {
          return;
        }
        const name = parent.name;
        if (name.type !== "JSXIdentifier") {
          return;
        }
        if (name.name === "Img" || name.name === "img") {
          // Network and inline URLs are okay
          if (stringValue.includes(".gif")) {
            context.report({
              messageId: "UseGifComponent",
              node,
            });
          }
        }
      },
    };
  },
});
