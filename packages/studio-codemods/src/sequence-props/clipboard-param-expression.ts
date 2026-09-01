import type {File, ObjectExpression, ObjectProperty} from '@babel/types';
import type {
	EffectClipboardKeyframedParam,
	EffectClipboardParam,
} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import {parseValueExpression} from '../update-nested-prop';
import {ensureNamedImport} from './imports';

const b = recast.types.builders;

export type ClipboardParamRemotionImportName =
	| 'Easing'
	| 'interpolate'
	| 'interpolateColors'
	| 'useCurrentFrame';

export type ClipboardParamRemotionLocalNames = Partial<
	Record<ClipboardParamRemotionImportName, string>
>;

export const getRequiredRemotionImportsForClipboardParams = (
	params: Iterable<EffectClipboardParam>,
): Set<ClipboardParamRemotionImportName> => {
	const requiredImports = new Set<ClipboardParamRemotionImportName>();
	for (const param of params) {
		if (param.type !== 'keyframed') {
			continue;
		}

		requiredImports.add('useCurrentFrame');
		requiredImports.add(param.interpolationFunction);
		if (param.easing.some((easing) => easing.type !== 'linear')) {
			requiredImports.add('Easing');
		}
	}

	return requiredImports;
};

export const ensureClipboardParamRemotionImports = ({
	ast,
	requiredImports,
}: {
	ast: File;
	requiredImports: Set<ClipboardParamRemotionImportName>;
}): ClipboardParamRemotionLocalNames => {
	const localNames: ClipboardParamRemotionLocalNames = {};
	for (const importedName of requiredImports) {
		localNames[importedName] = ensureNamedImport({
			ast,
			importedName,
			sourcePath: 'remotion',
			localName: importedName,
		});
	}

	return localNames;
};

const makeEasingExpression = ({
	easing,
	easingLocalName,
}: {
	easing: EffectClipboardKeyframedParam['easing'][number];
	easingLocalName: string;
}): ExpressionKind => {
	switch (easing.type) {
		case 'linear':
			return b.memberExpression(
				b.identifier(easingLocalName),
				b.identifier('linear'),
			) as ExpressionKind;
		case 'step1':
			return b.memberExpression(
				b.identifier(easingLocalName),
				b.identifier('step1'),
			) as ExpressionKind;
		case 'spring':
			return b.callExpression(
				b.memberExpression(
					b.identifier(easingLocalName),
					b.identifier('spring'),
				),
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
				b.memberExpression(
					b.identifier(easingLocalName),
					b.identifier('bezier'),
				),
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

const makeOptionsExpression = ({
	param,
	localNames,
}: {
	param: EffectClipboardKeyframedParam;
	localNames: ClipboardParamRemotionLocalNames;
}): ObjectExpression | null => {
	const properties: ObjectProperty[] = [];
	if (param.interpolationFunction !== 'interpolateColors') {
		if (param.clamping.left !== 'extend') {
			properties.push(
				b.objectProperty(
					b.identifier('extrapolateLeft'),
					b.stringLiteral(param.clamping.left),
				) as ObjectProperty,
			);
		}

		if (param.clamping.right !== 'extend') {
			properties.push(
				b.objectProperty(
					b.identifier('extrapolateRight'),
					b.stringLiteral(param.clamping.right),
				) as ObjectProperty,
			);
		}

		if (param.output === 'perceptual-scale') {
			properties.push(
				b.objectProperty(
					b.identifier('output'),
					b.stringLiteral(param.output),
				) as ObjectProperty,
			);
		}
	}

	if (param.easing.some((easing) => easing.type !== 'linear')) {
		properties.push(
			b.objectProperty(
				b.identifier('easing'),
				b.arrayExpression(
					param.easing.map((easing) =>
						makeEasingExpression({
							easing,
							easingLocalName: localNames.Easing ?? 'Easing',
						}),
					) as never,
				),
			) as ObjectProperty,
		);
	}

	if (param.posterize !== undefined) {
		properties.push(
			b.objectProperty(
				b.identifier('posterize'),
				parseValueExpression(param.posterize) as never,
			) as ObjectProperty,
		);
	}

	return properties.length === 0
		? null
		: (b.objectExpression(properties as never) as ObjectExpression);
};

export const makeClipboardParamExpression = ({
	param,
	localNames,
}: {
	param: EffectClipboardParam;
	localNames: ClipboardParamRemotionLocalNames;
}): ExpressionKind => {
	if (param.type === 'static') {
		return parseValueExpression(param.value);
	}

	if (param.easing.length !== Math.max(0, param.keyframes.length - 1)) {
		throw new Error('Cannot paste property: invalid easing metadata');
	}

	const args: ExpressionKind[] = [
		b.identifier('frame') as ExpressionKind,
		b.arrayExpression(
			param.keyframes.map((keyframe) =>
				parseValueExpression(keyframe.frame),
			) as never,
		) as ExpressionKind,
		b.arrayExpression(
			param.keyframes.map((keyframe) =>
				parseValueExpression(keyframe.value),
			) as never,
		) as ExpressionKind,
	];
	const options = makeOptionsExpression({param, localNames});
	if (options) {
		args.push(options as ExpressionKind);
	}

	return b.callExpression(
		b.identifier(
			localNames[param.interpolationFunction] ?? param.interpolationFunction,
		),
		args as never,
	) as ExpressionKind;
};
