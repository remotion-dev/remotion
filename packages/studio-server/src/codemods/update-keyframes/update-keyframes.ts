import type {
	CallExpression,
	Expression,
	JSXAttribute,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
	JSXSpreadAttribute,
	ObjectExpression,
	ObjectProperty,
	StringLiteral,
} from '@babel/types';
import {
	getKeyframeInterpolationFunction,
	getKeyframeInterpolationFunctionForSchemaField,
	isKeyframeInterpolationFunction,
	isSchemaFieldKeyframable,
	LINEAR_KEYFRAME_EASING,
	type KeyframeInterpolationFunction,
} from '@remotion/studio-shared';
import type {ExpressionKind, SpreadElementKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {
	CanUpdateSequencePropStatus,
	ExtrapolateType,
	InteractivitySchema,
	InteractivitySchemaField,
	InterpolateOutputOption,
	SequenceNodePath,
	VideoConfigNumericExpression,
	VideoConfigValues,
} from 'remotion';
import {getAstNodePath} from '../../helpers/get-ast-node-path';
import {parseKeyframeEasingExpression} from '../../helpers/parse-keyframe-easing-expression';
import {
	parseVideoConfigNumericExpression,
	updateVideoConfigNumericExpression,
} from '../../helpers/video-config-numeric-expression';
import {
	getVideoConfigIdentifierValues,
	type VideoConfigIdentifierValues,
} from '../../helpers/video-config-values';
import {
	extractStaticValue,
	findJsxElementAtNodePath,
	findNodePathForJsxElement,
	isStaticValue,
} from '../../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from '../format-file-content';
import {parseAst, serializeAst} from '../parse-ast';
import {
	findEffectCallExpression,
	findEffectsAttr,
} from '../update-effect-props/update-effect-props';
import {parseValueExpression} from '../update-nested-prop';
import {
	ensureRemotionImports,
	ensureUseCurrentFrameHook,
	findEnclosingFunctionPath,
} from './ensure-imports-and-frame-hook';

const b = recast.types.builders;

const getObjectPropertyNameFromUpdateKey = (key: string): string => {
	const dotIndex = key.indexOf('.');
	return dotIndex === -1 ? key : key.slice(dotIndex + 1);
};

const lineStartsWithPropertyName = ({
	line,
	propertyName,
}: {
	line: string;
	propertyName: string;
}) => {
	const trimmed = line.trimStart();
	return (
		trimmed.startsWith(`${propertyName}:`) ||
		trimmed.startsWith(`'${propertyName}':`) ||
		trimmed.startsWith(`"${propertyName}":`)
	);
};

const getIndent = (line: string) => line.match(/^[ \t]*/)?.[0] ?? '';

const removeBlankLinesFromObjectsWithProperties = ({
	input,
	propertyNames,
}: {
	input: string;
	propertyNames: string[];
}) => {
	if (propertyNames.length === 0) {
		return input;
	}

	const lines = input.split('\n');
	const linesToRemove = new Set<number>();

	for (let i = 0; i < lines.length; i++) {
		const propertyName = propertyNames.find((name) =>
			lineStartsWithPropertyName({line: lines[i], propertyName: name}),
		);
		if (!propertyName) {
			continue;
		}

		const propertyIndentLength = getIndent(lines[i]).length;
		let objectStart = i;
		for (let j = i - 1; j >= 0; j--) {
			const trimmed = lines[j].trim();
			if (
				trimmed.endsWith('{') &&
				getIndent(lines[j]).length < propertyIndentLength
			) {
				objectStart = j;
				break;
			}
		}

		let objectEnd = i;
		for (let j = i + 1; j < lines.length; j++) {
			const trimmed = lines[j].trim();
			if (
				trimmed.startsWith('}') &&
				getIndent(lines[j]).length < propertyIndentLength
			) {
				objectEnd = j;
				break;
			}
		}

		for (let j = objectStart + 1; j < objectEnd; j++) {
			if (lines[j].trim() === '') {
				linesToRemove.add(j);
			}
		}
	}

	if (linesToRemove.size === 0) {
		return input;
	}

	return lines.filter((_, index) => !linesToRemove.has(index)).join('\n');
};

type KeyframeEasing = Extract<
	CanUpdateSequencePropStatus,
	{status: 'keyframed'}
>['easing'][number];

export type KeyframeOperation =
	| {
			type: 'add';
			frame: number;
			value: unknown;
	  }
	| {
			type: 'remove';
			frame: number;
	  }
	| {
			type: 'settings';
			clamping:
				| {
						left: ExtrapolateType;
						right: ExtrapolateType;
				  }
				| undefined;
			posterize: number | undefined;
			output: InterpolateOutputOption | undefined;
	  }
	| {
			type: 'easing';
			segmentIndex: number;
			easing: KeyframeEasing;
	  }
	| {
			type: 'move';
			moves: {
				fromFrame: number;
				toFrame: number;
			}[];
	  };

export type SequenceKeyframeUpdate = {
	key: string;
	operation: KeyframeOperation;
};

export type EffectKeyframeUpdate = {
	key: string;
	operation: KeyframeOperation;
};

type WritableProp = {
	expression: Expression;
	setExpression: (expression: ExpressionKind) => void;
	remove: () => void;
};

type MissingPropInitialValue = {
	value: unknown;
};

type InterpolateKeyframe = {
	frame: number;
	frameExpression: ExpressionKind;
	frameNumericExpression: VideoConfigNumericExpression;
	originalFrame: number;
	output: ExpressionKind;
	value: unknown;
};

type InterpolateExpression = {
	callee: ExpressionKind;
	input: ExpressionKind | SpreadElementKind;
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	keyframes: InterpolateKeyframe[];
};

const getSupportedCallArgument = (
	arg: CallExpression['arguments'][number] | undefined,
): ExpressionKind | SpreadElementKind | null => {
	if (
		arg === undefined ||
		arg.type === 'ArgumentPlaceholder' ||
		arg.type === 'JSXNamespacedName'
	) {
		return null;
	}

	return arg as unknown as ExpressionKind | SpreadElementKind;
};

const getInterpolationExpression = (
	node: Expression,
	videoConfigValues: VideoConfigIdentifierValues,
): InterpolateExpression | null => {
	if (node.type === 'TSAsExpression') {
		return getInterpolationExpression(
			node.expression as Expression,
			videoConfigValues,
		);
	}

	if (
		node.type !== 'CallExpression' ||
		node.callee.type !== 'Identifier' ||
		!isKeyframeInterpolationFunction(node.callee.name)
	) {
		return null;
	}

	const frameArg = getSupportedCallArgument(node.arguments[0]);
	const inputArg = node.arguments[1];
	const outputArg = node.arguments[2];
	if (
		!frameArg ||
		!inputArg ||
		!outputArg ||
		inputArg.type !== 'ArrayExpression' ||
		outputArg.type !== 'ArrayExpression' ||
		inputArg.elements.length !== outputArg.elements.length
	) {
		return null;
	}

	const keyframes: InterpolateKeyframe[] = [];
	for (let i = 0; i < inputArg.elements.length; i++) {
		const inputElement = inputArg.elements[i];
		const outputElement = outputArg.elements[i];
		if (
			!inputElement ||
			!outputElement ||
			inputElement.type === 'SpreadElement' ||
			outputElement.type === 'SpreadElement'
		) {
			return null;
		}

		const frameExpression = parseVideoConfigNumericExpression({
			node: inputElement,
			videoConfigValues,
		});
		if (frameExpression === null || !isStaticValue(outputElement)) {
			return null;
		}

		keyframes.push({
			frame: frameExpression.value,
			frameExpression: inputElement as ExpressionKind,
			frameNumericExpression: frameExpression,
			originalFrame: frameExpression.value,
			output: outputElement as ExpressionKind,
			value: extractStaticValue(outputElement),
		});
	}

	if (keyframes.length === 0) {
		return null;
	}

	const extraArgs: (ExpressionKind | SpreadElementKind)[] = [];
	for (const arg of node.arguments.slice(3)) {
		const supportedArg = getSupportedCallArgument(arg);
		if (!supportedArg) {
			return null;
		}

		extraArgs.push(supportedArg);
	}

	return {
		callee: node.callee as unknown as ExpressionKind,
		input: frameArg,
		extraArgs,
		keyframes,
	};
};

const getInterpolationCalleeForValues = ({
	schema,
	key,
	staticValue,
	newValue,
}: {
	schema: InteractivitySchema | null;
	key: string;
	staticValue: unknown;
	newValue: unknown;
}): ExpressionKind => {
	return b.identifier(
		getKeyframeInterpolationFunction({
			schema,
			key,
			staticValue,
			newValue,
		}),
	);
};

const createFrameExpression = (frame: number): ExpressionKind => {
	return parseValueExpression(frame);
};

const createClampOptionsExpression = ({
	defaultOutput,
}: {
	defaultOutput: InterpolateOutputOption | null;
}): ExpressionKind => {
	const properties = [
		b.objectProperty(b.identifier('extrapolateLeft'), b.stringLiteral('clamp')),
		b.objectProperty(
			b.identifier('extrapolateRight'),
			b.stringLiteral('clamp'),
		),
	];

	if (defaultOutput !== null && defaultOutput !== 'linear') {
		properties.push(
			b.objectProperty(b.identifier('output'), b.stringLiteral(defaultOutput)),
		);
	}

	return b.objectExpression(properties) as ExpressionKind;
};

const createEmptyOptionsExpression = (): ObjectExpression =>
	b.objectExpression([]) as ObjectExpression;

const findObjectOptionProperty = (
	options: ObjectExpression,
	propertyName: string,
): {propIndex: number; prop: ObjectProperty | undefined} => {
	const propIndex = options.properties.findIndex(
		(prop) =>
			prop.type === 'ObjectProperty' &&
			!prop.computed &&
			((prop.key.type === 'Identifier' && prop.key.name === propertyName) ||
				(prop.key.type === 'StringLiteral' && prop.key.value === propertyName)),
	);

	return {
		propIndex,
		prop:
			propIndex === -1
				? undefined
				: (options.properties[propIndex] as ObjectProperty),
	};
};

const setOptionsProperty = ({
	options,
	propertyName,
	value,
}: {
	options: ObjectExpression;
	propertyName: string;
	value: ExpressionKind | null;
}) => {
	const {propIndex, prop} = findObjectOptionProperty(options, propertyName);
	if (value === null) {
		if (propIndex !== -1) {
			options.properties.splice(propIndex, 1);
		}

		return;
	}

	if (prop) {
		prop.value = value as ObjectProperty['value'];
		return;
	}

	options.properties.push(
		b.objectProperty(b.identifier(propertyName), value) as ObjectProperty,
	);
};

const isLinearEasing = (easing: KeyframeEasing) => easing.type === 'linear';

const getKeyframeEasing = (node: Expression): KeyframeEasing | null =>
	parseKeyframeEasingExpression(node);

const getKeyframeEasingArray = ({
	easingNode,
	segmentCount,
}: {
	easingNode: Expression;
	segmentCount: number;
}): KeyframeEasing[] | null => {
	if (segmentCount === 0) {
		return [];
	}

	if (easingNode.type === 'TSAsExpression') {
		return getKeyframeEasingArray({
			easingNode: easingNode.expression as Expression,
			segmentCount,
		});
	}

	if (easingNode.type === 'ArrayExpression') {
		if (easingNode.elements.length > segmentCount) {
			return null;
		}

		const parsed = easingNode.elements.map((element) => {
			if (!element || element.type === 'SpreadElement') {
				return null;
			}

			return getKeyframeEasing(element as Expression);
		});

		if (parsed.some((value) => value === null)) {
			return null;
		}

		const easingArray = parsed as KeyframeEasing[];
		while (easingArray.length < segmentCount) {
			easingArray.push(LINEAR_KEYFRAME_EASING);
		}

		return easingArray;
	}

	const easing = getKeyframeEasing(easingNode);
	if (!easing) {
		return null;
	}

	return new Array(segmentCount).fill(easing);
};

const getExistingEasingArray = ({
	options,
	segmentCount,
}: {
	options: ObjectExpression;
	segmentCount: number;
}): KeyframeEasing[] => {
	const {prop} = findObjectOptionProperty(options, 'easing');
	if (!prop) {
		return Array.from({length: segmentCount}, () => ({type: 'linear'}));
	}

	const easing = getKeyframeEasingArray({
		easingNode: prop.value as Expression,
		segmentCount,
	});
	if (!easing) {
		throw new Error('Cannot update easing: easing must be inline');
	}

	return easing;
};

const getExistingEasingArrayOrNull = ({
	options,
	segmentCount,
}: {
	options: ObjectExpression;
	segmentCount: number;
}): KeyframeEasing[] | null => {
	const {prop} = findObjectOptionProperty(options, 'easing');
	if (!prop) {
		return null;
	}

	return getExistingEasingArray({options, segmentCount});
};

const createEasingExpression = (easing: KeyframeEasing): ExpressionKind => {
	switch (easing.type) {
		case 'linear':
			return b.memberExpression(
				b.identifier('Easing'),
				b.identifier('linear'),
			) as ExpressionKind;
		case 'spring':
			return b.callExpression(
				b.memberExpression(b.identifier('Easing'), b.identifier('spring')),
				[
					b.objectExpression([
						b.objectProperty(
							b.identifier('damping'),
							parseValueExpression(easing.damping),
						),
						b.objectProperty(
							b.identifier('mass'),
							parseValueExpression(easing.mass),
						),
						b.objectProperty(
							b.identifier('stiffness'),
							parseValueExpression(easing.stiffness),
						),
						...(easing.allowTail === null
							? []
							: [
									b.objectProperty(
										b.identifier('allowTail'),
										b.booleanLiteral(easing.allowTail),
									),
								]),
						...(easing.durationRestThreshold === null
							? []
							: [
									b.objectProperty(
										b.identifier('durationRestThreshold'),
										parseValueExpression(easing.durationRestThreshold),
									),
								]),
						b.objectProperty(
							b.identifier('overshootClamping'),
							b.booleanLiteral(easing.overshootClamping),
						),
					]),
				] as never,
			) as ExpressionKind;
		case 'bezier':
			return b.callExpression(
				b.memberExpression(b.identifier('Easing'), b.identifier('bezier')),
				[easing.x1, easing.y1, easing.x2, easing.y2].map((value) =>
					parseValueExpression(value),
				) as never,
			) as ExpressionKind;
		default:
			throw new Error(
				`Unsupported easing: ${JSON.stringify(easing satisfies never)}`,
			);
	}
};

const createEasingArrayExpression = (
	easing: KeyframeEasing[],
): ExpressionKind =>
	b.arrayExpression(
		easing.map((easingValue) => createEasingExpression(easingValue)) as never,
	) as ExpressionKind;

const setEasingOption = ({
	options,
	easing,
}: {
	options: ObjectExpression;
	easing: KeyframeEasing[];
}): boolean => {
	const hasNonLinearEasing = easing.some(
		(easingValue) => !isLinearEasing(easingValue),
	);
	setOptionsProperty({
		options,
		propertyName: 'easing',
		value: hasNonLinearEasing ? createEasingArrayExpression(easing) : null,
	});
	return hasNonLinearEasing;
};

const getExtraArgsWithOptions = ({
	extraArgs,
	options,
}: {
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	options: ObjectExpression;
}): (ExpressionKind | SpreadElementKind)[] => {
	return options.properties.length === 0
		? extraArgs.slice(1)
		: [options as ExpressionKind, ...extraArgs.slice(1)];
};

const getInlineOptionsFromExtraArgs = (
	extraArgs: (ExpressionKind | SpreadElementKind)[],
): ObjectExpression | null => {
	const existingOptions = extraArgs[0];
	if (!existingOptions || existingOptions.type !== 'ObjectExpression') {
		return null;
	}

	return existingOptions as ObjectExpression;
};

const normalizeEasingAfterAddingKeyframe = ({
	extraArgs,
	previousSegmentCount,
	nextSegmentCount,
	insertedKeyframeIndex,
	nextKeyframeCount,
}: {
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	previousSegmentCount: number;
	nextSegmentCount: number;
	insertedKeyframeIndex: number;
	nextKeyframeCount: number;
}): {
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	needsEasingImport: boolean;
} => {
	const options = getInlineOptionsFromExtraArgs(extraArgs);
	if (!options) {
		return {extraArgs, needsEasingImport: false};
	}

	const easing = getExistingEasingArrayOrNull({
		options,
		segmentCount: previousSegmentCount,
	});
	if (easing === null) {
		return {extraArgs, needsEasingImport: false};
	}

	if (easing.length < nextSegmentCount) {
		const isSplittingExistingSegment =
			insertedKeyframeIndex > 0 &&
			insertedKeyframeIndex < nextKeyframeCount - 1;
		const easingIndexToDuplicate =
			isSplittingExistingSegment && easing.length > 0
				? Math.min(insertedKeyframeIndex - 1, easing.length - 1)
				: null;
		easing.splice(
			insertedKeyframeIndex,
			0,
			easingIndexToDuplicate === null
				? LINEAR_KEYFRAME_EASING
				: easing[easingIndexToDuplicate],
		);
	}

	while (easing.length < nextSegmentCount) {
		easing.push(LINEAR_KEYFRAME_EASING);
	}

	return {
		extraArgs: getExtraArgsWithOptions({extraArgs, options}),
		needsEasingImport: setEasingOption({options, easing}),
	};
};

const getEasingIndexToRemove = ({
	removedKeyframeIndex,
	keyframeCountBeforeRemoval,
}: {
	removedKeyframeIndex: number;
	keyframeCountBeforeRemoval: number;
}) => {
	if (removedKeyframeIndex === 0) {
		return 0;
	}

	if (removedKeyframeIndex === keyframeCountBeforeRemoval - 1) {
		return removedKeyframeIndex - 1;
	}

	return removedKeyframeIndex;
};

const normalizeEasingAfterRemovingKeyframe = ({
	extraArgs,
	previousSegmentCount,
	nextSegmentCount,
	removedKeyframeIndex,
}: {
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	previousSegmentCount: number;
	nextSegmentCount: number;
	removedKeyframeIndex: number;
}): {
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	needsEasingImport: boolean;
} => {
	const options = getInlineOptionsFromExtraArgs(extraArgs);
	if (!options) {
		return {extraArgs, needsEasingImport: false};
	}

	const easing = getExistingEasingArrayOrNull({
		options,
		segmentCount: previousSegmentCount,
	});
	if (easing === null) {
		return {extraArgs, needsEasingImport: false};
	}

	if (easing.length > 0) {
		const easingIndexToRemove = getEasingIndexToRemove({
			removedKeyframeIndex,
			keyframeCountBeforeRemoval: previousSegmentCount + 1,
		});
		easing.splice(easingIndexToRemove, 1);
	}

	while (easing.length > nextSegmentCount) {
		easing.pop();
	}

	while (easing.length < nextSegmentCount) {
		easing.push(LINEAR_KEYFRAME_EASING);
	}

	return {
		extraArgs: getExtraArgsWithOptions({extraArgs, options}),
		needsEasingImport: setEasingOption({options, easing}),
	};
};

const normalizeEasingAfterRemovingKeyframes = ({
	extraArgs,
	previousSegmentCount,
	nextSegmentCount,
	removedKeyframeIndexes,
}: {
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	previousSegmentCount: number;
	nextSegmentCount: number;
	removedKeyframeIndexes: number[];
}): {
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	needsEasingImport: boolean;
} => {
	const options = getInlineOptionsFromExtraArgs(extraArgs);
	if (!options) {
		return {extraArgs, needsEasingImport: false};
	}

	const easing = getExistingEasingArrayOrNull({
		options,
		segmentCount: previousSegmentCount,
	});
	if (easing === null) {
		return {extraArgs, needsEasingImport: false};
	}

	for (const {removedKeyframeIndex, keyframeCountBeforeRemoval} of [
		...removedKeyframeIndexes,
	]
		.sort((first, second) => second - first)
		.map((keyframeIndex, index) => ({
			removedKeyframeIndex: keyframeIndex,
			keyframeCountBeforeRemoval: previousSegmentCount + 1 - index,
		}))) {
		if (easing.length === 0) {
			break;
		}

		const easingIndexToRemove = getEasingIndexToRemove({
			removedKeyframeIndex,
			keyframeCountBeforeRemoval,
		});
		easing.splice(easingIndexToRemove, 1);
	}

	while (easing.length > nextSegmentCount) {
		easing.pop();
	}

	while (easing.length < nextSegmentCount) {
		easing.push(LINEAR_KEYFRAME_EASING);
	}

	return {
		extraArgs: getExtraArgsWithOptions({extraArgs, options}),
		needsEasingImport: setEasingOption({options, easing}),
	};
};

const validatePosterize = (posterize: number | undefined) => {
	if (posterize === undefined) {
		return;
	}

	if (!Number.isFinite(posterize) || posterize <= 0) {
		throw new Error('Cannot update keyframe settings: posterize must be > 0');
	}
};

const validateOutput = (output: InterpolateOutputOption | undefined) => {
	if (
		output === undefined ||
		output === 'linear' ||
		output === 'perceptual-scale'
	) {
		return;
	}

	throw new Error(
		'Cannot update keyframe settings: output must be "linear" or "perceptual-scale"',
	);
};

const updateKeyframeSettings = ({
	expression,
	clamping,
	posterize,
	output,
	videoConfigValues,
}: {
	expression: Expression;
	clamping:
		| {
				left: ExtrapolateType;
				right: ExtrapolateType;
		  }
		| undefined;
	posterize: number | undefined;
	output: InterpolateOutputOption | undefined;
	videoConfigValues: VideoConfigIdentifierValues;
}): ExpressionKind => {
	validatePosterize(posterize);
	validateOutput(output);

	const existing = getInterpolationExpression(expression, videoConfigValues);
	if (!existing) {
		throw new Error('Cannot update keyframe settings on non-keyframed value');
	}

	const calleeName =
		existing.callee.type === 'Identifier' ? existing.callee.name : null;
	const isColorInterpolation = calleeName === 'interpolateColors';
	const extraArgs = [...existing.extraArgs];
	const existingOptions = extraArgs[0];
	if (existingOptions && existingOptions.type !== 'ObjectExpression') {
		throw new Error('Cannot update keyframe settings: options must be inline');
	}

	const options =
		existingOptions?.type === 'ObjectExpression'
			? (existingOptions as ObjectExpression)
			: createEmptyOptionsExpression();

	if (isColorInterpolation) {
		setOptionsProperty({options, propertyName: 'extrapolateLeft', value: null});
		setOptionsProperty({
			options,
			propertyName: 'extrapolateRight',
			value: null,
		});
		setOptionsProperty({options, propertyName: 'output', value: null});
	} else if (clamping) {
		setOptionsProperty({
			options,
			propertyName: 'extrapolateLeft',
			value: b.stringLiteral(clamping.left),
		});
		setOptionsProperty({
			options,
			propertyName: 'extrapolateRight',
			value: b.stringLiteral(clamping.right),
		});
	}

	if (!isColorInterpolation && output !== undefined) {
		setOptionsProperty({
			options,
			propertyName: 'output',
			value: output === 'linear' ? null : b.stringLiteral(output),
		});
	}

	setOptionsProperty({
		options,
		propertyName: 'posterize',
		value: posterize === undefined ? null : b.numericLiteral(posterize),
	});

	const nextExtraArgs =
		options.properties.length === 0
			? extraArgs.slice(1)
			: [options as ExpressionKind, ...extraArgs.slice(1)];

	return createInterpolateExpression({
		callee: existing.callee,
		input: existing.input,
		extraArgs: nextExtraArgs,
		keyframes: existing.keyframes,
	});
};

const updateKeyframeEasing = ({
	expression,
	segmentIndex,
	easing,
	videoConfigValues,
}: {
	expression: Expression;
	segmentIndex: number;
	easing: KeyframeEasing;
	videoConfigValues: VideoConfigIdentifierValues;
}): {expression: ExpressionKind; needsEasingImport: boolean} => {
	const existing = getInterpolationExpression(expression, videoConfigValues);
	if (!existing) {
		throw new Error('Cannot update easing on non-keyframed value');
	}

	const segmentCount = Math.max(0, existing.keyframes.length - 1);
	if (
		!Number.isInteger(segmentIndex) ||
		segmentIndex < 0 ||
		segmentIndex >= segmentCount
	) {
		throw new Error('Cannot update easing: segment index out of range');
	}

	const extraArgs = [...existing.extraArgs];
	const existingOptions = extraArgs[0];
	if (existingOptions && existingOptions.type !== 'ObjectExpression') {
		throw new Error('Cannot update easing: options must be inline');
	}

	const options =
		existingOptions?.type === 'ObjectExpression'
			? (existingOptions as ObjectExpression)
			: createEmptyOptionsExpression();
	const nextEasing = getExistingEasingArray({options, segmentCount});
	nextEasing[segmentIndex] = easing;
	const hasNonLinearEasing = nextEasing.some(
		(easingValue) => !isLinearEasing(easingValue),
	);

	setOptionsProperty({
		options,
		propertyName: 'easing',
		value: hasNonLinearEasing ? createEasingArrayExpression(nextEasing) : null,
	});

	const nextExtraArgs =
		options.properties.length === 0
			? extraArgs.slice(1)
			: [options as ExpressionKind, ...extraArgs.slice(1)];

	return {
		expression: createInterpolateExpression({
			callee: existing.callee,
			input: existing.input,
			extraArgs: nextExtraArgs,
			keyframes: existing.keyframes,
		}),
		needsEasingImport: hasNonLinearEasing,
	};
};

const createInterpolateExpression = ({
	callee,
	input,
	extraArgs,
	keyframes,
}: {
	callee: ExpressionKind;
	input: ExpressionKind | SpreadElementKind;
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	keyframes: InterpolateKeyframe[];
}): ExpressionKind => {
	const sortedKeyframes = [...keyframes].sort(
		(first, second) => first.frame - second.frame,
	);
	return b.callExpression(callee, [
		input,
		b.arrayExpression(
			sortedKeyframes.map((keyframe) =>
				keyframe.frame === keyframe.originalFrame
					? keyframe.frameExpression
					: updateVideoConfigNumericExpression({
							expression: keyframe.frameNumericExpression,
							value: keyframe.frame,
						}),
			),
		),
		b.arrayExpression(sortedKeyframes.map((keyframe) => keyframe.output)),
		...extraArgs,
	]) as ExpressionKind;
};

export type IntroducedKeyframeIdentifiers = {
	calleeName: KeyframeInterpolationFunction | null;
	needsFrameHook: boolean;
	needsEasingImport: boolean;
};

const noIntroducedIdentifiers: IntroducedKeyframeIdentifiers = {
	calleeName: null,
	needsFrameHook: false,
	needsEasingImport: false,
};

const addKeyframe = ({
	expression,
	key,
	frame,
	value,
	schema,
	videoConfigValues,
}: {
	expression: Expression;
	key: string;
	frame: number;
	value: unknown;
	schema: InteractivitySchema | null;
	videoConfigValues: VideoConfigIdentifierValues;
}): {expression: ExpressionKind; introduced: IntroducedKeyframeIdentifiers} => {
	if (!isSchemaFieldKeyframable({schema, key})) {
		throw new Error(`Cannot add keyframe: "${key}" is not keyframable`);
	}

	const existing = getInterpolationExpression(expression, videoConfigValues);
	const newOutput = parseValueExpression(value);

	if (existing) {
		const existingCalleeName =
			existing.callee.type === 'Identifier'
				? (existing.callee.name as KeyframeInterpolationFunction)
				: 'interpolate';
		const schemaCalleeName = getKeyframeInterpolationFunctionForSchemaField({
			schema,
			key,
		});
		const nextCalleeName = schemaCalleeName ?? existingCalleeName;
		const existingIndex = existing.keyframes.findIndex(
			(keyframe) => keyframe.frame === frame,
		);
		const nextKeyframes: InterpolateKeyframe[] =
			existingIndex === -1
				? [
						...existing.keyframes,
						{
							frame,
							frameExpression: createFrameExpression(frame),
							frameNumericExpression: {type: 'literal', value: frame},
							originalFrame: frame,
							output: newOutput,
							value,
						},
					]
				: existing.keyframes.map((keyframe, index) =>
						index === existingIndex
							? {...keyframe, output: newOutput, value}
							: keyframe,
					);
		const normalizedEasing =
			existingIndex === -1
				? normalizeEasingAfterAddingKeyframe({
						extraArgs: existing.extraArgs,
						previousSegmentCount: Math.max(existing.keyframes.length - 1, 0),
						nextSegmentCount: Math.max(nextKeyframes.length - 1, 0),
						insertedKeyframeIndex: [...nextKeyframes]
							.sort((first, second) => first.frame - second.frame)
							.findIndex((keyframe) => keyframe.frame === frame),
						nextKeyframeCount: nextKeyframes.length,
					})
				: {extraArgs: existing.extraArgs, needsEasingImport: false};

		return {
			expression: createInterpolateExpression({
				callee: b.identifier(nextCalleeName),
				input: existing.input,
				extraArgs: normalizedEasing.extraArgs,
				keyframes: nextKeyframes,
			}),
			introduced: {
				calleeName:
					schemaCalleeName && schemaCalleeName !== existingCalleeName
						? schemaCalleeName
						: null,
				needsFrameHook: false,
				needsEasingImport: normalizedEasing.needsEasingImport,
			},
		};
	}

	const staticNumericExpression = parseVideoConfigNumericExpression({
		node: expression,
		videoConfigValues,
	});
	if (!isStaticValue(expression) && staticNumericExpression === null) {
		throw new Error('Cannot add keyframe to computed expression');
	}

	const staticValue =
		staticNumericExpression?.value ?? extractStaticValue(expression);
	const keyframes: InterpolateKeyframe[] = [
		{
			frame,
			frameExpression: createFrameExpression(frame),
			frameNumericExpression: {type: 'literal', value: frame},
			originalFrame: frame,
			output: newOutput,
			value,
		},
	];

	const callee = getInterpolationCalleeForValues({
		schema,
		key,
		staticValue,
		newValue: value,
	});
	const extraArgs =
		callee.type === 'Identifier' && callee.name === 'interpolateColors'
			? []
			: [
					createClampOptionsExpression({
						defaultOutput: getDefaultKeyframeOutput({schema, key}),
					}),
				];

	return {
		expression: createInterpolateExpression({
			callee,
			input: b.identifier('frame'),
			extraArgs,
			keyframes,
		}),
		introduced: {
			calleeName:
				callee.type === 'Identifier'
					? (callee.name as KeyframeInterpolationFunction)
					: null,
			needsFrameHook: true,
			needsEasingImport: false,
		},
	};
};

const removeKeyframe = ({
	expression,
	frame,
	videoConfigValues,
}: {
	expression: Expression;
	frame: number;
	videoConfigValues: VideoConfigIdentifierValues;
}): {expression: ExpressionKind; introduced: IntroducedKeyframeIdentifiers} => {
	const existing = getInterpolationExpression(expression, videoConfigValues);
	if (!existing) {
		throw new Error('Cannot remove keyframe from non-interpolated expression');
	}

	const keyframeIndex = existing.keyframes.findIndex(
		(keyframe) => keyframe.frame === frame,
	);
	if (keyframeIndex === -1) {
		throw new Error(`Cannot remove keyframe at frame ${frame}: not found`);
	}

	const nextKeyframes = existing.keyframes.filter(
		(_keyframe, index) => index !== keyframeIndex,
	);

	if (nextKeyframes.length === 0) {
		return {
			expression: existing.keyframes[keyframeIndex].output,
			introduced: noIntroducedIdentifiers,
		};
	}

	const normalizedEasing = normalizeEasingAfterRemovingKeyframe({
		extraArgs: existing.extraArgs,
		previousSegmentCount: Math.max(existing.keyframes.length - 1, 0),
		nextSegmentCount: Math.max(nextKeyframes.length - 1, 0),
		removedKeyframeIndex: keyframeIndex,
	});

	return {
		expression: createInterpolateExpression({
			callee: existing.callee,
			input: existing.input,
			extraArgs: normalizedEasing.extraArgs,
			keyframes: nextKeyframes,
		}),
		introduced: {
			...noIntroducedIdentifiers,
			needsEasingImport: normalizedEasing.needsEasingImport,
		},
	};
};

const moveKeyframes = ({
	expression,
	moves,
	videoConfigValues,
}: {
	expression: Expression;
	moves: {
		fromFrame: number;
		toFrame: number;
	}[];
	videoConfigValues: VideoConfigIdentifierValues;
}): ExpressionKind => {
	const existing = getInterpolationExpression(expression, videoConfigValues);
	if (!existing) {
		throw new Error('Cannot move keyframe in non-interpolated expression');
	}

	const moveMap = new Map<number, number>();
	for (const move of moves) {
		if (move.fromFrame === move.toFrame) {
			continue;
		}

		if (moveMap.has(move.fromFrame)) {
			throw new Error(`Cannot move keyframe at frame ${move.fromFrame} twice`);
		}

		moveMap.set(move.fromFrame, move.toFrame);
	}

	if (moveMap.size === 0) {
		return expression as ExpressionKind;
	}

	const frames = new Set(existing.keyframes.map((keyframe) => keyframe.frame));
	for (const fromFrame of moveMap.keys()) {
		if (!frames.has(fromFrame)) {
			throw new Error(`Cannot move keyframe at frame ${fromFrame}: not found`);
		}
	}

	const movedFromFrames = new Set(moveMap.keys());
	const movedToFrames = new Set(moveMap.values());
	const removedKeyframeIndexes: number[] = [];
	const nextKeyframes = existing.keyframes.flatMap((keyframe, index) => {
		const movedFrame = moveMap.get(keyframe.frame);
		if (movedFrame !== undefined) {
			return [{...keyframe, frame: movedFrame}];
		}

		if (
			movedToFrames.has(keyframe.frame) &&
			!movedFromFrames.has(keyframe.frame)
		) {
			removedKeyframeIndexes.push(index);
			return [];
		}

		return [keyframe];
	});

	const nextFrames = new Set<number>();
	for (const keyframe of nextKeyframes) {
		if (nextFrames.has(keyframe.frame)) {
			throw new Error(
				`Cannot move keyframe to frame ${keyframe.frame}: frame already exists`,
			);
		}

		nextFrames.add(keyframe.frame);
	}

	const normalizedEasing = normalizeEasingAfterRemovingKeyframes({
		extraArgs: existing.extraArgs,
		previousSegmentCount: Math.max(existing.keyframes.length - 1, 0),
		nextSegmentCount: Math.max(nextKeyframes.length - 1, 0),
		removedKeyframeIndexes,
	});

	return createInterpolateExpression({
		callee: existing.callee,
		input: existing.input,
		extraArgs: normalizedEasing.extraArgs,
		keyframes: nextKeyframes,
	});
};

const applyKeyframeOperation = ({
	expression,
	key,
	operation,
	schema,
	videoConfigValues,
}: {
	expression: Expression;
	key: string;
	operation: KeyframeOperation;
	schema: InteractivitySchema | null;
	videoConfigValues: VideoConfigIdentifierValues;
}): {expression: ExpressionKind; introduced: IntroducedKeyframeIdentifiers} => {
	if (operation.type === 'add') {
		return addKeyframe({
			expression,
			key,
			frame: operation.frame,
			value: operation.value,
			schema,
			videoConfigValues,
		});
	}

	if (operation.type === 'settings') {
		return {
			expression: updateKeyframeSettings({
				expression,
				clamping: operation.clamping,
				posterize: operation.posterize,
				output: operation.output,
				videoConfigValues,
			}),
			introduced: noIntroducedIdentifiers,
		};
	}

	if (operation.type === 'easing') {
		const updated = updateKeyframeEasing({
			expression,
			segmentIndex: operation.segmentIndex,
			easing: operation.easing,
			videoConfigValues,
		});
		return {
			expression: updated.expression,
			introduced: {
				...noIntroducedIdentifiers,
				needsEasingImport: updated.needsEasingImport,
			},
		};
	}

	if (operation.type === 'move') {
		return {
			expression: moveKeyframes({
				expression,
				moves: operation.moves,
				videoConfigValues,
			}),
			introduced: noIntroducedIdentifiers,
		};
	}

	return removeKeyframe({
		expression,
		frame: operation.frame,
		videoConfigValues,
	});
};

const getExpressionFromJsxAttribute = (
	attr: JSXAttribute,
): Expression | null => {
	if (!attr.value) {
		return b.booleanLiteral(true) as Expression;
	}

	if (attr.value.type === 'StringLiteral') {
		return attr.value as unknown as Expression;
	}

	if (attr.value.type !== 'JSXExpressionContainer') {
		return null;
	}

	const {expression} = attr.value;
	if (expression.type === 'JSXEmptyExpression') {
		return null;
	}

	return expression as Expression;
};

const findJsxAttribute = (
	attributes: (JSXAttribute | JSXSpreadAttribute)[],
	name: string,
): {attrIndex: number; attr: JSXAttribute | undefined} => {
	const attrIndex = attributes.findIndex((candidate) => {
		if (candidate.type === 'JSXSpreadAttribute') {
			return false;
		}

		if (candidate.name.type === 'JSXNamespacedName') {
			return false;
		}

		return candidate.name.name === name;
	});

	const foundAttr = attrIndex === -1 ? undefined : attributes[attrIndex];
	return {
		attrIndex,
		attr:
			foundAttr && foundAttr.type === 'JSXAttribute'
				? (foundAttr as JSXAttribute)
				: undefined,
	};
};

const findObjectProperty = (
	objExpr: ObjectExpression,
	propertyName: string,
): {propIndex: number; prop: ObjectProperty | undefined} => {
	const propIndex = objExpr.properties.findIndex(
		(prop) =>
			prop.type === 'ObjectProperty' &&
			((prop.key.type === 'Identifier' && prop.key.name === propertyName) ||
				(prop.key.type === 'StringLiteral' && prop.key.value === propertyName)),
	);

	return {
		propIndex,
		prop:
			propIndex === -1
				? undefined
				: (objExpr.properties[propIndex] as ObjectProperty),
	};
};

const findFieldInSchema = (
	schema: InteractivitySchema,
	key: string,
): InteractivitySchemaField | undefined => {
	if (key in schema) {
		return schema[key];
	}

	for (const field of Object.values(schema)) {
		if (field.type !== 'enum') {
			continue;
		}

		for (const variant of Object.values(field.variants)) {
			const found = findFieldInSchema(variant, key);
			if (found) {
				return found;
			}
		}
	}

	return undefined;
};

const getDefaultKeyframeOutput = ({
	schema,
	key,
}: {
	schema: InteractivitySchema | null;
	key: string;
}): InterpolateOutputOption | null => {
	const field = schema ? findFieldInSchema(schema, key) : undefined;
	if (
		(field?.type === 'number' || field?.type === 'scale') &&
		field.defaultKeyframeOutput !== undefined
	) {
		return field.defaultKeyframeOutput;
	}

	return key === 'style.scale' ? 'perceptual-scale' : null;
};

const getInitialValueForMissingProp = ({
	schema,
	key,
	newValue,
}: {
	schema: InteractivitySchema | null;
	key: string;
	newValue: unknown;
}): unknown => {
	const field = schema ? findFieldInSchema(schema, key) : undefined;
	if (field && field.type !== 'hidden' && field.default !== undefined) {
		return field.default;
	}

	return newValue;
};

const shouldRemovePropAfterKeyframeOperation = ({
	expression,
	key,
	operation,
	schema,
	videoConfigValues,
}: {
	expression: Expression;
	key: string;
	operation: KeyframeOperation;
	schema: InteractivitySchema | null;
	videoConfigValues: VideoConfigIdentifierValues;
}) => {
	if (operation.type !== 'remove' || !schema) {
		return false;
	}

	const existing = getInterpolationExpression(expression, videoConfigValues);
	if (!existing || existing.keyframes.length !== 1) {
		return false;
	}

	const field = findFieldInSchema(schema, key);
	if (!field || field.type === 'hidden' || field.default === undefined) {
		return false;
	}

	return (
		JSON.stringify(existing.keyframes[0].value) ===
		JSON.stringify(field.default)
	);
};

const getObjectExpression = (attr: JSXAttribute): ObjectExpression | null => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		return null;
	}

	if (attr.value.expression.type !== 'ObjectExpression') {
		return null;
	}

	return attr.value.expression as ObjectExpression;
};

