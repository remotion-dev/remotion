import type {File, ObjectExpression, ObjectProperty} from '@babel/types';
import type {
	EffectClipboardKeyframedParam,
	EffectClipboardParam,
	EffectClipboardSnapshot,
} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import {ensureNamedImport} from '../helpers/imports';
import {parseValueExpression} from './update-nested-prop';

const b = recast.types.builders;

export type RemotionImportName =
	| 'Easing'
	| 'interpolate'
	| 'interpolateColors'
	| 'useCurrentFrame';

export type RemotionLocalNames = Partial<Record<RemotionImportName, string>>;

const isNonLinearEasing = (
	easing: EffectClipboardKeyframedParam['easing'][number],
) => easing.type !== 'linear';

const keyframedParamNeedsEasingImport = (
	param: EffectClipboardKeyframedParam,
) => param.easing.some(isNonLinearEasing);

export const getRequiredRemotionImportsForEffectParams = (
	params: Iterable<EffectClipboardParam>,
): Set<RemotionImportName> => {
	const requiredImports = new Set<RemotionImportName>();

	for (const param of params) {
		if (param.type !== 'keyframed') {
			continue;
		}

		requiredImports.add('useCurrentFrame');
		requiredImports.add(param.interpolationFunction);
		if (keyframedParamNeedsEasingImport(param)) {
			requiredImports.add('Easing');
		}
	}

	return requiredImports;
};

export const getRequiredRemotionImports = (
	effects: EffectClipboardSnapshot[],
): Set<RemotionImportName> => {
	return getRequiredRemotionImportsForEffectParams(
		effects.flatMap((effect) => Object.values(effect.params)),
	);
};

export const ensureRemotionImportLocalNames = ({
	ast,
	requiredImports,
}: {
	ast: File;
	requiredImports: Set<RemotionImportName>;
}): RemotionLocalNames => {
	const localNames: RemotionLocalNames = {};
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

const makeKeyframedOptions = ({
	param,
	remotionLocalNames,
}: {
	param: EffectClipboardKeyframedParam;
	remotionLocalNames: RemotionLocalNames;
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
	}

	if (keyframedParamNeedsEasingImport(param)) {
		const easingLocalName = remotionLocalNames.Easing ?? 'Easing';
		properties.push(
			b.objectProperty(
				b.identifier('easing'),
				b.arrayExpression(
					param.easing.map((easing) =>
						makeEasingExpression({easing, easingLocalName}),
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

	if (properties.length === 0) {
		return null;
	}

	return b.objectExpression(properties as never) as ObjectExpression;
};

const makeKeyframedExpression = ({
	param,
	remotionLocalNames,
}: {
	param: EffectClipboardKeyframedParam;
	remotionLocalNames: RemotionLocalNames;
}): ExpressionKind => {
	const expectedEasingCount = Math.max(0, param.keyframes.length - 1);
	if (param.easing.length !== expectedEasingCount) {
		throw new Error('Cannot paste keyframed effect: invalid easing metadata');
	}

	const calleeName =
		remotionLocalNames[param.interpolationFunction] ??
		param.interpolationFunction;
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
	const options = makeKeyframedOptions({param, remotionLocalNames});
	if (options) {
		args.push(options as ExpressionKind);
	}

	return b.callExpression(
		b.identifier(calleeName),
		args as never,
	) as ExpressionKind;
};

export const makeParamExpression = ({
	param,
	remotionLocalNames,
}: {
	param: EffectClipboardParam;
	remotionLocalNames: RemotionLocalNames;
}): ExpressionKind => {
	if (param.type === 'static') {
		return parseValueExpression(param.value);
	}

	return makeKeyframedExpression({param, remotionLocalNames});
};
