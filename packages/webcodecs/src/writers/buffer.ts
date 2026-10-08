import type {WriterInterface} from '@remotion/media-parser';
import {createContent} from './buffer-implementation/writer';

/**
 * @deprecated Use Mediabunny instead: https://www.remotion.dev/docs/mediabunny
 */
export const bufferWriter: WriterInterface = {
	createContent,
};