const createJsxExpressionAttribute = (
	key: string,
	expression: ExpressionKind,
): JSXAttribute => {
	return b.jsxAttribute(
		b.jsxIdentifier(key),
		b.jsxExpressionContainer(expression),
	) as JSXAttribute;
};

const createObjectProperty = (key: string, value: ExpressionKind) =>
	b.objectProperty(b.identifier(key), value);

const createObjectExpressionAttribute = ({
	parentKey,
	childKey,
	expression,
}: {
	parentKey: string;
	childKey: string;
	expression: ExpressionKind;
}): JSXAttribute => {
	return createJsxExpressionAttribute(
		parentKey,
		b.objectExpression([
			createObjectProperty(childKey, expression),
		]) as ExpressionKind,
	);
};

const createMissingPropExpression = (
	missingPropInitialValue: MissingPropInitialValue,
): Expression => {
	return parseValueExpression(missingPropInitialValue.value) as Expression;
};

const getSequenceWritableProp = ({
	attributes,
	key,
	missingPropInitialValue,
}: {
	attributes: (JSXAttribute | JSXSpreadAttribute)[];
	key: string;
	missingPropInitialValue: MissingPropInitialValue | null;
}): WritableProp => {
	const dotIndex = key.indexOf('.');
	if (dotIndex === -1) {
		const {attrIndex, attr: topLevelAttr} = findJsxAttribute(attributes, key);
		if (!topLevelAttr) {
			if (missingPropInitialValue) {
				return {
					expression: createMissingPropExpression(missingPropInitialValue),
					setExpression: (nextExpression) => {
						attributes.push(createJsxExpressionAttribute(key, nextExpression));
					},
					remove: () => undefined,
				};
			}

			throw new Error(`Cannot update keyframes: "${key}" is not set`);
		}

		const expression = getExpressionFromJsxAttribute(topLevelAttr);
		if (!expression) {
			throw new Error(`Cannot update keyframes: "${key}" is computed`);
		}

		return {
			expression,
			setExpression: (nextExpression) => {
				topLevelAttr.value = b.jsxExpressionContainer(nextExpression) as
					| JSXElement
					| JSXExpressionContainer
					| JSXFragment
					| StringLiteral
					| null
					| undefined;
			},
			remove: () => {
				attributes.splice(attrIndex, 1);
			},
		};
	}

	const parentKey = key.slice(0, dotIndex);
	const childKey = key.slice(dotIndex + 1);
	const {attrIndex: parentAttrIndex, attr: parentAttr} = findJsxAttribute(
		attributes,
		parentKey,
	);
	if (!parentAttr) {
		if (missingPropInitialValue) {
			return {
				expression: createMissingPropExpression(missingPropInitialValue),
				setExpression: (nextExpression) => {
					attributes.push(
						createObjectExpressionAttribute({
							parentKey,
							childKey,
							expression: nextExpression,
						}),
					);
				},
				remove: () => undefined,
			};
		}

		throw new Error(`Cannot update keyframes: "${parentKey}" is not set`);
	}

	const objExpr = getObjectExpression(parentAttr);
	if (!objExpr) {
		throw new Error(`Cannot update keyframes: "${parentKey}" is computed`);
	}

	const {propIndex, prop} = findObjectProperty(objExpr, childKey);
	if (!prop) {
		if (missingPropInitialValue) {
			return {
				expression: createMissingPropExpression(missingPropInitialValue),
				setExpression: (nextExpression) => {
					objExpr.properties.push(
						createObjectProperty(childKey, nextExpression) as ObjectProperty,
					);
				},
				remove: () => undefined,
			};
		}

		throw new Error(`Cannot update keyframes: "${key}" is not set`);
	}

	return {
		expression: prop.value as Expression,
		setExpression: (nextExpression) => {
			prop.value = nextExpression as ObjectProperty['value'];
		},
		remove: () => {
			objExpr.properties.splice(propIndex, 1);
			if (objExpr.properties.length === 0) {
				attributes.splice(parentAttrIndex, 1);
			}
		},
	};
};

