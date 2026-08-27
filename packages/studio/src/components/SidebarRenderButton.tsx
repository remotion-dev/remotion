import type {
	AudioCodec,
	Codec,
	ColorSpace,
	LogLevel,
	OpenGlRenderer,
	X264Preset,
} from '@remotion/renderer';
import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVER_GROUP_REVEAL_CLASS_NAME,
	NO_HOVER_BACKGROUND_STYLE,
} from '../helpers/hoverable';
import {ThinRenderIcon} from '../icons/render';
import {SetSelectedModalContext} from '../state/modals';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';

const revealStyle: React.CSSProperties = {
	display: 'flex',
};

export const SidebarRenderButton: React.FC<{
	readonly composition: _InternalTypes['AnyCompMetadata'];
	readonly visible: boolean;
	readonly readOnlyStudio: boolean;
}> = ({composition, visible, readOnlyStudio}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 12,
			},
		};
	}, []);

	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const {props} = useContext(Internals.EditorPropsContext);

	const onClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(e) => {
			const defaults = window.remotion_renderDefaults;
			if (!defaults) {
				throw new Error('expected defaults');
			}

			e.stopPropagation();
			setSelectedModal({
				type: 'server-render',
				compositionId: composition.id,
				initialFrame: 0,
				initialVideoImageFormat: defaults.videoImageFormat,
				initialStillImageFormat: defaults.stillImageFormat,
				initialJpegQuality: defaults.jpegQuality,
				initialScale: defaults.scale,
				initialLogLevel: defaults.logLevel as LogLevel,
				initialConcurrency: defaults.concurrency,
				maxConcurrency: defaults.maxConcurrency,
				minConcurrency: defaults.minConcurrency,
				initialMuted: defaults.muted,
				initialEnforceAudioTrack: defaults.enforceAudioTrack,
				initialProResProfile:
					defaults.proResProfile as _InternalTypes['ProResProfile'],
				initialx264Preset: defaults.x264Preset as X264Preset,
				initialGopSize: defaults.gopSize,
				initialPixelFormat: null,
				initialAudioBitrate: defaults.audioBitrate,
				initialVideoBitrate: defaults.videoBitrate,
				initialEveryNthFrame: defaults.everyNthFrame,
				initialNumberOfGifLoops: defaults.numberOfGifLoops,
				initialDelayRenderTimeout: defaults.delayRenderTimeout,
				defaultConfigurationAudioCodec: defaults.audioCodec as AudioCodec,
				initialEnvVariables: window.process.env as Record<string, string>,
				initialDisableWebSecurity: defaults.disableWebSecurity,
				initialOpenGlRenderer: defaults.openGlRenderer as OpenGlRenderer | null,
				initialHeadless: defaults.headless,
				initialOffthreadVideoCacheSizeInBytes:
					defaults.offthreadVideoCacheSizeInBytes,
				initialOffthreadVideoThreads: defaults.offthreadVideoThreads,
				initialIgnoreCertificateErrors: defaults.ignoreCertificateErrors,
				defaultProps: props[composition.id] ?? composition.defaultProps,
				inFrameMark: null,
				outFrameMark: null,
				initialColorSpace: defaults.colorSpace as ColorSpace,
				initialMultiProcessOnLinux: defaults.multiProcessOnLinux,
				defaultConfigurationVideoCodec: defaults.codec as Codec,
				initialEncodingBufferSize: defaults.encodingBufferSize,
				initialEncodingMaxRate: defaults.encodingMaxRate,
				initialUserAgent: defaults.userAgent,
				initialBeep: defaults.beepOnFinish,
				initialRepro: defaults.repro,
				initialForSeamlessAacConcatenation:
					defaults.forSeamlessAacConcatenation,
				renderTypeOfLastRender: null,
				defaulMetadata: defaults.metadata,
				initialHardwareAcceleration: defaults.hardwareAcceleration,
				initialSampleRate: defaults.sampleRate,
				initialChromeMode: defaults.chromeMode,
				initialMediaCacheSizeInBytes: defaults.mediaCacheSizeInBytes,
				renderDefaults: defaults,
				initialDarkMode: defaults.darkMode,
				readOnlyStudio,
			});
		},
		[
			composition.defaultProps,
			composition.id,
			props,
			readOnlyStudio,
			setSelectedModal,
		],
	);

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return <ThinRenderIcon fill={color} svgProps={iconStyle} />;
		},
		[iconStyle],
	);

	if (!visible || (connectionStatus !== 'connected' && !readOnlyStudio)) {
		return null;
	}

	return (
		<div className={HOVER_GROUP_REVEAL_CLASS_NAME} style={revealStyle}>
			<InlineAction
				renderAction={renderAction}
				onClick={onClick}
				variant={null}
				style={NO_HOVER_BACKGROUND_STYLE}
				className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
			/>
		</div>
	);
};
