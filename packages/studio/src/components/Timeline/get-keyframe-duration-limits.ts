import {
	Internals,
	type PropStatuses,
	type SourceNumericValue,
	type TSequence,
	type VideoConfigValues,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineTrimLimitReason} from './timeline-trim-limit-reason';

const getDurationCoefficients = (
	expression: SourceNumericValue,
	config: VideoConfigValues,
): {factor: number; offset: number} | null => {
	if (typeof expression === 'number' || expression.type === 'literal') {
		return {
			factor: 0,
			offset: typeof expression === 'number' ? expression : expression.value,
		};
	}

	if (expression.type !== 'binary') {
		if (
			expression.binding.type !== 'video-config' ||
			expression.binding.field !== 'durationInFrames'
		) {
			return {
				factor: 0,
				offset: NoReactInternals.evaluateSourceNumericValue(expression, config),
			};
		}

		return {
			factor:
				expression.type === 'video-config-multiplication'
					? expression.multiplier
					: 1,
			offset:
				expression.type === 'video-config-subtraction'
					? -expression.subtrahend
					: 0,
		};
	}

	const left = getDurationCoefficients(expression.left, config);
	const right = getDurationCoefficients(expression.right, config);
	if (!left || !right) return null;
	if (expression.operator === '+' || expression.operator === '-') {
		const sign = expression.operator === '+' ? 1 : -1;
		return {
			factor: left.factor + sign * right.factor,
			offset: left.offset + sign * right.offset,
		};
	}

	if (expression.operator === '*') {
		return left.factor !== 0 && right.factor !== 0
			? null
			: {
					factor: left.factor * right.offset + right.factor * left.offset,
					offset: left.offset * right.offset,
				};
	}

	return right.factor !== 0 || right.offset === 0
		? null
		: {
				factor: left.factor / right.offset,
				offset: left.offset / right.offset,
			};
};

