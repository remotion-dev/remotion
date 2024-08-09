import type {AvccBox, HvccBox} from './boxes/iso-base-media/stsd/avcc-hvcc';
import type {PaspBox} from './boxes/iso-base-media/stsd/pasp';
import type {VideoSample} from './boxes/iso-base-media/stsd/samples';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import type {Dimensions} from './get-dimensions';
import {getStsdBox} from './traversal';

type AspectRatio = {
	numerator: number;
	denominator: number;
};

export const getVideoSample = (trakBox: TrakBox): VideoSample | null => {
	const stsdBox = getStsdBox(trakBox);

	if (!stsdBox) {
		return null;
	}

	const videoSample = stsdBox.samples.find((s) => s.type === 'video');
	if (!videoSample || videoSample.type !== 'video') {
		return null;
	}

	return videoSample;
};

export const getAvccBox = (trakBox: TrakBox): AvccBox | null => {
	const videoSample = getVideoSample(trakBox);
	if (!videoSample) {
		return null;
	}

	const avccBox = videoSample.descriptors.find((c) => c.type === 'avcc-box');

	if (!avccBox || avccBox.type !== 'avcc-box') {
		return null;
	}

	return avccBox;
};

export const getPaspBox = (trakBox: TrakBox): PaspBox | null => {
	const videoSample = getVideoSample(trakBox);
	if (!videoSample) {
		return null;
	}

	const paspBox = videoSample.descriptors.find((c) => c.type === 'pasp-box');

	if (!paspBox || paspBox.type !== 'pasp-box') {
		return null;
	}

	return paspBox;
};

export const getHvccBox = (trakBox: TrakBox): HvccBox | null => {
	const videoSample = getVideoSample(trakBox);
	if (!videoSample) {
		return null;
	}

	const hvccBox = videoSample.descriptors.find((c) => c.type === 'hvcc-box');

	if (!hvccBox || hvccBox.type !== 'hvcc-box') {
		return null;
	}

	return hvccBox;
};

export const getSampleAspectRatio = (trakBox: TrakBox): AspectRatio => {
	const paspBox = getPaspBox(trakBox);
	if (!paspBox) {
		return {
			numerator: 1,
			denominator: 1,
		};
	}

	return {
		numerator: paspBox.hSpacing,
		denominator: paspBox.vSpacing,
	};
};

export const applyAspectRatios = ({
	dimensions,
	sampleAspectRatio,
	displayAspectRatio,
}: {
	dimensions: Dimensions;
	sampleAspectRatio: AspectRatio;
	displayAspectRatio: AspectRatio;
}): Dimensions => {
	if (displayAspectRatio.numerator === 0) {
		return dimensions;
	}

	if (displayAspectRatio.denominator === 0) {
		return dimensions;
	}

	const newWidth = Math.max(
		Math.round(
			(dimensions.width * sampleAspectRatio.numerator) /
				sampleAspectRatio.denominator,
		),
		dimensions.width,
	);
	const newHeight = Math.round(
		newWidth / (displayAspectRatio.numerator / displayAspectRatio.denominator),
	);

	return {
		width: newWidth,
		height: newHeight,
	};
};

function gcd(a: number, b: number): number {
	return b === 0 ? a : gcd(b, a % b);
}

function reduceFraction(numerator: number, denominator: number) {
	const greatestCommonDivisor = gcd(Math.abs(numerator), Math.abs(denominator));
	return {
		numerator: numerator / greatestCommonDivisor,
		denominator: denominator / greatestCommonDivisor,
	};
}

export const getDisplayAspectRatio = ({
	sampleAspectRatio,
	nativeDimensions,
}: {
	sampleAspectRatio: AspectRatio;
	nativeDimensions: Dimensions;
}): AspectRatio => {
	const num = Math.round(nativeDimensions.width * sampleAspectRatio.numerator);
	const den = Math.round(
		nativeDimensions.height * sampleAspectRatio.denominator,
	);

	return reduceFraction(num, den);
};
