import type {Codec} from './codec';

export const isAudioCodec = (codec: Codec | undefined | null) => {
	return codec === 'mp3' || codec === 'aac' || codec === 'wav';
};
