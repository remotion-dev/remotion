import type {
	Codec,
	LogLevel,
	PixelFormat,
	ProResProfile,
} from '@remotion/renderer';
import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {getDefaultOutLocation} from '../../get-default-out-name';
import {getDefaultCodecs} from '../../preview-server/render-queue/get-default-video-contexts';
import {PreviewServerConnectionCtx} from '../helpers/client-id';
import {RenderIcon} from '../icons/render';
import {ModalsContext} from '../state/modals';
import {ControlButton} from './ControlButton';

export const RenderStillButton: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {type} = useContext(PreviewServerConnectionCtx);

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 15,
			},
		};
	}, []);
	const tooltip =
		type === 'connected'
			? 'Export the current frame as a still image'
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
				defaultExtension: isVideo ? 'mp4' : 'png',
				type: 'asset',
			}),
			initialQuality: defaults.quality,
			initialScale: window.remotion_renderDefaults?.scale ?? 1,
			initialVerbose: (defaults.logLevel as LogLevel) === 'verbose',
			initialAudioCodec,
			initialRenderType,
			initialVideoCodec,
			initialConcurrency: defaults.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: defaults.muted,
			initialEnforceAudioTrack: defaults.enforceAudioTrack,
			initialProResProfile: defaults.proResProfile as ProResProfile,
			initialPixelFormat: defaults.pixelFormat as PixelFormat,
		});
	}, [video, frame, setSelectedModal]);

	if (!video) {
		return null;
	}

	return (
		<ControlButton
			id="render-modal-button"
			disabled={type !== 'connected'}
			title={tooltip}
			aria-label={tooltip}
			onClick={onClick}
		>
			<RenderIcon svgProps={iconStyle} />
		</ControlButton>
	);
};
