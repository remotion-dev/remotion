import type {AddKeyframesRequest} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import {
	computeSequencePropsStatusFromContent,
	getSeriesSequenceFromContent,
} from './sequence-props';

export const validateKeyframePasteTiming = ({
	files,
	timingGuards,
}: {
	files: Readonly<Record<string, string>>;
	timingGuards: NonNullable<AddKeyframesRequest['paste']>['timingGuards'];
}): void => {
	for (const guard of timingGuards ?? []) {
		const fileContents = files[guard.fileName];
		if (fileContents === undefined) {
			throw new Error(
				'Could not read the layer timing before pasting keyframes',
			);
		}

		const {props} = computeSequencePropsStatusFromContent({
			fileContents,
			includeSourceLocation: false,
			nodePath: guard.nodePath.nodePath,
			componentIdentity: null,
			keys: guard.fields.map(({key}) => key),
			effects: [],
		});
		const seriesFrom = guard.fields.some(({key}) => key === 'from')
			? getSeriesSequenceFromContent({
					fileContents,
					nodePath: guard.nodePath.nodePath,
				})
			: null;
		for (const field of guard.fields) {
			if (!Number.isFinite(field.value)) {
				throw new Error(
					'Cannot paste keyframes: invalid expected layer timing',
				);
			}

			let value: unknown;
			if (field.key === 'from' && seriesFrom !== null) {
				value =
					seriesFrom.from === null
						? null
						: NoReactInternals.evaluateSourceNumericValue(
								seriesFrom.from,
								guard.nodePath.videoConfigValues,
							);
			} else {
				const status = props[field.key];
				if (status?.status !== 'static') {
					continue;
				}

				value =
					status.numericExpression !== undefined
						? NoReactInternals.evaluateSourceNumericValue(
								status.numericExpression,
								guard.nodePath.videoConfigValues,
							)
						: status.codeValue === undefined
							? field.defaultValue
							: status.codeValue;
			}

			if (typeof value !== 'number' || !Number.isFinite(value)) {
				continue;
			}

			if (value !== field.value) {
				throw new Error(
					'The layer timing changed before keyframes could be pasted. Wait for the timeline to update, then try again.',
				);
			}
		}
	}
};