const getEffectWritableProp = ({
	objExpr,
	key,
	missingPropInitialValue,
}: {
	objExpr: ObjectExpression;
	key: string;
	missingPropInitialValue: MissingPropInitialValue | null;
}): WritableProp => {
	const {propIndex, prop} = findObjectProperty(objExpr, key);
	if (!prop) {
		if (missingPropInitialValue) {
			return {
				expression: createMissingPropExpression(missingPropInitialValue),
				setExpression: (nextExpression) => {
					objExpr.properties.push(
						createObjectProperty(key, nextExpression) as ObjectProperty,
					);
				},
				remove: () => undefined,
			};
		}

		throw new Error(`Cannot update keyframes: "${key}" is not set`);
	}

	return {
		expression: prop.value as Expression,
		setExpression: (nextExpression) => {
			prop.value = nextExpression as ObjectProperty['value'];
		},
		remove: () => {
			objExpr.properties.splice(propIndex, 1);
		},
	};
};

const getEffectPropsObjectExpression = (
	call: CallExpression,
): ObjectExpression => {
	if (call.arguments.length === 0) {
		const objExpr = b.objectExpression([]) as ObjectExpression;
		call.arguments.push(objExpr);
		return objExpr;
	}

	if (call.arguments[0].type !== 'ObjectExpression') {
		throw new Error('Cannot update effect keyframe: computed');
	}

	return call.arguments[0] as ObjectExpression;
};

