import {readFileSync} from 'node:fs';
import type {
	CallExpression,
	Expression,
	File,
	JSXAttribute,
	JSXElement,
	JSXOpeningElement,
	NewExpression,
	ObjectExpression,
	ObjectProperty,
	TSAsExpression,
	UnaryExpression,
} from '@babel/types';
import {RenderInternals} from '@remotion/renderer';
import type {SubscribeToSequencePropsResponse} from '@remotion/studio-shared';
import {
	CUBIC_KEYFRAME_EASING,
	isKeyframeInterpolationFunction,
	LINEAR_KEYFRAME_EASING,
	parseSpringEasingConfig,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {
	CanUpdateSequencePropsResponseTrue,
	CanUpdateSequencePropStatus,
	ExtrapolateType,
	JsxComponentIdentity,
	LogLevel,
	SequenceNodePath,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {parseAst} from '../../codemods/parse-ast';
import {getAstNodePath} from '../../helpers/get-ast-node-path';
import {toImportAgnosticNodePath} from '../../helpers/import-agnostic-node-path';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import {
	getJsxComponentIdentity,
	jsxComponentIdentitiesMatch,
	JsxElementIdentityMismatchError,
} from '../jsx-component-identity';
import {JsxElementNotFoundAtLocationError} from '../jsx-element-not-found-at-location-error';
import {computeEffectPropStatus} from './can-update-effect-props';

type CanUpdatePropStatus = CanUpdateSequencePropStatus;
type KeyframedPropStatus = Extract<CanUpdatePropStatus, {status: 'keyframed'}>;
type PropKeyframes = KeyframedPropStatus['keyframes'];
type PropEasing = KeyframedPropStatus['easing'];
type PropClamping = KeyframedPropStatus['clamping'];
type PropPosterize = KeyframedPropStatus['posterize'];
type PropInterpolationFunction = KeyframedPropStatus['interpolationFunction'];

const staticStatus = (codeValue: unknown): CanUpdatePropStatus => ({
	status: 'static',
	codeValue,
});

const computedStatus = (): CanUpdatePropStatus => ({
	status: 'computed',
});

// Mirrors the encoding that staticFile() from "remotion" applies at runtime
const encodeStaticFilePath = (path: string): string => {
	return path.split('/').map(encodeURIComponent).join('/');
};

type SpecialValueCall =
	| {type: 'static-file'; value: string}
	| {type: 'date'; value: string};

// Detects calls that the Studio knows how to serialize back to source:
// staticFile("...") and new Date("...")
const getSpecialValueCall = (node: Expression): SpecialValueCall | null => {
	if (node.type === 'CallExpression') {
		const call = node as CallExpression;
		if (
			call.callee.type === 'Identifier' &&
			call.callee.name === 'staticFile' &&
			call.arguments.length === 1 &&
			call.arguments[0].type === 'StringLiteral'
		) {
			return {type: 'static-file', value: call.arguments[0].value};
		}

		return null;
	}

	if (node.type === 'NewExpression') {
		const newExpr = node as NewExpression;
		if (
			newExpr.callee.type === 'Identifier' &&
			newExpr.callee.name === 'Date' &&
			newExpr.arguments.length === 1 &&
			newExpr.arguments[0].type === 'StringLiteral'
		) {
			return {type: 'date', value: newExpr.arguments[0].value};
		}

		return null;
	}

	return null;
};

type StaticValueOptions = {
	allowSpecialValues: boolean;
};

const defaultStaticValueOptions: StaticValueOptions = {
	allowSpecialValues: false,
};

export const isStaticValue = (
	node: Expression,
	options: StaticValueOptions = defaultStaticValueOptions,
): boolean => {
	if (options.allowSpecialValues && getSpecialValueCall(node) !== null) {
		return true;
	}

	switch (node.type) {
		case 'NumericLiteral':
		case 'StringLiteral':
		case 'BooleanLiteral':
		case 'NullLiteral':
			return true;
		case 'UnaryExpression':
			return (
				((node as UnaryExpression).operator === '-' ||
					(node as UnaryExpression).operator === '+') &&
				(node as UnaryExpression).argument.type === 'NumericLiteral'
			);
		case 'TSAsExpression':
			return isStaticValue(
				(node as TSAsExpression).expression as Expression,
				options,
			);
		case 'ArrayExpression':
			return (
				node as Extract<Expression, {type: 'ArrayExpression'}>
			).elements.every(
				(el) =>
					el !== null &&
					el.type !== 'SpreadElement' &&
					isStaticValue(el, options),
			);
		case 'ObjectExpression':
			return (node as ObjectExpression).properties.every(
				(prop) =>
					prop.type === 'ObjectProperty' &&
					isStaticValue((prop as ObjectProperty).value as Expression, options),
			);
		default:
			return false;
	}
};

export const extractStaticValue = (
	node: Expression,
	options: StaticValueOptions = defaultStaticValueOptions,
): unknown => {
	if (options.allowSpecialValues) {
		const specialValue = getSpecialValueCall(node);
		if (specialValue !== null) {
			if (specialValue.type === 'static-file') {
				return `${NoReactInternals.FILE_TOKEN}${encodeStaticFilePath(specialValue.value)}`;
			}

			return `${NoReactInternals.DATE_TOKEN}${specialValue.value}`;
		}
	}

	switch (node.type) {
		case 'NumericLiteral':
		case 'StringLiteral':
		case 'BooleanLiteral':
			return (node as {value: unknown}).value;
		case 'NullLiteral':
			return null;
		case 'UnaryExpression': {
			const un = node as UnaryExpression;
			if (un.argument.type === 'NumericLiteral') {
				const val = (un.argument as {value: number}).value;
				return un.operator === '-' ? -val : val;
			}

			return undefined;
		}

		case 'TSAsExpression':
			return extractStaticValue(
				(node as TSAsExpression).expression as Expression,
				options,
			);
		case 'ArrayExpression':
			return (
				node as Extract<Expression, {type: 'ArrayExpression'}>
			).elements.map((el) => {
				if (el === null || el.type === 'SpreadElement') {
					return undefined;
				}

				return extractStaticValue(el, options);
			});
		case 'ObjectExpression': {
			const obj = node as ObjectExpression;
			const result: Record<string, unknown> = {};
			for (const prop of obj.properties) {
				if (prop.type === 'ObjectProperty') {
					const p = prop as ObjectProperty;
					const key =
						p.key.type === 'Identifier'
							? (p.key as {name: string}).name
							: p.key.type === 'StringLiteral' ||
								  p.key.type === 'NumericLiteral'
								? String((p.key as {value: unknown}).value)
								: undefined;
					if (key !== undefined) {
						result[key] = extractStaticValue(p.value as Expression, options);
					}
				}
			}

			return result;
		}

		default:
			return undefined;
	}
};

const getNumericValue = (node: Expression): number | null => {
	if (node.type === 'NumericLiteral') {
		return node.value;
	}

	if (
		node.type === 'UnaryExpression' &&
		(node.operator === '-' || node.operator === '+') &&
		node.argument.type === 'NumericLiteral'
	) {
		return node.operator === '-' ? -node.argument.value : node.argument.value;
	}

	if (node.type === 'TSAsExpression') {
		return getNumericValue(node.expression as Expression);
	}

	return null;
};

const getExtrapolateType = (node: Expression): ExtrapolateType | null => {
	if (node.type === 'StringLiteral') {
		if (
			node.value === 'extend' ||
			node.value === 'identity' ||
			node.value === 'clamp' ||
			node.value === 'wrap'
		) {
			return node.value;
		}

		return null;
	}

	if (node.type === 'TSAsExpression') {
		return getExtrapolateType(node.expression as Expression);
	}

	return null;
};

const getKeyframeEasing = (node: Expression): PropEasing[number] | null => {
	if (node.type === 'TSAsExpression') {
		return getKeyframeEasing(node.expression as Expression);
	}

	if (
		node.type === 'MemberExpression' &&
		node.object.type === 'Identifier' &&
		node.object.name === 'Easing' &&
		node.property.type === 'Identifier' &&
		node.computed === false
	) {
		if (node.property.name === 'linear') {
			return {type: 'linear'};
		}

		if (node.property.name === 'cubic') {
			return CUBIC_KEYFRAME_EASING;
		}
	}

	if (
		node.type !== 'CallExpression' ||
		node.callee.type !== 'MemberExpression' ||
		node.callee.object.type !== 'Identifier' ||
		node.callee.object.name !== 'Easing' ||
		node.callee.property.type !== 'Identifier' ||
		node.callee.computed
	) {
		return null;
	}

	if (node.callee.property.name === 'spring') {
		if (node.arguments.length > 1) {
			return null;
		}

		const springConfig = node.arguments[0];
		if (
			springConfig?.type === 'ArgumentPlaceholder' ||
			springConfig?.type === 'JSXNamespacedName' ||
			springConfig?.type === 'SpreadElement'
		) {
			return null;
		}

		return parseSpringEasingConfig(springConfig);
	}

	if (node.callee.property.name !== 'bezier' || node.arguments.length !== 4) {
		return null;
	}

	const values = node.arguments.map((arg) => {
		if (
			arg.type === 'ArgumentPlaceholder' ||
			arg.type === 'JSXNamespacedName' ||
			arg.type === 'SpreadElement'
		) {
			return null;
		}

		return getNumericValue(arg as Expression);
	});

	if (values.some((v) => v === null)) {
		return null;
	}

	const [x1, y1, x2, y2] = values as [number, number, number, number];
	return {type: 'bezier', x1, y1, x2, y2};
};

const getKeyframeEasingArray = ({
	easingNode,
	segments,
}: {
	easingNode: Expression;
	segments: number;
}): PropEasing | null => {
	if (segments === 0) {
		return [];
	}

	if (easingNode.type === 'TSAsExpression') {
		return getKeyframeEasingArray({
			easingNode: easingNode.expression as Expression,
			segments,
		});
	}

	if (easingNode.type === 'ArrayExpression') {
		if (easingNode.elements.length !== segments) {
			return null;
		}

		const parsed = easingNode.elements.map((element) => {
			if (!element || element.type === 'SpreadElement') {
				return null;
			}

			return getKeyframeEasing(element);
		});

		if (parsed.some((value) => value === null)) {
			return null;
		}

		return parsed as PropEasing;
	}

	const easing = getKeyframeEasing(easingNode);
	if (!easing) {
		return null;
	}

	return new Array(segments).fill(easing) as PropEasing;
};

const getInterpolationMetadata = (
	interpolationFunction: PropInterpolationFunction,
	callExpression: CallExpression,
	keyframeCount: number,
): {
	easing: PropEasing;
	clamping: PropClamping;
	posterize: PropPosterize;
} | null => {
	const segments = Math.max(0, keyframeCount - 1);
	const defaultClamping: PropClamping =
		interpolationFunction === 'interpolateColors'
			? {
					left: 'clamp',
					right: 'clamp',
				}
			: {
					left: 'extend',
					right: 'extend',
				};
	const defaults = {
		easing: Array.from({length: segments}, () => LINEAR_KEYFRAME_EASING),
		clamping: defaultClamping,
		posterize: undefined,
	};

	const optionsArg = callExpression.arguments[3];
	if (!optionsArg) {
		return defaults;
	}

	if (optionsArg.type !== 'ObjectExpression') {
		return null;
	}

	let {easing} = defaults;
	let {clamping}: {clamping: PropClamping} = defaults;
	let posterize: PropPosterize;

	for (const property of optionsArg.properties) {
		if (property.type !== 'ObjectProperty' || property.computed) {
			return null;
		}

		const key =
			property.key.type === 'Identifier'
				? property.key.name
				: property.key.type === 'StringLiteral'
					? property.key.value
					: null;

		if (!key) {
			return null;
		}

		const value = property.value as Expression;

		if (key === 'easing') {
			const parsedEasing = getKeyframeEasingArray({
				easingNode: value,
				segments,
			});
			if (!parsedEasing) {
				return null;
			}

			easing = parsedEasing;
			continue;
		}

		if (key === 'extrapolateLeft' || key === 'extrapolateRight') {
			if (interpolationFunction === 'interpolateColors') {
				return null;
			}

			const extrapolateType = getExtrapolateType(value);
			if (!extrapolateType) {
				return null;
			}

			clamping =
				key === 'extrapolateLeft'
					? {...clamping, left: extrapolateType}
					: {...clamping, right: extrapolateType};
			continue;
		}

		if (key === 'posterize') {
			const parsedPosterize = getNumericValue(value);
			if (
				parsedPosterize === null ||
				!Number.isFinite(parsedPosterize) ||
				parsedPosterize <= 0
			) {
				return null;
			}

			posterize = parsedPosterize;
			continue;
		}

		return null;
	}

	return {
		easing,
		clamping,
		posterize,
	};
};

const getInterpolationKeyframes = (
	node: Expression,
	ast: File,
):
	| {
			keyframes: PropKeyframes;
			easing: PropEasing;
			clamping: PropClamping;
			posterize: PropPosterize;
			interpolationFunction: PropInterpolationFunction;
	  }
	| undefined => {
	if (node.type === 'TSAsExpression') {
		return getInterpolationKeyframes(node.expression as Expression, ast);
	}

	if (
		node.type === 'CallExpression' &&
		node.callee.type === 'Identifier' &&
		node.callee.name === 'String' &&
		node.arguments.length === 1 &&
		node.arguments[0].type !== 'ArgumentPlaceholder' &&
		node.arguments[0].type !== 'JSXNamespacedName' &&
		node.arguments[0].type !== 'SpreadElement'
	) {
		const interpolation = getInterpolationKeyframes(
			node.arguments[0] as Expression,
			ast,
		);
		if (!interpolation) {
			return undefined;
		}

		return {
			...interpolation,
			keyframes: interpolation.keyframes.map((keyframe) => ({
				...keyframe,
				value: String(keyframe.value),
			})),
		};
	}

	if (node.type !== 'CallExpression') {
		return undefined;
	}

	const callExpression = node as CallExpression;
	if (
		callExpression.callee.type !== 'Identifier' ||
		!isKeyframeInterpolationFunction(callExpression.callee.name)
	) {
		return undefined;
	}

	const interpolationFunction = callExpression.callee.name;

	const frameArg = callExpression.arguments[0];
	const inputArg = callExpression.arguments[1];
	const outputArg = callExpression.arguments[2];
	if (
		!frameArg ||
		frameArg.type === 'SpreadElement' ||
		!isCurrentFrameIdentifier(frameArg as Expression, ast) ||
		!inputArg ||
		!outputArg ||
		inputArg.type !== 'ArrayExpression' ||
		outputArg.type !== 'ArrayExpression'
	) {
		return undefined;
	}

	if (inputArg.elements.length !== outputArg.elements.length) {
		return undefined;
	}

	const keyframes: PropKeyframes = [];
	for (let i = 0; i < inputArg.elements.length; i++) {
		const inputElement = inputArg.elements[i];
		const outputElement = outputArg.elements[i];
		if (
			!inputElement ||
			!outputElement ||
			inputElement.type === 'SpreadElement' ||
			outputElement.type === 'SpreadElement'
		) {
			return undefined;
		}

		const frame = getNumericValue(inputElement);
		if (frame === null || !isStaticValue(outputElement)) {
			return undefined;
		}

		keyframes.push({
			frame,
			value: extractStaticValue(outputElement),
		});
	}

	if (keyframes.length === 0) {
		return undefined;
	}

	const metadata = getInterpolationMetadata(
		interpolationFunction,
		callExpression,
		keyframes.length,
	);
	if (!metadata) {
		return undefined;
	}

	return {
		interpolationFunction,
		keyframes,
		easing: metadata.easing,
		clamping: metadata.clamping,
		posterize: metadata.posterize,
	};
};

const isUseCurrentFrameCall = (node: Expression): boolean => {
	return (
		node.type === 'CallExpression' &&
		node.callee.type === 'Identifier' &&
		node.callee.name === 'useCurrentFrame' &&
		node.arguments.length === 0
	);
};

const isCurrentFrameIdentifier = (node: Expression, ast: File): boolean => {
	if (node.type === 'TSAsExpression') {
		return isCurrentFrameIdentifier(node.expression as Expression, ast);
	}

	if (node.type !== 'Identifier') {
		return false;
	}

	let hasUseCurrentFrameDeclaration = false;
	let hasOtherDeclaration = false;

	recast.types.visit(ast, {
		visitVariableDeclarator(p) {
			const {id, init} = p.node;
			if (id.type !== 'Identifier' || id.name !== node.name) {
				return this.traverse(p);
			}

			if (init && isUseCurrentFrameCall(init as Expression)) {
				hasUseCurrentFrameDeclaration = true;
			} else {
				hasOtherDeclaration = true;
			}

			return false;
		},
	});

	return hasUseCurrentFrameDeclaration && !hasOtherDeclaration;
};

export const getComputedStatus = (
	node: Expression,
	ast: File,
): CanUpdatePropStatus => {
	const interpolation = getInterpolationKeyframes(node, ast);
	if (!interpolation) {
		return computedStatus();
	}

	return {
		status: 'keyframed',
		interpolationFunction: interpolation.interpolationFunction,
		keyframes: interpolation.keyframes,
		easing: interpolation.easing,
		clamping: interpolation.clamping,
		posterize: interpolation.posterize,
	};
};

const getPropsStatus = (
	jsxElement: JSXOpeningElement,
	ast: File,
): Record<string, CanUpdatePropStatus> => {
	const props: Record<string, CanUpdatePropStatus> = {};

	for (const attr of jsxElement.attributes) {
		if (attr.type === 'JSXSpreadAttribute') {
			continue;
		}

		if (attr.name.type === 'JSXNamespacedName') {
			continue;
		}

		const {name} = attr.name;
		if (typeof name !== 'string') {
			continue;
		}

		const {value} = attr as JSXAttribute;

		if (!value) {
			props[name] = staticStatus(true);
			continue;
		}

		if (value.type === 'StringLiteral') {
			props[name] = staticStatus((value as {value: string}).value);
			continue;
		}

		if (value.type === 'JSXExpressionContainer') {
			const {expression} = value;
			if (expression.type === 'JSXEmptyExpression') {
				props[name] = computedStatus();
				continue;
			}

			if (!isStaticValue(expression)) {
				props[name] = getComputedStatus(expression, ast);
				continue;
			}

			props[name] = staticStatus(extractStaticValue(expression));
			continue;
		}

		props[name] = computedStatus();
	}

	return props;
};

const getNodePathForRecastPath = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	recastPath: any,
	ast: File,
): SequenceNodePath => {
	const segments: Array<string | number> = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let current: any = recastPath;
	while (current && current.parentPath) {
		segments.unshift(current.name);
		current = current.parentPath;
	}

	// Recast paths start with "root" which doesn't correspond to a real AST property
	if (segments.length > 0 && segments[0] === 'root') {
		return toImportAgnosticNodePath({ast, nodePath: segments.slice(1)});
	}

	return toImportAgnosticNodePath({ast, nodePath: segments});
};

export const findJsxElementPathAtNodePath = (
	ast: File,
	nodePath: SequenceNodePath,
) => {
	const current = getAstNodePath(ast, nodePath);
	if (!current) {
		return null;
	}

	if (recast.types.namedTypes.JSXOpeningElement.check(current.value)) {
		return current;
	}

	return null;
};

export const findJsxElementAtNodePath = (
	ast: File,
	nodePath: SequenceNodePath,
): JSXOpeningElement | null => {
	const current = findJsxElementPathAtNodePath(ast, nodePath);
	return current ? (current.value as unknown as JSXOpeningElement) : null;
};

export const findJsxElementNodeAtNodePath = (
	ast: File,
	nodePath: SequenceNodePath,
): JSXElement | null => {
	const current = findJsxElementPathAtNodePath(ast, nodePath);
	if (!current) {
		return null;
	}

	if (recast.types.namedTypes.JSXElement.check(current.parentPath?.value)) {
		return current.parentPath.value as unknown as JSXElement;
	}

	return null;
};

export type StaticJsxTextContent =
	| {kind: 'jsx-text'; value: string}
	| {kind: 'string-expression'; value: string};

const findJsxChildrenAttribute = (
	jsxElement: JSXOpeningElement,
): JSXAttribute | null => {
	const childrenAttr = jsxElement.attributes.find((attr) => {
		return (
			attr.type === 'JSXAttribute' &&
			attr.name.type === 'JSXIdentifier' &&
			attr.name.name === 'children'
		);
	});

	return childrenAttr && childrenAttr.type === 'JSXAttribute'
		? childrenAttr
		: null;
};

export const getStaticJsxChildrenAttribute = (
	jsxElement: JSXOpeningElement,
): StaticJsxTextContent | null => {
	const childrenAttr = findJsxChildrenAttribute(jsxElement);
	if (!childrenAttr?.value) {
		return null;
	}

	if (childrenAttr.value.type === 'StringLiteral') {
		return {kind: 'jsx-text', value: childrenAttr.value.value};
	}

	if (
		childrenAttr.value.type === 'JSXExpressionContainer' &&
		childrenAttr.value.expression.type === 'StringLiteral'
	) {
		return {
			kind: 'string-expression',
			value: childrenAttr.value.expression.value,
		};
	}

	return null;
};

export const hasJsxChildrenAttribute = (
	jsxElement: JSXOpeningElement,
): boolean => findJsxChildrenAttribute(jsxElement) !== null;

export const getStaticJsxTextContent = (
	jsxElement: JSXElement,
): StaticJsxTextContent | null => {
	const meaningfulChildren = jsxElement.children.filter((candidate) => {
		return !(candidate.type === 'JSXText' && candidate.value.trim() === '');
	});

	if (meaningfulChildren.length === 0) {
		return {kind: 'jsx-text', value: ''};
	}

	if (meaningfulChildren.length !== 1) {
		return null;
	}

	const child = meaningfulChildren[0];
	if (child.type === 'JSXText') {
		return {
			kind: 'jsx-text',
			value: child.value.includes('\n') ? child.value.trim() : child.value,
		};
	}

	if (
		child.type === 'JSXExpressionContainer' &&
		child.expression.type === 'StringLiteral'
	) {
		return {kind: 'string-expression', value: child.expression.value};
	}

	return null;
};

export const findNodePathForJsxElement = (
	ast: File,
	target: JSXOpeningElement,
): SequenceNodePath | null => {
	let foundPath: SequenceNodePath | null = null;

	recast.types.visit(ast, {
		visitJSXOpeningElement(p) {
			if (p.node === target) {
				foundPath = getNodePathForRecastPath(p, ast);
				return false;
			}

			return this.traverse(p);
		},
	});

	return foundPath;
};

export const lineColumnToNodePath = (
	ast: File,
	targetLine: number,
): SequenceNodePath | null => {
	let foundPath: SequenceNodePath | null = null;

	recast.types.visit(ast, {
		visitJSXOpeningElement(p) {
			const {node} = p;
			if (node.loc && node.loc.start.line === targetLine) {
				foundPath = getNodePathForRecastPath(p, ast);
				return false;
			}

			return this.traverse(p);
		},
	});

	return foundPath;
};

const PIXEL_VALUE_REGEX = /^-?\d+(\.\d+)?px$/;

const isSupportedTranslateValue = (value: string): boolean => {
	const parts = value.split(/\s+/);
	if (parts.length === 1 || parts.length === 2) {
		return parts.every((part) => PIXEL_VALUE_REGEX.test(part));
	}

	return false;
};

const validateStyleValue = (childKey: string, value: unknown): boolean => {
	if (childKey === 'translate' && typeof value === 'string') {
		return isSupportedTranslateValue(value);
	}

	return true;
};

const getNestedPropStatus = (
	jsxElement: JSXOpeningElement,
	ast: File,
	parentKey: string,
	childKey: string,
): CanUpdatePropStatus => {
	const attr = jsxElement.attributes.find(
		(a) =>
			a.type !== 'JSXSpreadAttribute' &&
			a.name.type !== 'JSXNamespacedName' &&
			a.name.name === parentKey,
	) as JSXAttribute | undefined;

	if (!attr || !attr.value) {
		// Parent attribute doesn't exist, nested prop can be added
		return staticStatus(undefined);
	}

	if (attr.value.type !== 'JSXExpressionContainer') {
		return computedStatus();
	}

	const {expression} = attr.value;
	if (
		expression.type === 'JSXEmptyExpression' ||
		expression.type !== 'ObjectExpression'
	) {
		// Parent is not an object literal (e.g. style={myStyles})
		return computedStatus();
	}

	const objExpr = expression as ObjectExpression;
	const prop = objExpr.properties.find(
		(p) =>
			p.type === 'ObjectProperty' &&
			((p.key.type === 'Identifier' && p.key.name === childKey) ||
				(p.key.type === 'StringLiteral' && p.key.value === childKey)),
	) as ObjectProperty | undefined;

	if (!prop) {
		// Property not set in the object, can be added
		return staticStatus(undefined);
	}

	const propValue = prop.value as Expression;
	if (!isStaticValue(propValue)) {
		return getComputedStatus(propValue, ast);
	}

	const propStatus = extractStaticValue(propValue);
	if (!validateStyleValue(childKey, propStatus)) {
		return computedStatus();
	}

	return staticStatus(propStatus);
};

const computeEffectsForJsx = ({
	ast,
	jsxElement,
	effects,
}: {
	ast: File;
	jsxElement: JSXOpeningElement;
	effects: string[][];
}) => {
	return effects.map((effect, effectIndex) =>
		computeEffectPropStatus({
			ast,
			jsx: jsxElement,
			effectIndex,
			keys: effect,
		}),
	);
};

const computeSequenceOnlyPropsRecord = ({
	jsxElement,
	jsxElementNode,
	ast,
	keys,
}: {
	jsxElement: JSXOpeningElement;
	jsxElementNode: JSXElement;
	ast: File;
	keys: string[];
}): Record<string, CanUpdatePropStatus> => {
	const allProps = getPropsStatus(jsxElement, ast);
	const filteredProps: Record<string, CanUpdatePropStatus> = {};
	for (const key of keys) {
		if (key === 'children') {
			const staticChildrenAttribute = getStaticJsxChildrenAttribute(jsxElement);
			if (staticChildrenAttribute) {
				filteredProps[key] = staticStatus(staticChildrenAttribute.value);
				continue;
			}

			if (hasJsxChildrenAttribute(jsxElement)) {
				filteredProps[key] = computedStatus();
				continue;
			}

			const staticTextContent = getStaticJsxTextContent(jsxElementNode);
			filteredProps[key] = staticTextContent
				? staticStatus(staticTextContent.value)
				: computedStatus();
			continue;
		}

		const dotIndex = key.indexOf('.');
		if (dotIndex !== -1) {
			filteredProps[key] = getNestedPropStatus(
				jsxElement,
				ast,
				key.slice(0, dotIndex),
				key.slice(dotIndex + 1),
			);
		} else if (key in allProps) {
			filteredProps[key] = allProps[key];
		} else {
			filteredProps[key] = staticStatus(undefined);
		}
	}

	return filteredProps;
};

export const computeSequencePropsStatusFromContent = ({
	fileContents,
	nodePath,
	componentIdentity,
	keys,
	effects,
}: {
	fileContents: string;
	nodePath: SequenceNodePath;
	componentIdentity: JsxComponentIdentity | null;
	keys: string[];
	effects: string[][];
}): CanUpdateSequencePropsResponseTrue => {
	const ast = parseAst(fileContents);

	const jsxElementNode = findJsxElementNodeAtNodePath(ast, nodePath);
	const jsxElement = jsxElementNode?.openingElement ?? null;

	if (!jsxElement || !jsxElementNode) {
		throw new JsxElementNotFoundAtLocationError();
	}

	if (
		!jsxComponentIdentitiesMatch({
			expected: componentIdentity,
			actual: getJsxComponentIdentity({ast, jsxElement}),
		})
	) {
		throw new JsxElementIdentityMismatchError();
	}

	const filteredProps = computeSequenceOnlyPropsRecord({
		jsxElement,
		jsxElementNode,
		ast,
		keys,
	});
	const effectsStatuses = computeEffectsForJsx({ast, jsxElement, effects});

	return {
		canUpdate: true as const,
		props: filteredProps,
		effects: effectsStatuses,
	};
};

export const computeSequencePropsStatus = ({
	fileName,
	nodePath,
	componentIdentity,
	keys,
	effects,
	remotionRoot,
}: {
	fileName: string;
	nodePath: SequenceNodePath;
	componentIdentity: JsxComponentIdentity | null;
	keys: string[];
	effects: string[][];
	remotionRoot: string;
}): CanUpdateSequencePropsResponseTrue => {
	const {absolutePath} = resolveFileInsideProject({
		remotionRoot,
		fileName,
		action: 'read',
	});

	const fileContents = readFileSync(absolutePath, 'utf-8');
	return computeSequencePropsStatusFromContent({
		fileContents,
		nodePath,
		componentIdentity,
		keys,
		effects,
	});
};

export const computeSequencePropsStatusFromFilenameByLine = ({
	fileName,
	line,
	componentIdentity,
	keys,
	effects,
	remotionRoot,
	logLevel,
}: {
	fileName: string;
	line: number;
	componentIdentity: JsxComponentIdentity | null;
	keys: string[];
	effects: string[][];
	remotionRoot: string;
	logLevel: LogLevel;
}): SubscribeToSequencePropsResponse => {
	try {
		const {absolutePath} = resolveFileInsideProject({
			remotionRoot,
			fileName,
			action: 'read',
		});

		const fileContents = readFileSync(absolutePath, 'utf-8');
		const ast = parseAst(fileContents);

		const resolvedNodePath = lineColumnToNodePath(ast, line);
		if (!resolvedNodePath) {
			return {
				status: {
					canUpdate: false,
					reason: 'not-found',
				},
				success: false,
			};
		}

		return {
			status: computeSequencePropsStatus({
				fileName,
				nodePath: resolvedNodePath,
				componentIdentity,
				keys,
				effects,
				remotionRoot,
			}),
			nodePath: {
				absolutePath,
				nodePath: resolvedNodePath,
				sequenceKeys: keys,
				effectKeys: effects,
			},
			success: true,
		};
	} catch (err) {
		RenderInternals.Log.error({indent: false, logLevel}, err);
		return {
			status: {
				canUpdate: false as const,
				reason: 'error',
			},
			success: false,
		};
	}
};
