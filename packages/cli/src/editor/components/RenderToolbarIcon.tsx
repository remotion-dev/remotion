import type {
	AudioCodec,
	Codec,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {getDefaultOutLocation} from '../../get-default-out-name';
import {Button} from '../../preview-server/error-overlay/remotion-overlay/Button';
import {getDefaultCodecs} from '../../preview-server/render-queue/get-default-video-contexts';
import {PreviewServerConnectionCtx} from '../helpers/client-id';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {RenderIcon} from '../icons/render';
import {ModalsContext} from '../state/modals';
import {Row, Spacing} from './layout';

const button: React.CSSProperties = {
	paddingLeft: 7,
	paddingRight: 7,
	paddingTop: 7,
	paddingBottom: 7,
};

const label: React.CSSProperties = {
	fontSize: 14,
};

export const RenderButton: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {type} = useContext(PreviewServerConnectionCtx);

	const shortcut = areKeyboardShortcutsDisabled() ? '' : '(R)';
	const tooltip =
		type === 'connected'
			? 'Export the current composition ' + shortcut
			: 'Connect to the preview server to render';

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 16,
			},
		};
	}, []);

	const video = Internals.useVideo();
	const frame = useCurrentFrame();

	const {props} = useContext(Internals.EditorPropsContext);

	const onClick = useCallback(() => {
		if (!video) {
			return null;
		}

		const isVideo = video.durationInFrames > 1;

		const defaults = window.remotion_renderDefaults;

		if (!defaults) {
			throw new TypeError('Expected defaults');
		}

		const {initialAudioCodec, initialRenderType, initialVideoCodec} =
			getDefaultCodecs({
				defaultCodec: defaults.codec as Codec,
				isStill: !isVideo,
			});

		setSelectedModal({
			type: 'render',
			compositionId: video.id,
			initialFrame: frame,
			initialStillImageFormat: defaults.stillImageFormat,
			initialVideoImageFormat: defaults.videoImageFormat,
			initialOutName: getDefaultOutLocation({
				compositionName: video.id,
				defaultExtension: isVideo
					? BrowserSafeApis.getFileExtensionFromCodec(
							initialVideoCodec,
							defaults.audioCodec as AudioCodec
					  )
					: defaults.stillImageFormat,
				type: 'asset',
			}),
			initialJpegQuality: defaults.jpegQuality,
			initialScale: window.remotion_renderDefaults?.scale ?? 1,
			initialVerbose: (defaults.logLevel as LogLevel) === 'verbose',
			initialVideoCodecForAudioTab: initialAudioCodec,
			initialRenderType,
			initialVideoCodecForVideoTab: initialVideoCodec,
			initialConcurrency: defaults.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: defaults.muted,
			initialEnforceAudioTrack: defaults.enforceAudioTrack,
			initialProResProfile: defaults.proResProfile as ProResProfile,
			initialPixelFormat: defaults.pixelFormat as PixelFormat,
			initialAudioBitrate: defaults.audioBitrate,
			initialVideoBitrate: defaults.videoBitrate,
			initialEveryNthFrame: defaults.everyNthFrame,
			initialNumberOfGifLoops: defaults.numberOfGifLoops,
			initialDelayRenderTimeout: defaults.delayRenderTimeout,
			initialAudioCodec: defaults.audioCodec as AudioCodec | null,
			initialEnvVariables: window.process.env as Record<string, string>,
			initialDisableWebSecurity: defaults.disableWebSecurity,
			initialOpenGlRenderer: defaults.openGlRenderer as OpenGlRenderer | null,
			initialHeadless: defaults.headless,
			initialIgnoreCertificateErrors: defaults.ignoreCertificateErrors,
			defaultProps: props[video.id] ?? video.defaultProps,
		});
	}, [video, setSelectedModal, frame, props]);

	if (!video) {
		return null;
	}

	return (
		<Button
			id="render-modal-button"
			title={tooltip}
			onClick={onClick}
			buttonContainerStyle={button}
		>
			<Row align="center">
				<RenderIcon svgProps={iconStyle} />
				<Spacing x={1} />
				<span style={label}>Render</span>
			</Row>
		</Button>
	);
};
