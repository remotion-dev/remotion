import type {ComponentType, LazyExoticComponent} from 'react';
import React from 'react';
import type {AnyZodObject} from 'zod';
import type {CalculateMetadataFunction} from './Composition.js';
import type {DownloadBehavior} from './download-behavior.js';
import type {InferProps, PropsIfHasProps} from './props-if-has-props.js';

export type TComposition<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	width: number | undefined;
	height: number | undefined;
	fps: number | undefined;
	durationInFrames: number | undefined;
	id: string;
	folderName: string | null;
	parentFolderName: string | null;
	component: LazyExoticComponent<ComponentType<Props>> | ComponentType<Props>;
	nonce: number;
	schema: Schema | null;
	calculateMetadata: CalculateMetadataFunction<
		InferProps<Schema, Props>
	> | null;
} & PropsIfHasProps<Schema, Props>;

export type AnyComposition = TComposition<
	AnyZodObject,
	Record<string, unknown>
>;

export type TCompMetadataWithCalcFunction<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = Pick<
	TComposition<Schema, Props>,
	| 'id'
	| 'height'
	| 'width'
	| 'fps'
	| 'durationInFrames'
	| 'defaultProps'
	| 'calculateMetadata'
>;

export type TCompMetadata<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = Pick<
	TComposition<Schema, Props>,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames' | 'defaultProps'
>;

export type AnyCompMetadata = TCompMetadata<
	AnyZodObject,
	Record<string, unknown>
>;

type EnhancedTSequenceData =
	| {
			type: 'sequence';
	  }
	| {
			type: 'audio';
			src: string;
			// Volume is represented as a comma separated list - if it's a string
			// React can more efficiently update and will not rerender if anonymous functions
			// are passed.
			// If not a function was passed, a number is being used
			volume: string | number;
			doesVolumeChange: boolean;
			startMediaFrom: number;
			playbackRate: number;
	  }
	| {
			type: 'video';
			src: string;
			volume: string | number;
			doesVolumeChange: boolean;
			startMediaFrom: number;
			playbackRate: number;
	  };

export type LoopDisplay = {
	numberOfTimes: number;
	startOffset: number;
	durationInFrames: number;
};

export type TSequence = {
	from: number;
	duration: number;
	id: string;
	displayName: string;
	parent: string | null;
	rootId: string;
	showInTimeline: boolean;
	nonce: number;
	loopDisplay: LoopDisplay | undefined;
	stack: string | null;
	premountDisplay: number | null;
	postmountDisplay: number | null;
} & EnhancedTSequenceData;

export type AudioOrVideoAsset = {
	type: 'audio' | 'video';
	src: string;
	id: string;
	frame: number;
	volume: number;
	mediaFrame: number;
	playbackRate: number;
	toneFrequency: number;
	audioStartFrame: number;
	audioStreamIndex: number;
};

export type InlineAudioAsset = {
	type: 'inline-audio';
	id: string;
	audio: Int16Array | number[];
	frame: number;
	timestamp: number;
	duration: number;
	toneFrequency: number;
};

type DiscriminatedArtifact =
	| {
			contentType: 'binary';
			content: string;
	  }
	| {
			contentType: 'text';
			content: string;
	  }
	| {
			contentType: 'thumbnail';
	  };

export type ArtifactAsset = {
	type: 'artifact';
	id: string;
	filename: string;
	frame: number;
	downloadBehavior: DownloadBehavior | null;
} & DiscriminatedArtifact;

export type TRenderAsset = AudioOrVideoAsset | ArtifactAsset | InlineAudioAsset;

export const compositionsRef = React.createRef<{
	getCompositions: () => AnyComposition[];
}>();
