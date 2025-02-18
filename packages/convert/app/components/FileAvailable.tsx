import type {ParseMediaOnProgress} from '@remotion/media-parser';
import {WebCodecsInternals} from '@remotion/webcodecs';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import type {RotateOrMirrorState} from '~/lib/default-ui';
import {defaultRotateOrMirorState} from '~/lib/default-ui';
import {formatBytes} from '~/lib/format-bytes';
import type {RouteAction} from '~/seo';
import {BackButton} from './BackButton';
import ConvertUI from './ConvertUi';
import {Footer} from './Footer';
import {Page} from './Page';
import {Probe} from './Probe';
import {ReplaceVideo} from './ReplaceVideo';
import type {VideoThumbnailRef} from './VideoThumbnail';
import {useProbe} from './use-probe';

export const FileAvailable: React.FC<{
	readonly src: Source;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly routeAction: RouteAction;
}> = ({src, setSrc, routeAction}) => {
	const [probeDetails, setProbeDetails] = useState(
		() => routeAction.type === 'generic-probe',
	);

	const videoThumbnailRef = useRef<VideoThumbnailRef>(null);

	const onProgress: ParseMediaOnProgress = useCallback(
		async ({bytes, percentage}) => {
			await new Promise((resolve) => {
				window.requestAnimationFrame(resolve);
			});
			const notDone = document.getElementById('not-done');
			if (notDone) {
				if (percentage === null) {
					notDone.innerHTML = `${formatBytes(bytes)} read`;
				} else {
					notDone.innerHTML = `${Math.round(
						percentage * 100,
					)}% read (${formatBytes(bytes)})`;
				}
			}
		},
		[],
	);

	const [enableRotateOrMirrow, setEnableRotateOrMirror] =
		useState<RotateOrMirrorState>(() => defaultRotateOrMirorState(routeAction));

	const probeResult = useProbe({
		src,
		logLevel: 'verbose',
		onProgress,
	});

	const [userRotation, setRotation] = useState(90);
	const [flipHorizontal, setFlipHorizontal] = useState(true);
	const [flipVertical, setFlipVertical] = useState(false);

	const actualUserRotation = useMemo(() => {
		if (enableRotateOrMirrow !== 'rotate') {
			return 0;
		}

		return WebCodecsInternals.normalizeVideoRotation(userRotation);
	}, [enableRotateOrMirrow, userRotation]);

	return (
		<Page className="lg:justify-center pt-6 pb-10 px-4 lg:flex">
			<div>
				<BackButton setSrc={setSrc} />
				<div className="h-4" />
				<div className="lg:inline-flex lg:flex-row items-start">
					<Probe
						src={src}
						probeDetails={probeDetails}
						setProbeDetails={setProbeDetails}
						probeResult={probeResult}
						videoThumbnailRef={videoThumbnailRef}
						userRotation={actualUserRotation}
						mirrorHorizontal={
							flipHorizontal && enableRotateOrMirrow === 'mirror'
						}
						mirrorVertical={flipVertical && enableRotateOrMirrow === 'mirror'}
					/>
					{routeAction.type !== 'generic-probe' ? (
						<>
							<div className="h-8 lg:h-0 lg:w-8" />
							<div
								data-disabled={!(probeResult.done && !probeResult.error)}
								className="w-full lg:w-[350px] data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none"
							>
								<div className="gap-4">
									<ConvertUI
										m3uStreams={probeResult.m3u}
										inputContainer={probeResult.container}
										currentAudioCodec={probeResult.audioCodec ?? null}
										currentVideoCodec={probeResult.videoCodec ?? null}
										src={src}
										tracks={probeResult.tracks}
										setSrc={setSrc}
										unrotatedDimensions={probeResult.unrotatedDimensions}
										dimensions={probeResult.dimensions}
										duration={probeResult.durationInSeconds ?? null}
										logLevel="verbose"
										action={routeAction}
										enableRotateOrMirror={enableRotateOrMirrow}
										setEnableRotateOrMirror={setEnableRotateOrMirror}
										userRotation={actualUserRotation}
										setRotation={setRotation}
										flipHorizontal={flipHorizontal}
										setFlipHorizontal={setFlipHorizontal}
										flipVertical={flipVertical}
										setFlipVertical={setFlipVertical}
										videoThumbnailRef={videoThumbnailRef}
										rotation={probeResult.rotation}
									/>
								</div>
							</div>
						</>
					) : null}
				</div>
				<div className="h-16" />
				<Footer />
				<ReplaceVideo setSrc={setSrc} />
			</div>
		</Page>
	);
};
