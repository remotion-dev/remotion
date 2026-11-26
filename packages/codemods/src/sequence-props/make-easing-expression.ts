import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {CanUpdateSequencePropStatusEasing} from 'remotion';
import {parseValueExpression} from '../update-nested-prop';

const b = recast.types.builders;

export const makeEasingExpression = ({
	easing,
	easingLocalName,
}: {
	easing: CanUpdateSequencePropStatusEasing;
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
