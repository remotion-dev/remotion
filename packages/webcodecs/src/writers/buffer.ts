import type {MediaParserInternalTypes} from '@remotion/media-parser';
import {createContent} from './buffer-implementation/writer';

export const bufferWriter: MediaParserInternalTypes['WriterInterface'] = {
	createContent,
};
