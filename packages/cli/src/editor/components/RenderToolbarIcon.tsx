import type {
	AudioCodec,
	Codec,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {getDefaultOutLocation} from '../../get-default-out-name';
import {getDefaultCodecs} from '../../preview-server/render-queue/get-default-video-contexts';
import {PreviewServerConnectionCtx} from '../helpers/client-id';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {RenderIcon} from '../icons/render';
import {ModalsContext} from '../state/modals';
import {Spacing} from './layout';

const button: React.CSSProperties = {
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	borderRadius: 4,
	backgroundColor: INPUT_BACKGROUND,
	appearance: 'none',
	fontFamily: 'inherit',
	fontSize: 14,
	color: 'white',
	flexDirection: 'row',
	height: '39px',
	paddingLeft: '10px',
	paddingRight: '10px',
	display: 'flex',
	alignItems: 'center',
};

export const RenderButton: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {type} = useContext(PreviewServerConnectionCtx);

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 18,
			},
		};
	}, []);
	const shortcut = areKeyboardShortcutsDisabled() ? '' : '(R)';
	const tooltip =
		type === 'connected'
			? 'Export the current composition ' + shortcut
			: 'Connect to the preview server to render';

	const video = Internals.useVideo();
	const frame = useCurrentFrame();
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
					? defaults.stillImageFormat
					: RenderInternals.getFileExtensionFromCodec(
							initialVideoCodec,
							defaults.audioCodec as AudioCodec
					  ),
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
		});
	}, [video, frame, setSelectedModal]);

	if (!video) {
		return null;
	}

	return (
		<button type={'button'} title={tooltip} onClick={onClick} style={button}>
			<RenderIcon svgProps={iconStyle} />
			<Spacing x={2} />
			Render
		</button>
	);
};
