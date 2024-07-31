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
import type {CloudProvider} from './still';

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
	lambdaVersion: string;
	region: Provider['region'];
	renderId: string;
	outName: OutNameInputWithoutCredentials | undefined;
	privacy: Privacy;
	deleteAfter: DeleteAfter | null;
	numberOfGifLoops: number | null;
	audioBitrate: string | null;
	downloadBehavior: DownloadBehavior;
};
