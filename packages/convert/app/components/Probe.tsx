import clsx from 'clsx';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import {useIsNarrow} from '~/lib/is-narrow';
import {
	useAddFilenameToTitle,
	useCopyThumbnailToFavicon,
} from '~/lib/title-context';
import {useThumbnailAndWaveform} from '~/lib/use-thumbnail';
import {AudioTrackOverview} from './AudioTrackOverview';
import {ContainerOverview} from './ContainerOverview';
import {EmbeddedImage} from './EmbeddedImage';
import {SourceLabel} from './SourceLabel';
import {TrackSwitcher} from './TrackSwitcher';
import type {VideoThumbnailRef} from './VideoThumbnail';
import {VideoThumbnail} from './VideoThumbnail';
import {VideoTrackOverview} from './VideoTrackOverview';
import {getBrightnessOfFrame} from './get-brightness-of-frame';
import styles from './probe.module.css';
import {Button} from './ui/button';
import {Card, CardDescription, CardHeader, CardTitle} from './ui/card';
import {ScrollArea} from './ui/scroll-area';
import {Separator} from './ui/separator';
import {Skeleton} from './ui/skeleton';
import type {ProbeResult} from './use-probe';

const idealBrightness = 0.8;

export const Probe: React.FC<{
	readonly src: Source;
	readonly setProbeDetails: React.Dispatch<React.SetStateAction<boolean>>;
	readonly probeDetails: boolean;
	readonly probeResult: ProbeResult;
	readonly videoThumbnailRef: React.RefObject<VideoThumbnailRef | null>;
	readonly userRotation: number;
	readonly mirrorHorizontal: boolean;
	readonly mirrorVertical: boolean;
	readonly onWaveformBars: (bars: number[]) => void;
	readonly isAudio: boolean;
}> = ({
	src,
	probeDetails,
	setProbeDetails,
	probeResult,
	videoThumbnailRef,
	userRotation,
	mirrorHorizontal,
	mirrorVertical,
	onWaveformBars,
	isAudio,
}) => {
	const bestBrightness = useRef<number | null>(null);

	const onVideoThumbnail = useCallback(
		async (frame: VideoFrame) => {
			const brightness = await getBrightnessOfFrame(frame);
			const differenceToIdeal = Math.abs(brightness - idealBrightness);
			if (
				bestBrightness.current === null ||
				differenceToIdeal < bestBrightness.current
			) {
				bestBrightness.current = differenceToIdeal;
				videoThumbnailRef.current?.draw(frame);
			}

			frame.close();
		},
		[videoThumbnailRef],
	);

	const onDone = useCallback(() => {
		videoThumbnailRef.current?.onDone();
	}, [videoThumbnailRef]);

	const {err: thumbnailError} = useThumbnailAndWaveform({
		onVideoThumbnail,
		onDone,
		onWaveformBars,
		input: probeResult.input,
	});

	const {
		audioCodec,
		fps,
		tracks,
		name,
		container,
		dimensions,
		size,
		videoCodec,
		durationInSeconds,
		isHdr,
		done,
		rotation,
		error,
		metadata,
		sampleRate,
	} = probeResult;

	const onClick = useCallback(() => {
		setProbeDetails((p) => !p);
	}, [setProbeDetails]);

	const sortedTracks = useMemo(
		() => (tracks ? tracks.slice().sort((a, b) => a.id - b.id) : []),
		[tracks],
	);

	const [trackDetails, setTrackDetails] = useState<number | null>(null);
	const isNarrow = useIsNarrow();

	const selectedTrack = useMemo(() => {
		if (!probeDetails || trackDetails === null) {
			return null;
		}

		return sortedTracks[trackDetails];
	}, [probeDetails, sortedTracks, trackDetails]);

	const [showPackets, setShowPackets] = useState(false);

	useAddFilenameToTitle(name);
	useCopyThumbnailToFavicon(videoThumbnailRef);

	const images = useMemo(() => {
		return metadata?.images ?? null;
	}, [metadata]);

	return (
		<div
			className="w-full lg:w-[350px] data-[expanded=true]:w-[732px]"
			data-expanded={probeDetails}
		>
			<Card
				className="overflow-hidden lg:w-[350px] data-[expanded=true]:w-[732px]"
				data-expanded={probeDetails}
			>
				<div className="flex flex-row lg:flex-col w-full border-b-2 border-black">
					{images ? <EmbeddedImage images={images} /> : null}
					{error ? null : thumbnailError ? null : isAudio ? null : (
						<VideoThumbnail
							ref={videoThumbnailRef}
							smallThumbOnMobile
							userRotation={userRotation}
							trackRotation={rotation}
							mirrorHorizontal={mirrorHorizontal}
							mirrorVertical={mirrorVertical}
							initialReveal={false}
						/>
					)}
					<CardHeader className="p-3 lg:p-4 w-full">
						<CardTitle title={name ?? undefined}>
							{name ? (
								name
							) : (
								<Skeleton className="h-5 w-[220px] inline-block" />
							)}
						</CardTitle>
						{error ? (
							<CardDescription className="mt-0! text-red-500">
								Failed to parse media:
								<br />
								{error.message}
							</CardDescription>
						) : null}
						<CardDescription
							className={clsx('mt-0! truncate', styles['fade-in'])}
						>
							{done ? (
								<SourceLabel src={src} />
							) : (
								<span id="not-done">0% read</span>
							)}
						</CardDescription>
					</CardHeader>
				</div>
				{showPackets ? (
					<div className="pr-6 border-b-2 border-black overflow-y-auto">
						<Button variant="link" onClick={() => setShowPackets(false)}>
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
							Track {selectedTrack?.id} Packets
						</Button>
					</div>
				) : sortedTracks.length && probeDetails ? (
					<div className="pr-6 border-b-2 border-black overflow-y-auto">
						<TrackSwitcher
							selectedTrack={trackDetails}
							sortedTracks={sortedTracks}
							onTrack={(track) => {
								setTrackDetails(track);
							}}
						/>
					</div>
				) : null}
				{isNarrow ? null : (
					<>
						<ScrollArea height={300} className="flex-1">
							{selectedTrack === null ? (
								<ContainerOverview
									isAudioOnly={isAudio}
									container={container ?? null}
									dimensions={dimensions ?? null}
									videoCodec={videoCodec ?? null}
									size={size ?? null}
									durationInSeconds={durationInSeconds}
									audioCodec={audioCodec}
									fps={fps}
									metadata={metadata}
									isHdr={isHdr}
									sampleRate={sampleRate}
								/>
							) : selectedTrack.isVideoTrack() ? (
								<VideoTrackOverview
									track={selectedTrack}
									showPackets={showPackets}
									setShowPackets={setShowPackets}
								/>
							) : selectedTrack.isAudioTrack() ? (
								<AudioTrackOverview
									showPackets={showPackets}
									setShowPackets={setShowPackets}
									track={selectedTrack}
								/>
							) : null}
						</ScrollArea>
						<Separator orientation="horizontal" />
					</>
				)}
				<div className="flex flex-row items-center justify-center">
					<Button
						className="w-full h-full hover:bg-slate-100 transition-colors"
						disabled={!tracks}
						variant="ghost"
						onClick={onClick}
					>
						{probeDetails ? 'Hide details' : 'Show details'}
					</Button>
				</div>
			</Card>
		</div>
	);
};
