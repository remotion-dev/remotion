import type {WriterInterface} from '@remotion/media-parser';
import {createContent} from './buffer-implementation/writer';

export const bufferWriter: WriterInterface = {
	createContent,
};