export const updateSequenceKeyframesAst = ({
	input,
	nodePath,
	updates,
	schema,
	videoConfigValues,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequenceKeyframeUpdate[];
	schema?: InteractivitySchema;
	videoConfigValues: VideoConfigValues | null;
}): {
	serialized: string;
	oldValueStrings: string[];
	newValueStrings: string[];
	logLine: number;
	updatedNodePath: SequenceNodePath;
} => {
	const ast = parseAst(input);
	const videoConfigIdentifierValues = getVideoConfigIdentifierValues({
		ast,
		videoConfigValues,
	});
	const jsxPath = getAstNodePath(ast, nodePath);
	const node = findJsxElementAtNodePath(ast, nodePath);
	if (!node || !jsxPath) {
		throw new Error(
			'Could not find a JSX element at the specified location to update keyframes',
		);
	}

	if (!node.attributes) {
		node.attributes = [];
	}

	const requiredImports = new Set<string>();
	let needsFrameHook = false;

	const oldValueStrings: string[] = [];
	const newValueStrings: string[] = [];
	for (const update of updates) {
		const prop = getSequenceWritableProp({
			attributes: node.attributes,
			key: update.key,
			missingPropInitialValue:
				update.operation.type === 'add'
					? {
							value: getInitialValueForMissingProp({
								schema: schema ?? null,
								key: update.key,
								newValue: update.operation.value,
							}),
						}
					: null,
		});
		oldValueStrings.push(recast.print(prop.expression).code);
		const {expression: nextExpression, introduced} = applyKeyframeOperation({
			expression: prop.expression,
			key: update.key,
			operation: update.operation,
			schema: schema ?? null,
			videoConfigValues: videoConfigIdentifierValues,
		});
		newValueStrings.push(recast.print(nextExpression).code);
		if (
			shouldRemovePropAfterKeyframeOperation({
				expression: prop.expression,
				key: update.key,
				operation: update.operation,
				schema: schema ?? null,
				videoConfigValues: videoConfigIdentifierValues,
			})
		) {
			prop.remove();
		} else {
			prop.setExpression(nextExpression);
		}

		if (introduced.calleeName) {
			requiredImports.add(introduced.calleeName);
		}

		if (introduced.needsFrameHook) {
			requiredImports.add('useCurrentFrame');
			needsFrameHook = true;
		}

		if (introduced.needsEasingImport) {
			requiredImports.add('Easing');
		}
	}

	if (needsFrameHook) {
		const fnPath = findEnclosingFunctionPath(jsxPath);
		if (fnPath) {
			ensureUseCurrentFrameHook(fnPath);
		}
	}

	ensureRemotionImports(ast, requiredImports);

	const updatedNodePath = findNodePathForJsxElement(ast, node);
	if (!updatedNodePath) {
		throw new Error(
			'Could not find updated JSX element location after updating keyframes',
		);
	}

	return {
		serialized: serializeAst(ast),
		oldValueStrings,
		newValueStrings,
		logLine: node.loc?.start.line ?? 1,
		updatedNodePath,
	};
};

