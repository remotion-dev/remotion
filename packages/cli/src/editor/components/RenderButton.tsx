import type {
	Codec,
	LogLevel,
	PixelFormat,
	ProResProfile,
} from '@remotion/renderer';
import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import type {TCompMetadata} from 'remotion';
import {getDefaultOutLocation} from '../../get-default-out-name';
import {getDefaultCodecs} from '../../preview-server/render-queue/get-default-video-contexts';
import {RenderIcon} from '../icons/render';
import {ModalsContext} from '../state/modals';
import {InlineAction} from './InlineAction';

export const RenderButton: React.FC<{
	composition: TCompMetadata;
	visible: boolean;
}> = ({composition, visible}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 12,
			},
		};
	}, []);

	const isVideo = composition.durationInFrames > 1;
	const onClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
		(e) => {
			const defaults = window.remotion_renderDefaults;
			if (!defaults) {
				throw new Error('expected defaults');
			}

			e.stopPropagation();
			const {initialAudioCodec, initialRenderType, initialVideoCodec} =
				getDefaultCodecs({
					defaultCodec: defaults.codec as Codec,
					isStill: !isVideo,
				});
			setSelectedModal({
				type: 'render',
				compositionId: composition.id,
				initialFrame: 0,
				initialVideoImageFormat: defaults.videoImageFormat,
				initialStillImageFormat: defaults.stillImageFormat,
				initialQuality: defaults.quality,
				initialScale: defaults.scale,
				initialVerbose: (defaults.logLevel as LogLevel) === 'verbose',
				initialOutName: getDefaultOutLocation({
					compositionName: composition.id,
					defaultExtension: isVideo ? 'mp4' : 'png',
					type: 'asset',
				}),
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
				initialAudioBitrate: defaults.audioBitrate,
				initialVideoBitrate: defaults.videoBitrate,
				initialEveryNthFrame: defaults.everyNthFrame,
				initialNumberOfGifLoops: defaults.numberOfGifLoops,
				initialDelayRenderTimeout: defaults.delayRenderTimeout,
			});
		},
		[composition.id, isVideo, setSelectedModal]
	);

	if (!visible) {
		return null;
	}

	return (
		<InlineAction onClick={onClick}>
			<RenderIcon svgProps={iconStyle} />
		</InlineAction>
	);
};
