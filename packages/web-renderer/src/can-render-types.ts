import type {
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
	WebRendererVideoCodec,
} from './mediabunny-mappings';
import type {WebRendererOutputTarget} from './output-target';

export type CanRenderIssueType =
	| 'video-codec-unsupported'
	| 'audio-codec-unsupported'
	| 'webgl-unsupported'
	| 'webcodecs-unavailable'
	| 'container-codec-mismatch'
	| 'transparent-video-unsupported'
	| 'invalid-dimensions'
	| 'output-target-unsupported';

export type CanRenderIssue = {
	type: CanRenderIssueType;
	message: string;
	severity: 'error' | 'warning';
};

export type CanRenderMediaOnWebResult = {
	canRender: boolean;
	issues: CanRenderIssue[];
	resolvedVideoCodec: WebRendererVideoCodec;
	resolvedAudioCodec: WebRendererAudioCodec | null;
	resolvedOutputTarget: WebRendererOutputTarget;
};

export type CanRenderMediaOnWebOptions = {
	container?: WebRendererContainer;
	videoCodec?: WebRendererVideoCodec;
	audioCodec?: WebRendererAudioCodec | null;
	width: number;
	height: number;
	transparent?: boolean;
	muted?: boolean;
	videoBitrate?: number | WebRendererQuality;
	audioBitrate?: number | WebRendererQuality;
	outputTarget?: WebRendererOutputTarget | null;
};
