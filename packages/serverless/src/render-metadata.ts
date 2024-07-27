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

export type RenderMetadata<Region extends string> = Discriminated & {
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
	lambdaVersion: string;
	region: Region;
	renderId: string;
	outName: OutNameInputWithoutCredentials | undefined;
	privacy: Privacy;
	deleteAfter: DeleteAfter | null;
	numberOfGifLoops: number | null;
	audioBitrate: string | null;
	downloadBehavior: DownloadBehavior;
};
