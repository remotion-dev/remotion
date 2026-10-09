import type {DownloadBehavior} from 'remotion/no-react';
import type {CustomCredentials} from './constants';
import type {CloudProvider} from './types';

export type ImageSequenceFormat = 'png' | 'jpeg';

export type ImageSequenceOutputPrefix<Provider extends CloudProvider> =
	| string
	| {
			bucketName: string;
			keyPrefix: string;
			s3OutputProvider?: CustomCredentials<Provider>;
	  };

export type ServerlessRenderOutput<Provider extends CloudProvider> =
	| {type: 'media'}
	| {
			type: 'sequence';
			outputPrefix: ImageSequenceOutputPrefix<Provider> | null;
			imageSequencePattern: string | null;
	  };

export type ImageSequenceOutput = {
	bucketName: string;
	keyPrefix: string;
	manifestKey: string;
	manifestUrl: string;
	imageFormat: ImageSequenceFormat;
	frameCount: number;
};

export type ImageSequenceManifest = {
	renderId: string;
	imageFormat: ImageSequenceFormat;
	width: number;
	height: number;
	fps: number;
	frameRange: [number, number];
	everyNthFrame: number;
	frames: {frame: number; key: string}[];
};

export type RendererOutput<Provider extends CloudProvider> =
	| {type: 'media'}
	| {
			type: 'sequence';
			bucketName: string;
			keyPrefix: string;
			imageFormat: ImageSequenceFormat;
			imageSequencePattern: string;
			framePadding: number;
			customCredentials: CustomCredentials<Provider> | null;
			storageClass: Provider['storageClass'] | null;
			downloadBehavior: DownloadBehavior;
	  };

export const getImageSequenceFrameKey = ({
	frame,
	keyPrefix,
	imageSequencePattern,
	imageFormat,
	framePadding,
}: {
	frame: number;
	keyPrefix: string;
	imageSequencePattern: string;
	imageFormat: ImageSequenceFormat;
	framePadding: number;
}) => {
	return (
		keyPrefix +
		imageSequencePattern
			.replace(/\[frame\]/g, String(frame).padStart(framePadding, '0'))
			.replace(/\[ext\]/g, imageFormat)
	);
};
