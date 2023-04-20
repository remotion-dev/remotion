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
import type {AnyCompMetadata} from 'remotion';
import {getDefaultOutLocation} from '../../get-default-out-name';
import {getDefaultCodecs} from '../../preview-server/render-queue/get-default-video-contexts';
import {ThinRenderIcon} from '../icons/render';
import {ModalsContext} from '../state/modals';
import {InlineAction} from './InlineAction';

export const RenderButton: React.FC<{
	composition: AnyCompMetadata;
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
				initialJpegQuality: defaults.jpegQuality,
				initialScale: defaults.scale,
				initialVerbose: (defaults.logLevel as LogLevel) === 'verbose',
				initialOutName: getDefaultOutLocation({
					compositionName: composition.id,
					defaultExtension: isVideo
						? defaults.stillImageFormat
						: RenderInternals.getFileExtensionFromCodec(
								initialVideoCodec,
								defaults.audioCodec as AudioCodec
						  ),
					type: 'asset',
				}),
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
				initialAudioCodec: defaults.audioCodec as AudioCodec,
				initialEnvVariables: window.process.env as Record<string, string>,
				initialDisableWebSecurity: defaults.disableWebSecurity,
				initialOpenGlRenderer: defaults.openGlRenderer as OpenGlRenderer | null,
				initialHeadless: defaults.headless,
				initialIgnoreCertificateErrors: defaults.ignoreCertificateErrors,
			});
		},
		[composition.id, isVideo, setSelectedModal]
	);

	if (!visible) {
		return null;
	}

	return (
		<InlineAction onClick={onClick}>
			<ThinRenderIcon svgProps={iconStyle} />
		</InlineAction>
	);
};
