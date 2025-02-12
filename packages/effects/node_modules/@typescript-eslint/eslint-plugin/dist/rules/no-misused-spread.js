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
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'no-misused-spread',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow using the spread operator when it might cause unexpected behavior',
            recommended: 'strict',
            requiresTypeChecking: true,
        },
        messages: {
            noArraySpreadInObject: 'Using the spread operator on an array in an object will result in a list of indices.',
            noClassDeclarationSpreadInObject: 'Using the spread operator on class declarations will spread only their static properties, and will lose their class prototype.',
            noClassInstanceSpreadInObject: 'Using the spread operator on class instances will lose their class prototype.',
            noFunctionSpreadInObject: 'Using the spread operator on a function without additional properties can cause unexpected behavior. Did you forget to call the function?',
            noIterableSpreadInObject: 'Using the spread operator on an Iterable in an object can cause unexpected behavior.',
            noMapSpreadInObject: 'Using the spread operator on a Map in an object will result in an empty object. Did you mean to use `Object.fromEntries(map)` instead?',
            noPromiseSpreadInObject: 'Using the spread operator on Promise in an object can cause unexpected behavior. Did you forget to await the promise?',
            noStringSpread: "Using the spread operator on a string can cause unexpected behavior. Prefer `.split('')` instead.",
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    allow: {
                        ...util_1.readonlynessOptionsSchema.properties.allow,
                        description: 'An array of type specifiers that are known to be safe to spread.',
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            allow: [],
        },
    ],
    create(context, [options]) {
        const services = (0, util_1.getParserServices)(context);
        const checker = services.program.getTypeChecker();
        function checkArrayOrCallSpread(node) {
            const type = (0, util_1.getConstrainedTypeAtLocation)(services, node.argument);
            if (!(0, util_1.typeMatchesSomeSpecifier)(type, options.allow, services.program) &&
                isString(type)) {
                context.report({
                    node,
                    messageId: 'noStringSpread',
                });
            }
        }
        function checkObjectSpread(node) {
            const type = (0, util_1.getConstrainedTypeAtLocation)(services, node.argument);
            if ((0, util_1.typeMatchesSomeSpecifier)(type, options.allow, services.program)) {
                return;
            }
            if (isPromise(services.program, type)) {
                context.report({
                    node,
                    messageId: 'noPromiseSpreadInObject',
                });
                return;
            }
            if (isFunctionWithoutProps(type)) {
                context.report({
                    node,
                    messageId: 'noFunctionSpreadInObject',
                });
                return;
            }
            if (isMap(services.program, type)) {
                context.report({
                    node,
                    messageId: 'noMapSpreadInObject',
                });
                return;
            }
            if (isArray(checker, type)) {
                context.report({
                    node,
                    messageId: 'noArraySpreadInObject',
                });
                return;
            }
            if (isIterable(type, checker) &&
                // Don't report when the type is string, since TS will flag it already
                !isString(type)) {
                context.report({
                    node,
                    messageId: 'noIterableSpreadInObject',
                });
                return;
            }
            if (isClassInstance(checker, type)) {
                context.report({
                    node,
                    messageId: 'noClassInstanceSpreadInObject',
                });
                return;
            }
            if (isClassDeclaration(type)) {
                context.report({
                    node,
                    messageId: 'noClassDeclarationSpreadInObject',
                });
            }
        }
        return {
            'ArrayExpression > SpreadElement': checkArrayOrCallSpread,
            'CallExpression > SpreadElement': checkArrayOrCallSpread,
            JSXSpreadAttribute: checkObjectSpread,
            'ObjectExpression > SpreadElement': checkObjectSpread,
        };
    },
});
function isIterable(type, checker) {
    return tsutils
        .typeParts(type)
        .some(t => !!tsutils.getWellKnownSymbolPropertyOfType(t, 'iterator', checker));
}
function isArray(checker, type) {
    return isTypeRecurser(type, t => checker.isArrayType(t) || checker.isTupleType(t));
}
function isString(type) {
    return isTypeRecurser(type, t => (0, util_1.isTypeFlagSet)(t, ts.TypeFlags.StringLike));
}
function isFunctionWithoutProps(type) {
    return isTypeRecurser(type, t => t.getCallSignatures().length > 0 && t.getProperties().length === 0);
}
function isPromise(program, type) {
    return isTypeRecurser(type, t => (0, util_1.isPromiseLike)(program, t));
}
function isClassInstance(checker, type) {
    return isTypeRecurser(type, t => {
        // If the type itself has a construct signature, it's a class(-like)
        if (t.getConstructSignatures().length) {
            return false;
        }
        const symbol = t.getSymbol();
        // If the type's symbol has a construct signature, the type is an instance
        return !!symbol
            ?.getDeclarations()
            ?.some(declaration => checker
            .getTypeOfSymbolAtLocation(symbol, declaration)
            .getConstructSignatures().length);
    });
}
function isClassDeclaration(type) {
    return isTypeRecurser(type, t => {
        if (tsutils.isObjectType(t) &&
            tsutils.isObjectFlagSet(t, ts.ObjectFlags.InstantiationExpressionType)) {
            return true;
        }
        const kind = t.getSymbol()?.valueDeclaration?.kind;
        return (kind === ts.SyntaxKind.ClassDeclaration ||
            kind === ts.SyntaxKind.ClassExpression);
    });
}
function isMap(program, type) {
    return isTypeRecurser(type, t => (0, util_1.isBuiltinSymbolLike)(program, t, ['Map', 'ReadonlyMap', 'WeakMap']));
}
function isTypeRecurser(type, predicate) {
    if (type.isUnionOrIntersection()) {
        return type.types.some(t => isTypeRecurser(t, predicate));
    }
    return predicate(type);
}
//# sourceMappingURL=no-misused-spread.js.map