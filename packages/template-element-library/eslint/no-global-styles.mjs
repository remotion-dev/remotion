import { findVariable, importVisitors, resolveExpression, staticString } from "./ast.mjs";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Keep Element styles local to the Element.",
      url: "https://www.remotion.dev/docs/studio/creating-elements#make-it-portable",
    },
    schema: [],
    messages: {
      global:
        "Keep styles on the Element's own nodes. Stylesheet imports, global style tags and document-level style mutations affect the host project.",
    },
  },
  create(context) {
    const { sourceCode } = context;
    const report = (node) => context.report({ node, messageId: "global" });
    const globalPath = (expression, seen = new Set()) => {
      const node = resolveExpression(expression, sourceCode);
      if (!node || seen.has(node)) return "";
      seen.add(node);
      if (node.type === "Identifier") {
        return findVariable(node, sourceCode)?.defs.length ? "" : node.name;
      }

      if (node.type === "MemberExpression") {
        const object = globalPath(node.object, seen);
        const property = node.computed
          ? staticString(node.property, sourceCode)
          : node.property.name;
        return object && property ? `${object}.${property}` : "";
      }

      return "";
    };
    const globalStyle =
      /^(?:(?:window|globalThis)\.)?document\.(?:body|documentElement)\.style(?:\.|$)/;
    const globalAttribute =
      /^(?:(?:window|globalThis)\.)?document\.(?:body|documentElement)\.(?:setAttribute|removeAttribute)$/;
    const imports = importVisitors(sourceCode, (node) => {
      const value = staticString(node, sourceCode);
      if (value !== null && /\.(?:css|scss|sass|less|styl)(?:[?#]|$)/i.test(value)) report(node);
    });

    return {
      ...imports,
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier") return;
        if (node.name.name === "style") report(node);
        if (
          node.name.name === "link" &&
          node.attributes.some(
            (attribute) =>
              attribute.type === "JSXAttribute" &&
              attribute.name.name === "rel" &&
              staticString(
                attribute.value?.type === "JSXExpressionContainer"
                  ? attribute.value.expression
                  : attribute.value,
                sourceCode,
              )
                ?.toLowerCase()
                .split(/\s+/)
                .includes("stylesheet"),
          )
        ) {
          report(node);
        }
      },
      AssignmentExpression(node) {
        if (globalStyle.test(globalPath(node.left))) report(node);
      },
      UpdateExpression(node) {
        if (globalStyle.test(globalPath(node.argument))) report(node);
      },
      CallExpression(node) {
        imports.CallExpression(node);
        const path = globalPath(node.callee);
        if (/\.(?:setProperty|removeProperty)$/.test(path) && globalStyle.test(path)) {
          report(node);
        } else if (path === "Object.assign" && globalStyle.test(globalPath(node.arguments[0]))) {
          report(node);
        } else if (
          globalAttribute.test(path) &&
          staticString(node.arguments[0], sourceCode) === "style"
        ) {
          report(node);
        }
      },
    };
  },
};
