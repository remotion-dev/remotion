import {createContent} from './buffer-implementation/writer';
import type {WriterInterface} from './writer';

export const bufferWriter: WriterInterface = {
	createContent,
};
