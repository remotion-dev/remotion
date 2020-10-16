import {
	registerVideo,
	spring2,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import styled from 'styled-components';

const Text = styled.span`
	font-family: -apple-system, BlinkMacSystemFont, sans-serif;
	font-weight: bold;
	font-size: 110px;
	line-height: 110px;
	height: 110px;
`;

const wordLength = {
	one: 187.45,
	thing: 258.41,
	every: 277.58,
	any: 183.11,
	body: 254,
	'Stickerify ': 499.52,
	' ': 0,
};

type Word = keyof typeof wordLength;

const words: [Word, Word, Word][] = [
	['Stickerify ', 'any', 'body'],
	['Stickerify ', 'any', 'thing'],
	['Stickerify ', 'every', 'thing'],
	['Stickerify ', 'any', 'body'],
	[' ', 'any', 'body'],
];

const getWordsForFrame = (frame: number, videoLength: number) => {
	const ratio = frame / videoLength;
	const index = Math.max(
		0,
		Math.min(words.length - 1, Math.floor(ratio * words.length))
	);
	return words[index];
};

const getTotalLength = (frame: number, duration: number) => {
	const wordsToUse = getWordsForFrame(frame, duration);
	return wordsToUse.reduce((a, b, index) => {
		const actualLength = getActualWordLength(frame, duration, index);
		return a + actualLength;
	}, 0);
};

const leftForWord = ({
	wordArray,
	index,
	duration,
	compWidth,
	frame,
}: {
	wordArray: Word[];
	index: number;
	duration: number;
	compWidth: number;
	frame: number;
}) => {
	let length = 0;
	for (let i = 0; i < wordArray.length; i++) {
		if (i === index) {
			return (compWidth - getTotalLength(frame, duration)) / 2 + length;
		}
		length += getActualWordLength(frame, duration, i);
	}
};

type Change = {
	distance: number;
	words: [Word, Word, Word];
} | null;

const getNextChange = (frame: number, videoLength: number): Change => {
	const currentWords = getWordsForFrame(frame, videoLength);
	let j = 1;
	for (j; j < videoLength; j++) {
		const w = getWordsForFrame(frame + j, videoLength);
		if (w.join() !== currentWords.join()) {
			return {distance: j, words: w};
		}
	}
	return null;
};

const getPreviousChange = (frame: number, videoLength: number): Change => {
	const currentWords = getWordsForFrame(frame, videoLength);
	let j = 1;
	for (j; j < videoLength; j++) {
		const w = getWordsForFrame(frame - j, videoLength);
		if (w.join() !== currentWords.join()) {
			return {distance: j, words: w};
		}
	}
	return null;
};

const transitionDur = 6;

const getFactorForDist = (
	change: Change,
	currentWords: [Word, Word, Word],
	index: number
) => {
	if (change === null) {
		return 0;
	}
	if (currentWords[index] === change.words[index]) {
		return 0;
	}
	const factor = Math.max(0, transitionDur - change.distance) / transitionDur;
	const val = spring2({
		config: {
			damping: 100,
			mass: 0.1,
			stiffness: 80,
			restSpeedThreshold: 0.00001,
			restDisplacementThreshold: 0.0001,
			overshootClamping: false,
		},
		fps: 30,
		frame: change.distance,
		from: 1,
		to: 0,
	});

	return val;
};

const getScaleForDistance = ({
	nextChange,
	prevChange,
	currentWords,
	index,
}: {
	nextChange: Change;
	prevChange: Change;
	currentWords: [Word, Word, Word];
	index: number;
}) => {
	const next = getFactorForDist(nextChange, currentWords, index);
	const prev = getFactorForDist(prevChange, currentWords, index);
	if (next > 0.01) {
		return 1 - next;
	}
	if (prev > 0.01) {
		return 1 - prev;
	}
	return 1;
};

const getWidthChange = (
	change: Change,
	currentWords: [Word, Word, Word],
	index: number
) => {
	const factor = getFactorForDist(change, currentWords, index);
	if (factor === 0 || change === null) {
		return 0;
	}
	const widthChange =
		wordLength[change.words[index]] - wordLength[currentWords[index]];
	return widthChange;
};

const getWidthChangeForDistance = ({
	nextChange,
	prevChange,
	currentWords,
	index,
}: {
	nextChange: Change;
	prevChange: Change;
	currentWords: [Word, Word, Word];
	index: number;
}) => {
	const nextWidth =
		getWidthChange(nextChange, currentWords, index) *
		getFactorForDist(nextChange, currentWords, index);
	const prevWidth =
		getWidthChange(prevChange, currentWords, index) *
		getFactorForDist(prevChange, currentWords, index);
	return nextWidth * 0.5 + prevWidth * 0.5;
};

const getActualWordLength = (frame: number, duration: number, i: number) => {
	const nextChange = getNextChange(frame, duration);
	const prevChange = getPreviousChange(frame, duration);
	const wordsToUse = getWordsForFrame(frame, duration);
	const word = wordsToUse[i];

	return (
		wordLength[word] +
		getWidthChangeForDistance({
			nextChange,
			prevChange,
			currentWords: wordsToUse,
			index: i,
		})
	);
};

export const Comp = () => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const wordsToUse = getWordsForFrame(frame, videoConfig.durationInFrames);
	return (
		<div style={{display: 'flex', backgroundColor: 'white', flex: 1}}>
			<div
				style={{
					flex: 1,
					backgroundColor: 'white',
					justifyContent: 'center',
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					transform: `scale(0.7)`,
				}}
			>
				<Text>
					{wordsToUse.map((w, i) => {
						const left = leftForWord({
							wordArray: wordsToUse,
							index: i,
							compWidth: videoConfig.width,
							duration: videoConfig.durationInFrames,
							frame,
						});
						const nextChange = getNextChange(
							frame,
							videoConfig.durationInFrames
						);
						const previousChange = getPreviousChange(
							frame,
							videoConfig.durationInFrames
						);
						return (
							<span
								key={w}
								style={{
									display: 'inline-block',
									position: 'absolute',
									textAlign: 'center',
									width: getActualWordLength(
										frame,
										videoConfig.durationInFrames,
										i
									),
									left,
									transform: `scale(${getScaleForDistance({
										nextChange,
										prevChange: previousChange,
										currentWords: wordsToUse,
										index: i,
									})})`,
								}}
							>
								{w}
							</span>
						);
					})}
				</Text>
			</div>
		</div>
	);
};

registerVideo(Comp, {
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 3 * 30,
});
