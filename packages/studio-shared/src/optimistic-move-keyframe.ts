import type {
	CanUpdateSequencePropsResponse,
	CanUpdateSequencePropStatus,
} from 'remotion';

export type OptimisticKeyframeMove = {
	readonly fieldKey: string;
	readonly fromFrame: number;
	readonly toFrame: number;
};

const getMoveMap = (
	moves: readonly {fromFrame: number; toFrame: number}[],
): Map<number, number> | null => {
	const moveMap = new Map<number, number>();
	for (const move of moves) {
		if (move.fromFrame === move.toFrame) {
			continue;
		}

		if (moveMap.has(move.fromFrame)) {
			return null;
		}

		moveMap.set(move.fromFrame, move.toFrame);
	}

	return moveMap;
};

const getMovedKeyframes = ({
	status,
	moves,
}: {
	status: CanUpdateSequencePropStatus;
	moves: readonly {fromFrame: number; toFrame: number}[];
}): {
	keyframes: Extract<
		CanUpdateSequencePropStatus,
		{status: 'keyframed'}
	>['keyframes'];
	removedKeyframeIndexes: number[];
} | null => {
	if (status.status !== 'keyframed') {
		return null;
	}

	const moveMap = getMoveMap(moves);
	if (moveMap === null) {
		return null;
	}

	if (moveMap.size === 0) {
		return {keyframes: status.keyframes, removedKeyframeIndexes: []};
	}

	const frames = new Set(status.keyframes.map((keyframe) => keyframe.frame));
	for (const fromFrame of moveMap.keys()) {
		if (!frames.has(fromFrame)) {
			return null;
		}
	}

	const movedFromFrames = new Set(moveMap.keys());
	const movedToFrames = new Set(moveMap.values());
	const removedKeyframeIndexes: number[] = [];
	const nextKeyframes = status.keyframes.flatMap((keyframe, index) => {
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
			return null;
		}

		nextFrames.add(keyframe.frame);
	}

	return {
		keyframes: nextKeyframes.sort((a, b) => a.frame - b.frame),
		removedKeyframeIndexes,
	};
};

const removeEasingForRemovedKeyframes = ({
	easing,
	removedKeyframeIndexes,
}: {
	easing: Extract<CanUpdateSequencePropStatus, {status: 'keyframed'}>['easing'];
	removedKeyframeIndexes: number[];
}) => {
	const nextEasing = [...easing];
	for (const removedKeyframeIndex of [...removedKeyframeIndexes].sort(
		(a, b) => b - a,
	)) {
		if (nextEasing.length === 0) {
			break;
		}

		const easingIndexToRemove =
			removedKeyframeIndex === 0 ? 0 : removedKeyframeIndex - 1;
		nextEasing.splice(easingIndexToRemove, 1);
	}

	return nextEasing;
};

export const canMoveKeyframesWithoutCollisions = ({
	status,
	moves,
}: {
	status: CanUpdateSequencePropStatus;
	moves: readonly {fromFrame: number; toFrame: number}[];
}): boolean => {
	return getMovedKeyframes({status, moves}) !== null;
};

export const moveKeyframesInPropStatus = ({
	status,
	moves,
}: {
	status: CanUpdateSequencePropStatus;
	moves: readonly {fromFrame: number; toFrame: number}[];
}): CanUpdateSequencePropStatus => {
	if (status.status !== 'keyframed') {
		return status;
	}

	const moved = getMovedKeyframes({status, moves});
	if (
		moved === null ||
		(moved.removedKeyframeIndexes.length === 0 &&
			moved.keyframes === status.keyframes)
	) {
		return status;
	}

	const easing = removeEasingForRemovedKeyframes({
		easing: status.easing,
		removedKeyframeIndexes: moved.removedKeyframeIndexes,
	});

	return {
		...status,
		keyframes: moved.keyframes,
		easing,
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
