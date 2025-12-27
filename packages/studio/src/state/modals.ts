import type {
	AudioCodec,
	ChromeMode,
	Codec,
	ColorSpace,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	StillImageFormat,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import type {PackageManager, RenderDefaults} from '@remotion/studio-shared';
import type React from 'react';
import {createContext} from 'react';
import type {_InternalTypes} from 'remotion';
import type {CompType} from '../components/NewComposition/DuplicateComposition';
import type {QuickSwitcherMode} from '../components/QuickSwitcher/NoResults';
import type {RenderType} from '../components/RenderModal/RenderModalAdvanced';
import type {Bug, UpdateInfo} from '../components/UpdateCheck';

export type WebRenderModalState = {
	type: 'web-render';
	initialFrame: number;
	compositionId: string;
	defaultProps: Record<string, unknown>;
	inFrameMark: number | null;
	outFrameMark: number | null;
	initialLogLevel: LogLevel;
};

export type RenderModalState = {
	type: 'server-render';
	compositionId: string;
	initialFrame: number;
	initialStillImageFormat: StillImageFormat;
	initialVideoImageFormat: VideoImageFormat | null;
	initialJpegQuality: number;
	initialScale: number;
	initialLogLevel: LogLevel;
	initialConcurrency: number;
	initialMuted: boolean;
	initialEnforceAudioTrack: boolean;
	initialProResProfile: _InternalTypes['ProResProfile'] | null;
	initialx264Preset: X264Preset;
	initialPixelFormat: PixelFormat | null;
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
	initialDarkMode: boolean;
	initialMediaCacheSizeInBytes: number | null;
	initialOffthreadVideoCacheSizeInBytes: number | null;
	initialOffthreadVideoThreads: number | null;
	initialColorSpace: ColorSpace;
	initialMultiProcessOnLinux: boolean;
	initialUserAgent: string | null;
	initialEncodingMaxRate: string | null;
	initialEncodingBufferSize: string | null;
	initialForSeamlessAacConcatenation: boolean;
	initialHardwareAcceleration: HardwareAccelerationOption;
	initialBeep: boolean;
	initialRepro: boolean;
	initialChromeMode: ChromeMode;
	minConcurrency: number;
	maxConcurrency: number;
	defaultProps: Record<string, unknown>;
	inFrameMark: number | null;
	outFrameMark: number | null;
	defaultConfigurationVideoCodec: Codec;
	defaultConfigurationAudioCodec: AudioCodec | null;
	renderTypeOfLastRender: RenderType | null;
	defaulMetadata: Record<string, string> | null;
	renderDefaults: RenderDefaults;
};

export type ModalState =
	| {
			type: 'duplicate-comp';
			compositionId: string;
			compositionType: CompType;
	  }
	| {
			type: 'delete-comp';
			compositionId: string;
	  }
	| {
			type: 'rename-comp';
			compositionId: string;
	  }
	| {
			type: 'input-props-override';
	  }
	| RenderModalState
	| WebRenderModalState
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
			type: 'install-packages';
			packageManager: PackageManager;
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
