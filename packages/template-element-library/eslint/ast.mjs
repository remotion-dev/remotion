// Resolve bindings instead of matching local names, so aliases and shadowing work.
export const findVariable = (node, sourceCode) => {
  for (let scope = sourceCode.getScope(node); scope; scope = scope.upper) {
    const variable = scope.set.get(node.name);
    if (variable) return variable;
  }

  return null;
};

export const resolveExpression = (node, sourceCode, seen = new Set()) => {
  if (!node || seen.has(node)) return node;
  seen.add(node);

  if (["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression"].includes(node.type)) {
    return resolveExpression(node.expression, sourceCode, seen);
  }

  if (node.type === "Identifier") {
    const definition = findVariable(node, sourceCode)?.defs[0];
    if (
      definition?.type === "Variable" &&
      definition.parent.kind === "const" &&
      definition.node.id.type === "Identifier" &&
      definition.node.init
    ) {
      return resolveExpression(definition.node.init, sourceCode, seen);
    }
  }

  return node;
};

export const staticString = (expression, sourceCode, seen = new Set()) => {
  const node = resolveExpression(expression, sourceCode);
  if (!node || seen.has(node)) return null;
  seen.add(node);

  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }

  if (node.type === "TemplateLiteral") {
    let value = node.quasis[0].value.cooked ?? node.quasis[0].value.raw;
    for (let i = 0; i < node.expressions.length; i++) {
      const part = staticString(node.expressions[i], sourceCode, new Set(seen));
      if (part === null) return null;
      value += part + (node.quasis[i + 1].value.cooked ?? node.quasis[i + 1].value.raw);
    }

    return value;
  }

  if (node.type === "BinaryExpression" && node.operator === "+") {
    const left = staticString(node.left, sourceCode, new Set(seen));
    const right = staticString(node.right, sourceCode, new Set(seen));
    return left === null || right === null ? null : left + right;
  }

  return null;
};

export const importedName = (node, sourceCode) => {
  if (!node) return null;
  if (node.type === "MemberExpression" || node.type === "JSXMemberExpression") {
    const object = importedName(node.object, sourceCode);
    const property = node.computed ? staticString(node.property, sourceCode) : node.property.name;
    return object && property ? { source: object.source, name: [...object.name, property] } : null;
  }

  if (node.type !== "Identifier" && node.type !== "JSXIdentifier") return null;
  const definition = findVariable(node, sourceCode)?.defs[0];
  if (definition?.type !== "ImportBinding") return null;
  const specifier = definition.node;
  return {
    source: definition.parent.source.value,
    name:
      specifier.type === "ImportNamespaceSpecifier"
        ? []
        : [specifier.imported?.name ?? specifier.imported?.value ?? "default"],
  };
};

// Imports, re-exports and static dynamic imports all affect portability.
export const importVisitors = (sourceCode, check) => ({
  ImportDeclaration: (node) => check(node.source),
  ExportNamedDeclaration: (node) => {
    if (node.source) check(node.source);
  },
  ExportAllDeclaration: (node) => check(node.source),
  ImportExpression: (node) => check(node.source),
  TSImportEqualsDeclaration: (node) => {
    if (node.moduleReference.type === "TSExternalModuleReference") {
      check(node.moduleReference.expression);
    }
  },
  CallExpression: (node) => {
    if (
      node.callee.type === "Identifier" &&
      node.callee.name === "require" &&
      !findVariable(node.callee, sourceCode)?.defs.length &&
      node.arguments[0]
    ) {
      check(node.arguments[0]);
    }
  },
});
