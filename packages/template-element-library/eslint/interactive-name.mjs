import { importedName, resolveExpression, staticString } from "./ast.mjs";

const remotionLayers = new Set([
  "Img",
  "Audio",
  "Video",
  "Html5Audio",
  "Html5Video",
  "OffthreadVideo",
  "Sequence",
  "Series.Sequence",
]);

export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Give editable Element layers a name in Studio.",
      url: "https://www.remotion.dev/docs/studio/interactivity-best-practices#give-interactive-elements-a-descriptive-name",
    },
    schema: [],
    messages: {
      name: "Give this editable layer an explicit, nonempty name so users can identify it in Studio.",
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      JSXOpeningElement(node) {
        const imported = importedName(node.name, sourceCode);
        if (!imported) return;
        const name = imported.name.join(".");
        const interactive =
          (imported.source === "remotion" &&
            ((imported.name.length === 2 && imported.name[0] === "Interactive") ||
              remotionLayers.has(name))) ||
          (imported.source === "@remotion/media" && ["Video", "Audio"].includes(name)) ||
          (imported.source === "@remotion/gif" && name === "Gif");
        if (!interactive) return;

        const attribute = node.attributes.find(
          (candidate) => candidate.type === "JSXAttribute" && candidate.name.name === "name",
        );
        const value =
          attribute?.value?.type === "JSXExpressionContainer"
            ? attribute.value.expression
            : attribute?.value;
        const expression = resolveExpression(value, sourceCode);
        const text = staticString(value, sourceCode);
        // Dynamic names are allowed; only reject missing or statically invalid names.
        if (
          !value ||
          (text !== null && text.trim() === "") ||
          (expression?.type === "Literal" && typeof expression.value !== "string") ||
          (expression?.type === "Identifier" && expression.name === "undefined")
        ) {
          context.report({ node: attribute ?? node, messageId: "name" });
        }
      },
    };
  },
};
