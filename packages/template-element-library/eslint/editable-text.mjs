import { findVariable, importedName, resolveExpression, staticString } from "./ast.mjs";

// Interactive SVG shapes have no children control.
const shapeLayers = new Set(["Circle", "Ellipse", "G", "Line", "Path", "Rect", "Svg"]);
const hiddenTags = new Set(["title", "desc", "metadata", "script", "style"]);
const schemaFragments = { childrenSchema: "children", captionsSchema: "captions" };
// Punctuation and symbols alone are treated as decoration.
const visible = /[\p{L}\p{N}]/u;

export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Keep the text of an Element editable in Studio.",
      url: "https://www.remotion.dev/docs/elements/creating#expose-layers-with-interactive",
    },
    schema: [],
    messages: {
      plain:
        "Studio cannot edit this text. Write it as the only child of a named Interactive node such as <Interactive.Div>, or pass it as a prop that Interactive.create() exposes.",
      mixed:
        "Studio cannot edit text that has siblings, including JSX comments. Make it the only child of its own Interactive node.",
      constant:
        "Write this text inline. Studio cannot edit text that comes from a constant or template literal.",
      prop: "Add `{{key}}` to the schema of Interactive.create(). Text passed as a prop is only editable in Studio if the schema exposes it.",
    },
  },
  create(context) {
    const { sourceCode } = context;
    const elementComponents = new Set();
    const schemaKeys = new Set();
    const nodes = [];
    let unknownSchema = false;

    const addComponent = (expression) => {
      const node = resolveExpression(expression, sourceCode);
      if (node) elementComponents.add(node);
    };

    const addSchema = (expression) => {
      const node = resolveExpression(expression, sourceCode);
      if (node?.type !== "ObjectExpression") {
        unknownSchema = true;
        return;
      }

      for (const property of node.properties) {
        if (property.type === "Property") {
          const key = property.computed
            ? staticString(property.key, sourceCode)
            : (property.key.name ?? property.key.value);
          if (key === null) unknownSchema = true;
          else schemaKeys.add(String(key));
          continue;
        }

        const imported = importedName(property.argument, sourceCode);
        if (imported?.source !== "remotion") addSchema(property.argument);
        else if (schemaFragments[imported.name[1]])
          schemaKeys.add(schemaFragments[imported.name[1]]);
      }
    };

    // Returns {key: null} for static text, {key} for text that comes from a prop
    // of the Element, and null for values that are computed or come from data.
    const textSource = (expression, seen = new Set()) => {
      const members = [];
      let node = expression;
      while (node && !seen.has(node)) {
        seen.add(node);
        node = resolveExpression(node, sourceCode);
        if (node?.type === "ChainExpression") node = node.expression;
        else if (node?.type === "CallExpression" && node.callee.type === "MemberExpression") {
          node = node.callee;
        } else if (node?.type === "MemberExpression" && !node.computed) {
          members.unshift(node.property.name);
          node = node.object;
        } else break;
      }

      if (!node) return null;
      // Mapping over a list renders data, but mapping over split text renders text.
      if (members.some((name) => /^(?:flatMap|map)$/.test(name)) && !members.includes("split")) {
        return null;
      }

      const text = staticString(node, sourceCode);
      if (text !== null) return visible.test(text) ? { key: null } : null;
      if (node.type === "TemplateLiteral") {
        if (node.quasis.some((quasi) => visible.test(quasi.value.raw))) return { key: null };
        return node.expressions.map((part) => textSource(part, seen)).find(Boolean) ?? null;
      }

      if (node.type === "ConditionalExpression") {
        return textSource(node.consequent, seen) ?? textSource(node.alternate, seen);
      }

      if (node.type === "LogicalExpression" || node.type === "BinaryExpression") {
        if (node.type === "BinaryExpression" && node.operator !== "+") return null;
        return (
          (node.operator === "&&" ? null : textSource(node.left, seen)) ??
          textSource(node.right, seen)
        );
      }

      if (node.type !== "Identifier") return null;
      const definition = findVariable(node, sourceCode)?.defs[0];
      if (definition?.type !== "Parameter" || !elementComponents.has(definition.node)) return null;
      const props = definition.node.params[0];
      if (props === definition.name) return members[0] ? { key: members[0] } : null;
      const property =
        definition.name.parent.type === "AssignmentPattern"
          ? definition.name.parent.parent
          : definition.name.parent;
      if (property.type !== "Property" || property.parent !== props) return null;
      return { key: property.key.name ?? property.key.value };
    };

    const check = (node) => {
      let editable = false;
      if (node.type === "JSXElement") {
        const tag = node.openingElement.name;
        const imported = importedName(tag, sourceCode);
        if (imported?.source === "remotion") {
          editable =
            imported.name.join(".") === "AbsoluteFill" ||
            (imported.name.length === 2 &&
              imported.name[0] === "Interactive" &&
              !shapeLayers.has(imported.name[1]));
        } else if (
          // Other components decide themselves how they render their children.
          tag.type !== "JSXIdentifier" ||
          !/^[a-z]/.test(tag.name) ||
          hiddenTags.has(tag.name)
        ) {
          return;
        }
      }

      // Studio only ignores whitespace, so a JSX comment counts as a sibling.
      const children = node.children.filter(
        (child) => child.type !== "JSXText" || child.value.trim() !== "",
      );
      for (const child of children) {
        if (child.type !== "JSXText" && child.type !== "JSXExpressionContainer") continue;
        const source =
          child.type === "JSXText"
            ? visible.test(child.value)
              ? { key: null }
              : null
            : textSource(child.expression);
        if (!source) continue;
        if (source.key !== null) {
          // A schema that cannot be read statically may expose any prop.
          if (!unknownSchema && !schemaKeys.has(String(source.key))) {
            context.report({ node: child, messageId: "prop", data: { key: source.key } });
          }
        } else if (!editable) {
          context.report({ node: child, messageId: "plain" });
        } else if (children.length > 1) {
          context.report({ node: child, messageId: "mixed" });
        } else if (child.type !== "JSXText" && child.expression.type !== "Literal") {
          context.report({ node: child, messageId: "constant" });
        }
      }
    };

    return {
      Program(program) {
        for (const statement of program.body) {
          if (statement.type === "ExportDefaultDeclaration") addComponent(statement.declaration);
          if (statement.type !== "ExportNamedDeclaration") continue;
          for (const specifier of statement.source ? [] : statement.specifiers) {
            addComponent(specifier.local);
          }

          if (statement.declaration?.type === "FunctionDeclaration") {
            elementComponents.add(statement.declaration);
          }

          for (const declarator of statement.declaration?.declarations ?? []) {
            addComponent(declarator.init);
          }
        }
      },
      CallExpression(node) {
        const imported = importedName(node.callee, sourceCode);
        if (imported?.source !== "remotion" || imported.name.join(".") !== "Interactive.create") {
          return;
        }

        const options = resolveExpression(node.arguments[0], sourceCode);
        if (options?.type !== "ObjectExpression") {
          unknownSchema = true;
          return;
        }

        for (const property of options.properties) {
          if (property.type !== "Property") unknownSchema = true;
          else if (property.key.name === "Component") addComponent(property.value);
          else if (property.key.name === "schema") addSchema(property.value);
        }
      },
      JSXElement: (node) => nodes.push(node),
      JSXFragment: (node) => nodes.push(node),
      // Interactive.create() usually follows the component it wraps, so the text
      // is checked once every component and schema of the file is known.
      "Program:exit"() {
        nodes.forEach(check);
      },
    };
  },
};
