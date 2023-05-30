import type {
	AudioCodec,
	Codec,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import type React from 'react';
import {createContext} from 'react';
import type {QuickSwitcherMode} from '../components/QuickSwitcher/NoResults';
import type {RenderType} from '../components/RenderModal/RenderModalAdvanced';
import type {UpdateInfo} from '../components/UpdateCheck';

export type CompType = 'composition' | 'still';

export type RenderModalState = {
	type: 'render';
	compositionId: string;
	initialFrame: number;
	initialStillImageFormat: StillImageFormat;
	initialVideoImageFormat: VideoImageFormat;
	initialJpegQuality: number;
	initialOutName: string;
	initialScale: number;
	initialVerbose: boolean;
	initialRenderType: RenderType;
	initialVideoCodecForAudioTab: Codec;
	initialVideoCodecForVideoTab: Codec;
	initialAudioCodec: AudioCodec | null;
	initialConcurrency: number;
	initialMuted: boolean;
	initialEnforceAudioTrack: boolean;
	initialProResProfile: ProResProfile;
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
	minConcurrency: number;
	maxConcurrency: number;
	defaultProps: Record<string, unknown>;
	inFrameMark: number | null;
	outFrameMark: number | null;
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
