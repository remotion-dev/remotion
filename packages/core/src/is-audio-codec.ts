import type {Codec} from './config';

export const isAudioCodec = (codec: Codec | undefined) => {
	return codec === 'mp3' || codec === 'aac' || codec === 'wav';
};
