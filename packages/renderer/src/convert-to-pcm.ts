import {copyFileSync} from 'fs';
import type {PreprocessedAudioTrack} from './preprocess-audio-track';

export const convertToPcm = ({
	input,
	outName,
}: {
	input: PreprocessedAudioTrack;
	outName: string;
}) => {
	copyFileSync(input.outName, outName);
};