export const updateSequenceKeyframes = async ({
	input,
	nodePath,
	updates,
	schema,
	prettierConfigOverride,
	videoConfigValues,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequenceKeyframeUpdate[];
	schema?: InteractivitySchema;
	prettierConfigOverride?: Record<string, unknown> | null;
	videoConfigValues: VideoConfigValues | null;
}): Promise<{
	output: string;
	formatted: boolean;
	oldValueStrings: string[];
	newValueStrings: string[];
	logLine: number;
	updatedNodePath: SequenceNodePath;
}> => {
	const {
		serialized,
		oldValueStrings,
		newValueStrings,
		logLine,
		updatedNodePath,
	} = updateSequenceKeyframesAst({
		input,
		nodePath,
		updates,
		schema,
		videoConfigValues,
	});
	const {output, formatted} = await formatFileContent({
		input: serialized,
		prettierConfigOverride,
	});
	const outputWithoutInsertedBlankLines =
		removeBlankLinesFromObjectsWithProperties({
			input: output,
			propertyNames: updates.map((update) =>
				getObjectPropertyNameFromUpdateKey(update.key),
			),
		});

	return {
		output: outputWithoutInsertedBlankLines,
		formatted,
		oldValueStrings,
		newValueStrings,
		logLine,
		updatedNodePath,
	};
};

