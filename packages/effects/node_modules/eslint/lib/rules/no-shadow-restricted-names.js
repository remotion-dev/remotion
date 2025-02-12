/**
 * @fileoverview Disallow shadowing of NaN, undefined, and Infinity (ES5 section 15.1.1)
 * @author Michael Ficarra
 */
"use strict";

/**
 * Determines if a variable safely shadows undefined.
 * This is the case when a variable named `undefined` is never assigned to a value (i.e. it always shares the same value
 * as the global).
 * @param {eslintScope.Variable} variable The variable to check
 * @returns {boolean} true if this variable safely shadows `undefined`
 */
function safelyShadowsUndefined(variable) {
    return variable.name === "undefined" &&
        variable.references.every(ref => !ref.isWrite()) &&
        variable.defs.every(def => def.node.type === "VariableDeclarator" && def.node.init === null);
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
    meta: {
        type: "suggestion",

        docs: {
            description: "Disallow identifiers from shadowing restricted names",
            recommended: true,
            url: "https://eslint.org/docs/latest/rules/no-shadow-restricted-names"
        },

        schema: [],

        messages: {
            shadowingRestrictedName: "Shadowing of global property '{{name}}'."
        }
    },

    create(context) {


        const RESTRICTED = new Set(["undefined", "NaN", "Infinity", "arguments", "eval"]);
        const sourceCode = context.sourceCode;

        // Track reported nodes to avoid duplicate reports. For example, on class declarations.
        const reportedNodes = new Set();

        return {
            "VariableDeclaration, :function, CatchClause, ImportDeclaration, ClassDeclaration, ClassExpression"(node) {
                for (const variable of sourceCode.getDeclaredVariables(node)) {
                    if (variable.defs.length > 0 && RESTRICTED.has(variable.name) && !safelyShadowsUndefined(variable)) {
                        for (const def of variable.defs) {
                            const nodeToReport = def.name;

                            if (!reportedNodes.has(nodeToReport)) {
                                reportedNodes.add(nodeToReport);
                                context.report({
                                    node: nodeToReport,
                                    messageId: "shadowingRestrictedName",
                                    data: {
                                        name: variable.name
                                    }
                                });
                            }
                        }
                    }
                }
            }
        };

    }
};
