import type {
	AudioCodec,
	DeleteAfter,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import type {
	DownloadBehavior,
	OutNameInputWithoutCredentials,
	Privacy,
	SerializedInputProps,
	ServerlessCodec,
} from './constants';
import type {CloudProvider} from './types';

type Discriminated =
	| {
			type: 'still';
			imageFormat: StillImageFormat;
			codec: null;
	  }
	| {
			type: 'video';
			imageFormat: VideoImageFormat;
			muted: boolean;
			frameRange: [number, number];
			everyNthFrame: number;
			codec: ServerlessCodec;
	  };

type Dimensions = {
	width: number;
	height: number;
};

export type RenderMetadata<Provider extends CloudProvider> = Discriminated & {
	siteId: string;
	startedDate: number;
	totalChunks: number;
	estimatedTotalLambdaInvokations: number;
	estimatedRenderLambdaInvokations: number;
	compositionId: string;
	audioCodec: AudioCodec | null;
	inputProps: SerializedInputProps;
	framesPerLambda: number;
	memorySizeInMb: number;
	functionName: string;
	rendererFunctionName: string;
	lambdaVersion: string;
	region: Provider['region'];
	renderId: string;
	outName: OutNameInputWithoutCredentials | undefined;
	privacy: Privacy;
	deleteAfter: DeleteAfter | null;
	numberOfGifLoops: number | null;
	audioBitrate: string | null;
	downloadBehavior: DownloadBehavior;
	metadata: Record<string, string> | null;
	dimensions: Dimensions;
};
