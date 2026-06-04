import type {
	CanUpdateSequencePropsResponse,
	CanUpdateSequencePropStatus,
} from 'remotion';

export type OptimisticKeyframeMove = {
	readonly fieldKey: string;
	readonly fromFrame: number;
	readonly toFrame: number;
};

const moveKeyframesInPropStatus = ({
	status,
	moves,
}: {
	status: CanUpdateSequencePropStatus;
	moves: readonly {fromFrame: number; toFrame: number}[];
}): CanUpdateSequencePropStatus => {
	if (status.status !== 'keyframed') {
		return status;
	}

	const moveMap = new Map<number, number>();
	for (const move of moves) {
		if (move.fromFrame !== move.toFrame) {
			moveMap.set(move.fromFrame, move.toFrame);
		}
	}

	if (moveMap.size === 0) {
		return status;
	}

	const sourceFrames = new Set(
		status.keyframes.map((keyframe) => keyframe.frame),
	);
	for (const fromFrame of moveMap.keys()) {
		if (!sourceFrames.has(fromFrame)) {
			return status;
		}
	}

	const nextFrames = new Set<number>();
	const keyframes = status.keyframes
		.map((keyframe) => {
			const frame = moveMap.get(keyframe.frame) ?? keyframe.frame;
			if (nextFrames.has(frame)) {
				return null;
			}

			nextFrames.add(frame);
			return {
				...keyframe,
				frame,
			};
		})
		.filter((keyframe): keyframe is NonNullable<typeof keyframe> => {
			return keyframe !== null;
		});

	if (keyframes.length !== status.keyframes.length) {
		return status;
	}

	return {
		...status,
		keyframes: keyframes.sort((a, b) => a.frame - b.frame),
	};
};

export const optimisticMoveSequenceKeyframes = ({
	previous,
	keyframes,
}: {
	previous: CanUpdateSequencePropsResponse;
	keyframes: readonly OptimisticKeyframeMove[];
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const movesByField = new Map<string, OptimisticKeyframeMove[]>();
	for (const keyframe of keyframes) {
		const moves = movesByField.get(keyframe.fieldKey) ?? [];
		moves.push(keyframe);
		movesByField.set(keyframe.fieldKey, moves);
	}

	const props = {...previous.props};
	for (const [fieldKey, moves] of movesByField) {
		const status = props[fieldKey];
		if (!status) {
			continue;
		}

		props[fieldKey] = moveKeyframesInPropStatus({status, moves});
	}

	return {
		...previous,
		props,
	};
};

export const optimisticMoveEffectKeyframes = ({
	previous,
	keyframes,
}: {
	previous: CanUpdateSequencePropsResponse;
	keyframes: readonly (OptimisticKeyframeMove & {effectIndex: number})[];
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const movesByEffect = new Map<number, OptimisticKeyframeMove[]>();
	for (const keyframe of keyframes) {
		const moves = movesByEffect.get(keyframe.effectIndex) ?? [];
		moves.push(keyframe);
		movesByEffect.set(keyframe.effectIndex, moves);
	}

	const effects = previous.effects.map((effect) => {
		if (!effect.canUpdate) {
			return effect;
		}

		const movesForEffect = movesByEffect.get(effect.effectIndex);
		if (!movesForEffect) {
			return effect;
		}

		const props = {...effect.props};
		const movesByField = new Map<string, OptimisticKeyframeMove[]>();
		for (const move of movesForEffect) {
			const moves = movesByField.get(move.fieldKey) ?? [];
			moves.push(move);
			movesByField.set(move.fieldKey, moves);
		}

		for (const [fieldKey, moves] of movesByField) {
			const status = props[fieldKey];
			if (!status) {
				continue;
			}

			props[fieldKey] = moveKeyframesInPropStatus({status, moves});
		}

		return {
			...effect,
			props,
		};
	});

	return {
		...previous,
		effects,
	};
};
