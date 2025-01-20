import type {Av1CBox} from './containers/iso-base-media/stsd/av1c';
import type {AvccBox} from './containers/iso-base-media/stsd/avcc';
import type {ColorParameterBox} from './containers/iso-base-media/stsd/colr';
import type {HvccBox} from './containers/iso-base-media/stsd/hvcc';
import type {PaspBox} from './containers/iso-base-media/stsd/pasp';
import type {VideoSample} from './containers/iso-base-media/stsd/samples';
import type {TkhdBox} from './containers/iso-base-media/tkhd';
import type {TrakBox} from './containers/iso-base-media/trak/trak';
import {getStsdBox} from './containers/iso-base-media/traversal';
import type {Dimensions} from './get-dimensions';

type AspectRatio = {
	numerator: number;
	denominator: number;
};

export const getStsdVideoConfig = (trakBox: TrakBox): VideoSample | null => {
	const stsdBox = getStsdBox(trakBox);

	if (!stsdBox) {
		return null;
	}

	const videoConfig = stsdBox.samples.find((s) => s.type === 'video');
	if (!videoConfig || videoConfig.type !== 'video') {
		return null;
	}

	return videoConfig;
};

export const getAvccBox = (trakBox: TrakBox): AvccBox | null => {
	const videoConfig = getStsdVideoConfig(trakBox);
	if (!videoConfig) {
		return null;
	}

	const avccBox = videoConfig.descriptors.find((c) => c.type === 'avcc-box');

	if (!avccBox || avccBox.type !== 'avcc-box') {
		return null;
	}

	return avccBox;
};

export const getAv1CBox = (trakBox: TrakBox): Av1CBox | null => {
	const videoConfig = getStsdVideoConfig(trakBox);
	if (!videoConfig) {
		return null;
	}

	const av1cBox = videoConfig.descriptors.find((c) => c.type === 'av1C-box');

	if (!av1cBox || av1cBox.type !== 'av1C-box') {
		return null;
	}

	return av1cBox;
};

export const getPaspBox = (trakBox: TrakBox): PaspBox | null => {
	const videoConfig = getStsdVideoConfig(trakBox);
	if (!videoConfig) {
		return null;
	}

	const paspBox = videoConfig.descriptors.find((c) => c.type === 'pasp-box');

	if (!paspBox || paspBox.type !== 'pasp-box') {
		return null;
	}

	return paspBox;
};

export const getHvccBox = (trakBox: TrakBox): HvccBox | null => {
	const videoConfig = getStsdVideoConfig(trakBox);
	if (!videoConfig) {
		return null;
	}

	const hvccBox = videoConfig.descriptors.find((c) => c.type === 'hvcc-box');

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

export const getColrBox = (
	videoSample: VideoSample,
): ColorParameterBox | null => {
	const colrBox = videoSample.descriptors.find((c) => c.type === 'colr-box');

	if (!colrBox || colrBox.type !== 'colr-box') {
		return null;
	}

	return colrBox;
};

export const applyTkhdBox = (
	aspectRatioApplied: Dimensions,
	tkhdBox: TkhdBox,
): {
	displayAspectWidth: number;
	displayAspectHeight: number;
	width: number;
	height: number;
	rotation: number;
} => {
	if (tkhdBox === null || tkhdBox.rotation === 0) {
		return {
			displayAspectWidth: aspectRatioApplied.width,
			displayAspectHeight: aspectRatioApplied.height,
			width: aspectRatioApplied.width,
			height: aspectRatioApplied.height,
			rotation: 0,
		};
	}

	return {
		width: tkhdBox.width,
		height: tkhdBox.height,
		rotation: tkhdBox.rotation,
		displayAspectWidth: aspectRatioApplied.width,
		displayAspectHeight: aspectRatioApplied.height,
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

	const newWidth = Math.round(
		(dimensions.width * sampleAspectRatio.numerator) /
			sampleAspectRatio.denominator,
	);
	const newHeight = Math.floor(
		newWidth / (displayAspectRatio.numerator / displayAspectRatio.denominator),
	);

	return {
		width: Math.floor(newWidth),
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