export const getKeyframeDurationLimits = ({
	sequence,
	sequences,
	tracks,
	propStatuses,
}: {
	readonly sequence: TSequence;
	readonly sequences: readonly TSequence[];
	readonly tracks: readonly TimelineTrackData[];
	readonly propStatuses: PropStatuses;
}) => {
	let sequencesById: Map<string, TSequence> | null = null;
	let tracksById: Map<string, TimelineTrackData> | null = null;
	const visited = new Set<string>();
	let minimumEnd = -Infinity;
	let maximumEnd = Infinity;
	let minimumReason: TimelineTrimLimitReason | null = null;
	let maximumReason: TimelineTrimLimitReason | null = null;
	for (const track of tracks) {
		const nodePath = track.nodePathInfo?.sequenceSubscriptionKey;
		if (!nodePath) continue;
		const status =
			propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)];
		const constraints = status?.canUpdate
			? status.durationDependentKeyframes
			: null;
		if (constraints === null) continue;

		sequencesById ??= new Map(sequences.map((item) => [item.id, item]));
		tracksById ??= new Map(tracks.map((item) => [item.sequence.id, item]));

		// A hook in the render function reads the context outside its outermost
		// JSX element. Nested JSX sequences do not change that hook's clock.
		let scopeTrack = track;
		let owner = sequencesById.get(scopeTrack.sequence.parent ?? '');
		while (owner) {
			const parentTrack = tracksById.get(owner.id);
			const parentPath = parentTrack?.nodePathInfo?.sequenceSubscriptionKey;
			if (
				!parentTrack ||
				!parentPath ||
				parentPath.absolutePath !== nodePath.absolutePath ||
				!constraints.scope.every(
					(part, index) => parentPath.nodePath[index] === part,
				)
			)
				break;
			scopeTrack = parentTrack;
			owner = sequencesById.get(owner.parent ?? '');
		}

		if (!owner) continue;
		const chain: TSequence[] = [];
		let ancestor: TSequence | undefined = owner;
		while (ancestor && ancestor.id !== sequence.id) {
			chain.push(ancestor);
			ancestor = sequencesById.get(ancestor.parent ?? '');
		}

		if (!ancestor) continue;
		const key = `${owner.id}\0${nodePath.absolutePath}\0${constraints.scope.join('.')}`;
		if (visited.has(key)) continue;
		visited.add(key);
		const config = scopeTrack.sequence.controls?.videoConfigValues;
		if (!config) continue;

		let minimum = -Infinity;
		let maximum = Infinity;
		let locked = false;
		for (const range of constraints.inputRanges) {
			const coefficients = range?.map((expression) =>
				getDurationCoefficients(expression, config),
			);
			if (!coefficients || coefficients.some((value) => value === null)) {
				locked = true;
				minimum = Math.max(minimum, config.durationInFrames);
				maximum = Math.min(maximum, config.durationInFrames);
				continue;
			}

			for (let index = 1; index < coefficients.length; index++) {
				const previous = coefficients[index - 1]!;
				const current = coefficients[index]!;
				const factor = current.factor - previous.factor;
				const offset = current.offset - previous.offset;
				if (
					!Number.isFinite(factor) ||
					!Number.isFinite(offset) ||
					(factor === 0 && offset <= 0)
				) {
					locked = true;
					minimum = Math.max(minimum, config.durationInFrames);
					maximum = Math.min(maximum, config.durationInFrames);
				} else if (factor > 0) {
					minimum = Math.max(minimum, Math.floor(-offset / factor) + 1);
				} else if (factor < 0) {
					maximum = Math.min(maximum, Math.ceil(-offset / factor) - 1);
				}
			}
		}

		for (const child of chain) {
			const childPath = tracksById.get(child.id)?.nodePathInfo
				?.sequenceSubscriptionKey;
			const childProps = childPath
				? Internals.getPropStatusesCtx(propStatuses, childPath)
				: null;
			const childConfig = child.controls?.videoConfigValues;
			const hasDependentTiming = [
				'from',
				'durationInFrames',
				'trimBefore',
				'playbackRate',
			].some((field) => {
				const prop = childProps?.[field];
				if (!prop) return false;
				if (prop.status !== 'static') return true;
				if (!prop.numericExpression || !childConfig) return false;
				const coefficients = getDurationCoefficients(
					prop.numericExpression,
					childConfig,
				);
				return !coefficients || coefficients.factor !== 0;
			});
			if (child.loopDisplay || hasDependentTiming) {
				locked = true;
				// Partial loops and duration-dependent child timings are not affine
				// in the ancestor's end. Preserve the current safe duration.
				minimum =
					sequence.duration * sequence.sequencePlaybackRate +
					(sequence.trimBefore ?? 0);
				maximum = minimum;
				break;
			}

			const trimBefore = child.trimBefore ?? 0;
			const runtimeDuration =
				child.controls?.runtimeValues.getSnapshot().durationInFrames;
			const ownDuration =
				typeof runtimeDuration === 'number'
					? runtimeDuration
					: child.unclippedDuration !== undefined &&
						  child.unclippedDuration !== null
						? child.unclippedDuration * child.sequencePlaybackRate
						: Infinity;
			// Once a child's explicit duration caps its clock, extending an
			// ancestor cannot cross the child's upper interpolation bound.
			if (ownDuration + trimBefore <= maximum) maximum = Infinity;
			minimum =
				child.from + (minimum - trimBefore) / child.sequencePlaybackRate;
			maximum =
				child.from + (maximum - trimBefore) / child.sequencePlaybackRate;
		}

		if (
			Number.isFinite(minimum) &&
			(minimum > minimumEnd || (minimum === minimumEnd && locked))
		) {
			minimumEnd = minimum;
			minimumReason = locked ? 'Computed keyframes' : 'Keyframe constraint';
		}

		if (
			Number.isFinite(maximum) &&
			(maximum < maximumEnd || (maximum === maximumEnd && locked))
		) {
			maximumEnd = maximum;
			maximumReason = locked ? 'Computed keyframes' : 'Keyframe constraint';
		}
	}

	return {minimumEnd, maximumEnd, minimumReason, maximumReason};
};
