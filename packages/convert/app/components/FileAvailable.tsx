import React, {useMemo, useRef, useState} from 'react';
import {normalizeVideoRotation} from '~/lib/calculate-new-dimensions-from-dimensions';
import type {Source} from '~/lib/convert-state';
import type {RotateOrMirrorState} from '~/lib/default-ui';
import {defaultRotateOrMirorState} from '~/lib/default-ui';
import type {RouteAction} from '~/seo';
import {BackButton} from './BackButton';
import ConvertUI from './ConvertUi';
import {Footer} from './Footer';
import {VideoPlayer} from './MediaPlayer';
import {Page} from './Page';
import {Probe} from './Probe';
import {ReplaceVideo} from './ReplaceVideo';
import type {VideoThumbnailRef} from './VideoThumbnail';
import Transcribe from './transcribe/App';
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

	const [enableRotateOrMirrow, setEnableRotateOrMirror] =
		useState<RotateOrMirrorState>(() => defaultRotateOrMirorState(routeAction));

	const probeResult = useProbe({
		src,
	});

	const [userRotation, setRotation] = useState(90);
	const [flipHorizontal, setFlipHorizontal] = useState(true);
	const [flipVertical, setFlipVertical] = useState(false);

	const actualUserRotation = useMemo(() => {
		if (enableRotateOrMirrow !== 'rotate') {
			return 0;
		}

		return normalizeVideoRotation(userRotation);
	}, [enableRotateOrMirrow, userRotation]);

	return (
		<Page className="lg:justify-center pt-6 pb-10 px-4 lg:flex">
			<div>
				<BackButton setSrc={setSrc} />
				<div className="h-4" />
				<VideoPlayer src={src} />
				<div className="h-8" />

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
					{routeAction.type !== 'generic-probe' &&
					routeAction.type !== 'transcribe' ? (
						<>
							<div className="h-8 lg:h-0 lg:w-8" />
							<div
								data-disabled={!(probeResult.done && !probeResult.error)}
								className="w-full lg:w-[350px] data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none"
							>
								{probeResult.container !== null && probeResult.name !== null ? (
									<div className="gap-4">
										<ConvertUI
											inputContainer={probeResult.container}
											currentAudioCodec={probeResult.audioCodec ?? null}
											currentVideoCodec={probeResult.videoCodec ?? null}
											tracks={probeResult.tracks}
											setSrc={setSrc}
											unrotatedDimensions={probeResult.unrotatedDimensions}
											dimensions={probeResult.dimensions}
											durationInSeconds={probeResult.durationInSeconds ?? null}
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
											sampleRate={probeResult.sampleRate}
											name={probeResult.name}
											input={probeResult.input}
										/>
									</div>
								) : null}
							</div>
						</>
					) : null}
					{routeAction.type === 'transcribe' ? (
						<Transcribe src={src} name={probeResult.name ?? ''} />
					) : null}
				</div>
				<div className="h-16" />
				<Footer routeAction={routeAction} />
				<ReplaceVideo setSrc={setSrc} />
			</div>
		</Page>
	);
};