export const updateEffectKeyframesAst = ({
	input,
	sequenceNodePath,
	effectIndex,
	updates,
	schema,
	videoConfigValues,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	updates: EffectKeyframeUpdate[];
	schema?: InteractivitySchema;
	videoConfigValues: VideoConfigValues | null;
}): {
	serialized: string;
	oldValueStrings: string[];
	newValueStrings: string[];
	logLine: number;
	effectCallee: string;
	updatedSequenceNodePath: SequenceNodePath;
} => {
	const ast = parseAst(input);
	const videoConfigIdentifierValues = getVideoConfigIdentifierValues({
		ast,
		videoConfigValues,
	});
	const jsxPath = getAstNodePath(ast, sequenceNodePath);
	const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
	if (!jsx || !jsxPath) {
		throw new Error(
			'Could not find a JSX element at the specified location to update effect keyframes',
		);
	}

	const attr = findEffectsAttr(jsx.attributes ?? []);
	if (!attr) {
		throw new Error('Could not find effects on the target JSX element');
	}

	const found = findEffectCallExpression({attr, effectIndex});
	if (found.kind === 'error') {
		throw new Error(`Cannot update effect keyframe: ${found.reason}`);
	}

	const {call, callee: effectCallee} = found;
	const objExpr = getEffectPropsObjectExpression(call);
	const oldValueStrings: string[] = [];
	const newValueStrings: string[] = [];
	const requiredImports = new Set<string>();
	let needsFrameHook = false;
	for (const update of updates) {
		const prop = getEffectWritableProp({
			objExpr,
			key: update.key,
			missingPropInitialValue:
				update.operation.type === 'add'
					? {
							value: getInitialValueForMissingProp({
								schema: schema ?? null,
								key: update.key,
								newValue: update.operation.value,
							}),
						}
					: null,
		});
		oldValueStrings.push(recast.print(prop.expression).code);
		const {expression: nextExpression, introduced} = applyKeyframeOperation({
			expression: prop.expression,
			key: update.key,
			operation: update.operation,
			schema: schema ?? null,
			videoConfigValues: videoConfigIdentifierValues,
		});
		newValueStrings.push(recast.print(nextExpression).code);
		if (
			shouldRemovePropAfterKeyframeOperation({
				expression: prop.expression,
				key: update.key,
				operation: update.operation,
				schema: schema ?? null,
				videoConfigValues: videoConfigIdentifierValues,
			})
		) {
			prop.remove();
		} else {
			prop.setExpression(nextExpression);
		}

		if (introduced.calleeName) {
			requiredImports.add(introduced.calleeName);
		}

		if (introduced.needsFrameHook) {
			requiredImports.add('useCurrentFrame');
			needsFrameHook = true;
		}

		if (introduced.needsEasingImport) {
			requiredImports.add('Easing');
		}
	}

	if (needsFrameHook) {
		const fnPath = findEnclosingFunctionPath(jsxPath);
		if (fnPath) {
			ensureUseCurrentFrameHook(fnPath);
		}
	}

	ensureRemotionImports(ast, requiredImports);

	const updatedSequenceNodePath = findNodePathForJsxElement(ast, jsx);
	if (!updatedSequenceNodePath) {
		throw new Error(
			'Could not find updated JSX element location after updating effect keyframes',
		);
	}

	return {
		serialized: serializeAst(ast),
		oldValueStrings,
		newValueStrings,
		logLine: call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
		effectCallee,
		updatedSequenceNodePath,
	};
};

