import {
	registerVideo,
	spring2,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import styled from 'styled-components';

const textStyle = {
	fontFamily: 'SF Pro Text',
	fontWeight: 700,
	fontSize: '110px',
	lineHeight: '110px',
	height: 110,
	whiteSpace: 'pre',
};

const widths: {[key: string]: number} = {};

const measureTextNode = (text: string): number => {
	if (widths[text]) {
		return widths[text];
	}
	const el = document.createElement('span');
	Object.assign(el.style, textStyle);
	el.textContent = text;
	el.style.position = 'absolute';
	el.style.top = '-1000px';
	document.body.appendChild(el);
	widths[text] = el.offsetWidth;
	return widths[text];
};

const Text = styled.span``;

const words: [string, string, string, string][] = [
	['Stickerify', ' ', 'any', 'body'],
	['Stickerify', ' ', 'any', 'thing'],
	['Stickerify', ' ', 'every', 'thing'],
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
	wordArray: string[];
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
	words: [string, string, string, string];
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

const getFactorForDist = (
	change: Change,
	currentWords: [string, string, string, string],
	index: number
) => {
	if (change === null) {
		return 0;
	}
	if (currentWords[index] === change.words[index]) {
		return 0;
	}
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
	currentWords: [string, string, string, string];
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
	currentWords: [string, string, string, string],
	index: number
) => {
	const factor = getFactorForDist(change, currentWords, index);
	if (factor === 0 || change === null) {
		return 0;
	}
	const widthChange =
		measureTextNode(change.words[index]) - measureTextNode(currentWords[index]);
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
	currentWords: [string, string, string, string];
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
		measureTextNode(word) +
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
	const scale = spring2({
		config: {
			damping: 100,
			mass: 10,
			stiffness: 80,
			restSpeedThreshold: 0.00001,
			restDisplacementThreshold: 0.0001,
			overshootClamping: false,
		},
		fps: 30,
		frame,
		from: 0.8,
		to: 0.95,
	});
	return (
		<div style={{display: 'flex', flex: 1, backgroundColor: 'white'}}>
			<div
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					transform: `scale(${scale})`,
				}}
			>
				{/**
				// @ts-ignore */}
				<Text style={textStyle}>
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
								key={w + i}
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
	durationInFrames: 5 * 30,
});
