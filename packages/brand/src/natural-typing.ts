import {random} from 'remotion';

const keyboardCoordinates = new Map(
	['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'].flatMap((row, y) =>
		[...row].map(
			(key, x) =>
				[key, {x: x + (y === 2 ? 0.25 : y === 3 ? 0.75 : 0), y}] as const,
		),
	),
);

export const getNaturalTypedCharacterCount = ({
	text,
	frame,
	startFrame,
	durationInFrames,
	startCharacter,
	endCharacter,
}: {
	readonly text: string;
	readonly frame: number;
	readonly startFrame: number;
	readonly durationInFrames: number;
	readonly startCharacter: number;
	readonly endCharacter: number;
}) => {
	if (durationInFrames <= 0 || frame >= startFrame + durationInFrames) {
		return endCharacter;
	}

	if (frame <= startFrame || startCharacter === endCharacter) {
		return startCharacter;
	}

	const weights: number[] = [];
	let totalWeight = 0;
	for (let index = startCharacter; index < endCharacter; index++) {
		const character = text[index];
		const previous = text[index - 1] ?? '';
		const currentKey = keyboardCoordinates.get(character.toLowerCase());
		const previousKey = keyboardCoordinates.get(previous.toLowerCase());
		const wordStart = text.lastIndexOf(' ', index - 1) + 1;
		const wordPace = 0.75 + random(`${text}:word:${wordStart}`) * 0.5;
		let weight = (0.65 + random(`${text}:key:${index}`) * 0.7) * wordPace;
		if (currentKey && previousKey) {
			weight +=
				Math.hypot(currentKey.x - previousKey.x, currentKey.y - previousKey.y) *
				0.06;
		}

		if (/\s/.test(previous)) {
			weight += 0.4 + random(`${text}:space:${index}`) * 0.8;
		}

		if (/[.!?;:,]/.test(previous)) {
			weight += 2.4;
		}

		if (character !== character.toLowerCase()) {
			weight += 0.3;
		}

		if (random(`${text}:hesitation:${index}`) < 0.06) {
			weight += 1.5;
		}

		weights.push(weight);
		totalWeight += weight;
	}

	const elapsedWeight = ((frame - startFrame) / durationInFrames) * totalWeight;
	let cumulativeWeight = 0;
	for (let index = 0; index < weights.length; index++) {
		cumulativeWeight += weights[index];
		if (elapsedWeight < cumulativeWeight) {
			return startCharacter + index;
		}
	}

	return endCharacter;
};
