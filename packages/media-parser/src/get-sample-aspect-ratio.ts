import type {AvccBox, HvccBox} from './boxes/iso-base-media/stsd/avcc-hvcc';
import type {PaspBox} from './boxes/iso-base-media/stsd/pasp';
import type {VideoSample} from './boxes/iso-base-media/stsd/samples';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import {getStsdBox} from './traversal';

type SampleAspectRatio = {
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

export const getSampleAspectRatio = (trakBox: TrakBox): SampleAspectRatio => {
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
