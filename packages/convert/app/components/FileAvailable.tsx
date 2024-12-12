import {ParseMediaOnProgress} from '@remotion/media-parser';
import {WebCodecsInternals} from '@remotion/webcodecs';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Source} from '~/lib/convert-state';
import {defaultRotateOrMirorState, RotateOrMirrorState} from '~/lib/default-ui';
import {formatBytes} from '~/lib/format-bytes';
import {useThumbnail} from '~/lib/use-thumbnail';
import {RouteAction} from '~/seo';
import ConvertUI from './ConvertUi';
import {Footer} from './Footer';
import {Probe} from './Probe';
import {VideoThumbnailRef} from './VideoThumbnail';
import {Button} from './ui/button';
import {useProbe} from './use-probe';

export const FileAvailable: React.FC<{
	readonly src: Source;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly routeAction: RouteAction;
}> = ({src, setSrc, routeAction}) => {
	const [probeDetails, setProbeDetails] = useState(
		() => routeAction.type === 'generic-probe',
	);

	const clear = useCallback(() => {
		setSrc(null);
	}, [setSrc]);

	const videoThumbnailRef = useRef<VideoThumbnailRef>(null);

	const onVideoThumbnail = useCallback((frame: VideoFrame) => {
		videoThumbnailRef.current?.draw(frame);
	}, []);

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

	const {err} = useThumbnail({src, logLevel: 'verbose', onVideoThumbnail});
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
		<div>
			<div className="overflow-y-auto w-full lg:flex lg:justify-center pt-6 pb-10 px-4 bg-slate-50 min-h-[100vh]">
				<div>
					<div className="block">
						<Button variant="link" onClick={clear}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 448 512"
								style={{height: 16}}
							>
								<path
									fill="currentcolor"
									d="M18.2 273l-17-17 17-17L171.8 85.4l17-17 33.9 33.9-17 17L93.1 232 424 232l24 0 0 48-24 0L93.1 280 205.8 392.6l17 17-33.9 33.9-17-17L18.2 273z"
								/>
							</svg>
							<div className="w-2" />
							Choose another file
						</Button>
					</div>
					<div className="lg:inline-flex lg:flex-row">
						<Probe
							thumbnailError={err}
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
											inputContainer={probeResult.container}
											currentAudioCodec={probeResult.audioCodec ?? null}
											currentVideoCodec={probeResult.videoCodec ?? null}
											src={src}
											tracks={probeResult.tracks}
											setSrc={setSrc}
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
										/>
									</div>
								</div>
							</>
						) : null}
					</div>
					<div className="h-16" />
					<Footer />
				</div>
			</div>
		</div>
	);
};
