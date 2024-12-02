import {ParseMediaOnProgress} from '@remotion/media-parser';
import React, {useCallback, useRef, useState} from 'react';
import {Source} from '~/lib/convert-state';
import {formatBytes} from '~/lib/format-bytes';
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
	const [probeDetails, setProbeDetails] = useState(false);

	const clear = useCallback(() => {
		setSrc(null);
	}, [setSrc]);

	const videoThumbnailRef = useRef<VideoThumbnailRef>(null);

	const onVideoThumbnail = useCallback(
		(frame: VideoFrame, rotation: number) => {
			videoThumbnailRef.current?.draw(frame, rotation);
		},
		[],
	);

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

	const probeResult = useProbe({
		src,
		logLevel: 'verbose',
		onProgress,
		onVideoThumbnail,
	});

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
							src={src}
							probeDetails={probeDetails}
							setProbeDetails={setProbeDetails}
							probeResult={probeResult}
							videoThumbnailRef={videoThumbnailRef}
						/>
						<div className="h-8 lg:h-0 lg:w-8" />
						<div
							data-disabled={!(probeResult.done && !probeResult.error)}
							className="w-full lg:w-[350px] data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none"
						>
							<div className="gap-4">
								<ConvertUI
									currentAudioCodec={probeResult.audioCodec ?? null}
									currentVideoCodec={probeResult.videoCodec ?? null}
									src={src}
									tracks={probeResult.tracks}
									setSrc={setSrc}
									duration={probeResult.durationInSeconds ?? null}
									logLevel="verbose"
									action={routeAction}
								/>
							</div>
						</div>
					</div>
					<div className="h-16" />
					<Footer />
				</div>
			</div>
		</div>
	);
};
