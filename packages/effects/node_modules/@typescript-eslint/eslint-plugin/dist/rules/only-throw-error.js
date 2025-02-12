"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'only-throw-error',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow throwing non-`Error` values as exceptions',
            extendsBaseRule: 'no-throw-literal',
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        messages: {
            object: 'Expected an error object to be thrown.',
            undef: 'Do not throw undefined.',
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    allow: {
                        ...util_1.typeOrValueSpecifiersSchema,
                        description: 'Type specifiers that can be thrown.',
                    },
                    allowThrowingAny: {
                        type: 'boolean',
                        description: 'Whether to always allow throwing values typed as `any`.',
                    },
                    allowThrowingUnknown: {
                        type: 'boolean',
                        description: 'Whether to always allow throwing values typed as `unknown`.',
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            allow: [],
            allowThrowingAny: true,
            allowThrowingUnknown: true,
        },
    ],
    create(context, [options]) {
        const services = (0, util_1.getParserServices)(context);
        const allow = options.allow;
        function checkThrowArgument(node) {
            if (node.type === utils_1.AST_NODE_TYPES.AwaitExpression ||
                node.type === utils_1.AST_NODE_TYPES.YieldExpression) {
                return;
            }
            const type = services.getTypeAtLocation(node);
            if ((0, util_1.typeMatchesSomeSpecifier)(type, allow, services.program)) {
                return;
            }
            if (type.flags & ts.TypeFlags.Undefined) {
                context.report({ node, messageId: 'undef' });
                return;
            }
            if (options.allowThrowingAny && (0, util_1.isTypeAnyType)(type)) {
                return;
            }
            if (options.allowThrowingUnknown && (0, util_1.isTypeUnknownType)(type)) {
                return;
            }
            if ((0, util_1.isErrorLike)(services.program, type)) {
                return;
            }
            context.report({ node, messageId: 'object' });
        }
        return {
            ThrowStatement(node) {
                checkThrowArgument(node.argument);
            },
        };
    },
});
//# sourceMappingURL=only-throw-error.js.map