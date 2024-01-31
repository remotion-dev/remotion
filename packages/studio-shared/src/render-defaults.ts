import type {
	AudioCodec,
	Codec,
	ColorSpace,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import type {GitSource} from './git-source';

export type RenderDefaults = {
	jpegQuality: number;
	scale: number;
	logLevel: LogLevel;
	codec: Codec;
	concurrency: number;
	minConcurrency: number;
	muted: boolean;
	maxConcurrency: number;
	stillImageFormat: StillImageFormat;
	videoImageFormat: VideoImageFormat;
	audioCodec: AudioCodec | null;
	enforceAudioTrack: boolean;
	proResProfile: ProResProfile;
	x264Preset: X264Preset;
	pixelFormat: PixelFormat;
	audioBitrate: string | null;
	videoBitrate: string | null;
	encodingBufferSize: string | null;
	encodingMaxRate: string | null;
	userAgent: string | null;
	everyNthFrame: number;
	numberOfGifLoops: number | null;
	delayRenderTimeout: number;
	disableWebSecurity: boolean;
	openGlRenderer: OpenGlRenderer | null;
	ignoreCertificateErrors: boolean;
	offthreadVideoCacheSizeInBytes: number | null;
	headless: boolean;
	colorSpace: ColorSpace;
	multiProcessOnLinux: boolean;
	beepOnFinish: boolean;
	repro: boolean;
};

declare global {
	interface Window {
		remotion_renderDefaults: RenderDefaults | undefined;
		remotion_gitSource: GitSource | null;
	}
}
