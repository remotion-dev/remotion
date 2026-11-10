import type {AddKeyframesRequest} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import {computeSequencePropsStatusFromContent} from './sequence-props';

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
		for (const field of guard.fields) {
			if (!Number.isFinite(field.value)) {
				throw new Error(
					'Cannot paste keyframes: invalid expected layer timing',
				);
			}

			const status = props[field.key];
			if (status?.status !== 'static') {
				continue;
			}

			const value =
				status.numericExpression !== undefined
					? NoReactInternals.evaluateSourceNumericValue(
							status.numericExpression,
							guard.nodePath.videoConfigValues,
						)
					: status.codeValue === undefined
						? field.defaultValue
						: status.codeValue;
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
