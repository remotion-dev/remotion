import type {StreamTargetChunk} from 'mediabunny';

export type VideoLayerOutputTarget = 'arraybuffer' | 'web-fs';

export type VideoLayerOutputOptions =
	| {
			outputTarget?: VideoLayerOutputTarget;
			outputWritable?: never;
	  }
	| {
			outputTarget?: never;
			outputWritable: WritableStream<StreamTargetChunk>;
	  };

export type VideoLayerOutput = {
	getBlob: () => Promise<Blob>;
	dispose: () => Promise<void>;
};