export const updateEffectKeyframes = async ({
	input,
	sequenceNodePath,
	effectIndex,
	updates,
	schema,
	prettierConfigOverride,
	videoConfigValues,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	updates: EffectKeyframeUpdate[];
	schema?: InteractivitySchema;
	prettierConfigOverride?: Record<string, unknown> | null;
	videoConfigValues: VideoConfigValues | null;
}): Promise<{
	output: string;
	formatted: boolean;
	oldValueStrings: string[];
	newValueStrings: string[];
	logLine: number;
	effectCallee: string;
	updatedSequenceNodePath: SequenceNodePath;
}> => {
	const {
		serialized,
		oldValueStrings,
		newValueStrings,
		logLine,
		effectCallee,
		updatedSequenceNodePath,
	} = updateEffectKeyframesAst({
		input,
		sequenceNodePath,
		effectIndex,
		updates,
		schema,
		videoConfigValues,
	});
	const {output, formatted} = await formatFileContent({
		input: serialized,
		prettierConfigOverride,
	});
	const outputWithoutInsertedBlankLines =
		removeBlankLinesFromObjectsWithProperties({
			input: output,
			propertyNames: updates.map((update) => update.key),
		});

	return {
		output: outputWithoutInsertedBlankLines,
		formatted,
		oldValueStrings,
		newValueStrings,
		logLine,
		effectCallee,
		updatedSequenceNodePath,
	};
};
