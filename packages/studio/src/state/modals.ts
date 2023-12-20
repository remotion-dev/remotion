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
import type React from 'react';
import {createContext} from 'react';
import type {QuickSwitcherMode} from '../components/QuickSwitcher/NoResults';
import type {Bug, UpdateInfo} from '../components/UpdateCheck';

export type CompType = 'composition' | 'still';

export type RenderModalState = {
	type: 'render';
	compositionId: string;
	initialFrame: number;
	initialStillImageFormat: StillImageFormat;
	initialVideoImageFormat: VideoImageFormat;
	initialJpegQuality: number;
	initialScale: number;
	initialLogLevel: LogLevel;
	initialConcurrency: number;
	initialMuted: boolean;
	initialEnforceAudioTrack: boolean;
	initialProResProfile: ProResProfile;
	initialx264Preset: X264Preset;
	initialPixelFormat: PixelFormat;
	initialVideoBitrate: string | null;
	initialAudioBitrate: string | null;
	initialEveryNthFrame: number;
	initialNumberOfGifLoops: number | null;
	initialDelayRenderTimeout: number;
	initialEnvVariables: Record<string, string>;
	initialDisableWebSecurity: boolean;
	initialOpenGlRenderer: OpenGlRenderer | null;
	initialIgnoreCertificateErrors: boolean;
	initialHeadless: boolean;
	initialOffthreadVideoCacheSizeInBytes: number | null;
	initialColorSpace: ColorSpace;
	initialMultiProcessOnLinux: boolean;
	initialUserAgent: string | null;
	initialEncodingMaxRate: string | null;
	initialEncodingBufferSize: string | null;
	minConcurrency: number;
	maxConcurrency: number;
	defaultProps: Record<string, unknown>;
	inFrameMark: number | null;
	outFrameMark: number | null;
	defaultConfigurationVideoCodec: Codec;
	defaultConfigurationAudioCodec: AudioCodec | null;
};

export type ModalState =
	| {
			type: 'new-comp';
			compType: CompType;
	  }
	| RenderModalState
	| {
			type: 'render-progress';
			jobId: string;
	  }
	| {
			type: 'update';
			info: UpdateInfo;
			knownBugs: Bug[];
	  }
	| {
			type: 'quick-switcher';
			mode: QuickSwitcherMode;
			invocationTimestamp: number;
	  };

export type ModalContextType = {
	selectedModal: ModalState | null;
	setSelectedModal: React.Dispatch<React.SetStateAction<ModalState | null>>;
};

export const ModalsContext = createContext<ModalContextType>({
	selectedModal: null,
	setSelectedModal: () => undefined,
});
