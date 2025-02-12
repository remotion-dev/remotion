"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  configs: () => configs,
  default: () => src_default,
  rules: () => rules
});
module.exports = __toCommonJS(src_exports);

// src/only-export-components.ts
var reactComponentNameRE = /^[A-Z][a-zA-Z0-9]*$/u;
var onlyExportComponents = {
  meta: {
    messages: {
      exportAll: "This rule can't verify that `export *` only exports components.",
      namedExport: "Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.",
      anonymousExport: "Fast refresh can't handle anonymous components. Add a name to your export.",
      localComponents: "Fast refresh only works when a file only exports components. Move your component(s) to a separate file.",
      noExport: "Fast refresh only works when a file has exports. Move your component(s) to a separate file.",
      reactContext: "Fast refresh only works when a file only exports components. Move your React context(s) to a separate file."
    },
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          allowExportNames: { type: "array", items: { type: "string" } },
          allowConstantExport: { type: "boolean" },
          customHOCs: { type: "array", items: { type: "string" } },
          checkJS: { type: "boolean" }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [],
  create: (context) => {
    const {
      allowExportNames,
      allowConstantExport = false,
      customHOCs = [],
      checkJS = false
    } = context.options[0] ?? {};
    const filename = context.filename;
    if (filename.includes(".test.") || filename.includes(".spec.") || filename.includes(".cy.") || filename.includes(".stories.")) {
      return {};
    }
    const shouldScan = filename.endsWith(".jsx") || filename.endsWith(".tsx") || checkJS && filename.endsWith(".js");
    if (!shouldScan)
      return {};
    const allowExportNamesSet = allowExportNames ? new Set(allowExportNames) : void 0;
    const reactHOCs = ["memo", "forwardRef", ...customHOCs];
    const canBeReactFunctionComponent = (init) => {
      if (!init)
        return false;
      if (init.type === "ArrowFunctionExpression")
        return true;
      if (init.type === "CallExpression" && init.callee.type === "Identifier") {
        return reactHOCs.includes(init.callee.name);
      }
      return false;
    };
    return {
      Program(program) {
        let hasExports = false;
        let hasReactExport = false;
        let reactIsInScope = false;
        const localComponents = [];
        const nonComponentExports = [];
        const reactContextExports = [];
        const handleExportIdentifier = (identifierNode, isFunction, init) => {
          if (identifierNode.type !== "Identifier") {
            nonComponentExports.push(identifierNode);
            return;
          }
          if (allowExportNamesSet == null ? void 0 : allowExportNamesSet.has(identifierNode.name))
            return;
          if (allowConstantExport && init && (init.type === "Literal" || // 1, "foo"
          init.type === "UnaryExpression" || // -1
          init.type === "TemplateLiteral" || // `Some ${template}`
          init.type === "BinaryExpression")) {
            return;
          }
          if (isFunction) {
            if (reactComponentNameRE.test(identifierNode.name)) {
              hasReactExport = true;
            } else {
              nonComponentExports.push(identifierNode);
            }
          } else {
            if (init && init.type === "CallExpression" && // createContext || React.createContext
            (init.callee.type === "Identifier" && init.callee.name === "createContext" || init.callee.type === "MemberExpression" && init.callee.property.type === "Identifier" && init.callee.property.name === "createContext")) {
              reactContextExports.push(identifierNode);
              return;
            }
            if (init && // Switch to allowList?
            notReactComponentExpression.has(init.type)) {
              nonComponentExports.push(identifierNode);
              return;
            }
            if (reactComponentNameRE.test(identifierNode.name)) {
              hasReactExport = true;
            } else {
              nonComponentExports.push(identifierNode);
            }
          }
        };
        const handleExportDeclaration = (node) => {
          var _a, _b;
          if (node.type === "VariableDeclaration") {
            for (const variable of node.declarations) {
              handleExportIdentifier(
                variable.id,
                canBeReactFunctionComponent(variable.init),
                variable.init
              );
            }
          } else if (node.type === "FunctionDeclaration") {
            if (node.id === null) {
              context.report({ messageId: "anonymousExport", node });
            } else {
              handleExportIdentifier(node.id, true);
            }
          } else if (node.type === "CallExpression") {
            if (node.callee.type === "CallExpression" && node.callee.callee.type === "Identifier" && node.callee.callee.name === "connect") {
              hasReactExport = true;
            } else if (node.callee.type !== "Identifier") {
              if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier" && reactHOCs.includes(node.callee.property.name)) {
                hasReactExport = true;
              } else {
                context.report({ messageId: "anonymousExport", node });
              }
            } else if (!reactHOCs.includes(node.callee.name)) {
              context.report({ messageId: "anonymousExport", node });
            } else if (((_a = node.arguments[0]) == null ? void 0 : _a.type) === "FunctionExpression" && node.arguments[0].id) {
              handleExportIdentifier(node.arguments[0].id, true);
            } else if (((_b = node.arguments[0]) == null ? void 0 : _b.type) === "Identifier") {
              hasReactExport = true;
            } else {
              context.report({ messageId: "anonymousExport", node });
            }
          } else if (node.type === "TSEnumDeclaration") {
            nonComponentExports.push(node.id);
          }
        };
        for (const node of program.body) {
          if (node.type === "ExportAllDeclaration") {
            if (node.exportKind === "type")
              continue;
            hasExports = true;
            context.report({ messageId: "exportAll", node });
          } else if (node.type === "ExportDefaultDeclaration") {
            hasExports = true;
            const declaration = node.declaration.type === "TSAsExpression" || node.declaration.type === "TSSatisfiesExpression" ? node.declaration.expression : node.declaration;
            if (declaration.type === "VariableDeclaration" || declaration.type === "FunctionDeclaration" || declaration.type === "CallExpression") {
              handleExportDeclaration(declaration);
            }
            if (declaration.type === "Identifier") {
              handleExportIdentifier(declaration);
            }
            if (declaration.type === "ArrowFunctionExpression") {
              context.report({ messageId: "anonymousExport", node });
            }
          } else if (node.type === "ExportNamedDeclaration") {
            if (node.exportKind === "type")
              continue;
            hasExports = true;
            if (node.declaration)
              handleExportDeclaration(node.declaration);
            for (const specifier of node.specifiers) {
              handleExportIdentifier(
                specifier.exported.type === "Identifier" && specifier.exported.name === "default" ? specifier.local : specifier.exported
              );
            }
          } else if (node.type === "VariableDeclaration") {
            for (const variable of node.declarations) {
              if (variable.id.type === "Identifier" && reactComponentNameRE.test(variable.id.name) && canBeReactFunctionComponent(variable.init)) {
                localComponents.push(variable.id);
              }
            }
          } else if (node.type === "FunctionDeclaration") {
            if (reactComponentNameRE.test(node.id.name)) {
              localComponents.push(node.id);
            }
          } else if (node.type === "ImportDeclaration" && node.source.value === "react") {
            reactIsInScope = true;
          }
        }
        if (checkJS && !reactIsInScope)
          return;
        if (hasExports) {
          if (hasReactExport) {
            for (const node of nonComponentExports) {
              context.report({ messageId: "namedExport", node });
            }
            for (const node of reactContextExports) {
              context.report({ messageId: "reactContext", node });
            }
          } else if (localComponents.length) {
            for (const node of localComponents) {
              context.report({ messageId: "localComponents", node });
            }
          }
        } else if (localComponents.length) {
          for (const node of localComponents) {
            context.report({ messageId: "noExport", node });
          }
        }
      }
    };
  }
};
var notReactComponentExpression = /* @__PURE__ */ new Set([
  "ArrayExpression",
  "AwaitExpression",
  "BinaryExpression",
  "ChainExpression",
  "ConditionalExpression",
  "Literal",
  "LogicalExpression",
  "ObjectExpression",
  "TemplateLiteral",
  "ThisExpression",
  "UnaryExpression",
  "UpdateExpression"
]);

// src/index.ts
var rules = {
  "only-export-components": onlyExportComponents
};
var plugin = { rules };
var configs = {
  recommended: {
    plugins: { "react-refresh": plugin },
    rules: { "react-refresh/only-export-components": "error" }
  },
  vite: {
    plugins: { "react-refresh": plugin },
    rules: {
      "react-refresh/only-export-components": [
        "error",
        { allowConstantExport: true }
      ]
    }
  }
};
var src_default = { rules, configs };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  configs,
  rules
});
