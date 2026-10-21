import {
  findVariable,
  importedName,
  importVisitors,
  resolveExpression,
  staticString,
} from "./ast.mjs";

const assetProperties = new Set(["src", "srcSet", "poster"]);
const assetExtension =
  /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp|mp4|webm|mov|m4v|mp3|wav|ogg|m4a|aac|flac|woff2?|ttf|otf)(?:[?#]|$)/i;

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Pass Element assets through props instead of hardcoding them.",
      url: "https://www.remotion.dev/docs/studio-protocol/component-library-integration#asset-handling",
    },
    schema: [],
    messages: {
      asset:
        "Pass this asset through props. Put preview URLs in the registry's initialProps, and declare downloadable assets in its assets metadata.",
    },
  },
  create(context) {
    const { sourceCode } = context;
    const report = (node) => context.report({ node, messageId: "asset" });

    const hasAsset = (expression, seen = new Set()) => {
      const node = resolveExpression(expression, sourceCode);
      if (!node || seen.has(node)) return false;
      seen.add(node);
      const value = staticString(node, sourceCode);
      if (value !== null) return value.trim() !== "" && !value.startsWith("#");
      if (node.type === "Identifier") {
        // A prop may have any name, including a destructuring alias. Its default
        // is still a hardcoded asset when the binding is used as a media source.
        return (findVariable(node, sourceCode)?.identifiers ?? []).some(
          (binding) =>
            binding.parent.type === "AssignmentPattern" &&
            binding.parent.left === binding &&
            hasAsset(binding.parent.right, new Set(seen)),
        );
      }

      if (node.type === "LogicalExpression") {
        return hasAsset(node.left, new Set(seen)) || hasAsset(node.right, new Set(seen));
      }

      if (node.type === "ConditionalExpression") {
        return hasAsset(node.consequent, new Set(seen)) || hasAsset(node.alternate, new Set(seen));
      }

      // A dynamic filename does not make a hardcoded host or directory portable.
      if (node.type === "TemplateLiteral") {
        if (node.quasis[0].value.raw.startsWith("#")) return false;
        return (
          node.quasis[0].value.raw.trim() !== "" || hasAsset(node.expressions[0], new Set(seen))
        );
      }

      if (node.type === "BinaryExpression" && node.operator === "+") {
        return hasAsset(node.left, new Set(seen));
      }

      return false;
    };

    const imports = importVisitors(sourceCode, (node) => {
      const value = staticString(node, sourceCode);
      if (value !== null && assetExtension.test(value)) report(node);
    });

    return {
      ...imports,
      CallExpression(node) {
        imports.CallExpression(node);
        const imported = importedName(node.callee, sourceCode);
        if (imported?.source === "remotion" && imported.name.join(".") === "staticFile") {
          report(node);
        }
      },
      JSXAttribute(node) {
        const name = node.name.name;
        const tag = node.parent.name;
        const isSvgAsset =
          tag.type === "JSXIdentifier" &&
          ["image", "use"].includes(tag.name) &&
          ["href", "xlinkHref"].includes(name);
        if (!assetProperties.has(name) && !isSvgAsset) return;
        const value =
          node.value?.type === "JSXExpressionContainer" ? node.value.expression : node.value;
        if (hasAsset(value)) report(node);
      },
      Property(node) {
        const key = node.computed
          ? staticString(node.key, sourceCode)
          : (node.key.name ?? node.key.value);
        if (assetProperties.has(key) && hasAsset(node.value)) report(node.value);
        if (["background", "backgroundImage", "mask", "maskImage"].includes(key)) {
          const value = staticString(node.value, sourceCode);
          if (value !== null && /url\(\s*["']?(?!["']?#)[^\s)'"#]/i.test(value)) {
            report(node.value);
          }
        }
      },
    };
  },
};
