import {registerVideo, useCurrentFrame, useVideoConfig} from '@remotion/core';
import React from 'react';
import styled from 'styled-components';

const Text = styled.span`
	font-family: -apple-system, BlinkMacSystemFont, sans-serif;
	font-weight: bold;
	font-size: 110px;
	line-height: 110px;
`;

const wordLength = {
	one: 187.45,
	thing: 258.41,
	every: 277.58,
	any: 183.11,
	'Stickerify ': 499.52,
};

type Word = keyof typeof wordLength;

const words: [Word, Word, Word][] = [
	['Stickerify ', 'any', 'one'],
	['Stickerify ', 'any', 'thing'],
	['Stickerify ', 'every', 'thing'],
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

const transitionDur = 6;

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
	return Math.max(0, transitionDur - change.distance) / transitionDur;
};

const getFactorForNextAndPrev = ({
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
	const nextDiff = getFactorForDist(nextChange, currentWords, index);
	const prevDiff = getFactorForDist(prevChange, currentWords, index);
	return nextDiff - prevDiff;
};

const getYForDistance = ({
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
	return (
		getFactorForNextAndPrev({nextChange, prevChange, currentWords, index}) * 70
	);
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
	console.log({next, prev});
	if (next > 0) {
		return 1 - next;
	}
	if (prev > 0) {
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
	return Math.abs(widthChange);
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
	return (
		getWidthChange(nextChange, currentWords, index) *
			getFactorForDist(nextChange, currentWords, index) *
			0.5 +
		getWidthChange(prevChange, currentWords, index) *
			getFactorForDist(prevChange, currentWords, index) *
			-0.5
	);
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
		<div
			style={{
				flex: 1,
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'column',
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
					const nextChange = getNextChange(frame, videoConfig.durationInFrames);
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
								marginTop: getYForDistance({
									nextChange,
									prevChange: previousChange,
									currentWords: wordsToUse,
									index: i,
								}),
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
	);
};

registerVideo(Comp, {
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 3 * 30,
});
