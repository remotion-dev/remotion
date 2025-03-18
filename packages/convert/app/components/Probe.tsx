import type {MediaParserEmbeddedImage} from '@remotion/media-parser';
import clsx from 'clsx';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import {isAudioOnly} from '~/lib/is-audio-container';
import {useIsNarrow} from '~/lib/is-narrow';
import {
	useAddFilenameToTitle,
	useCopyThumbnailToFavicon,
} from '~/lib/title-context';
import {useThumbnailAndWaveform} from '~/lib/use-thumbnail';
import {AudioTrackOverview} from './AudioTrackOverview';
import {AudioWaveForm} from './AudioWaveform';
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
}> = ({
	src,
	probeDetails,
	setProbeDetails,
	probeResult,
	videoThumbnailRef,
	userRotation,
	mirrorHorizontal,
	mirrorVertical,
}) => {
	const [waveform, setWaveform] = useState<number[]>([]);
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
		},
		[videoThumbnailRef],
	);

	const onDone = useCallback(() => {
		videoThumbnailRef.current?.onDone();
	}, [videoThumbnailRef]);

	const onWaveformBars = useCallback((bars: number[]) => {
		setWaveform(bars);
	}, []);

	const {err: thumbnailError} = useThumbnailAndWaveform({
		src,
		logLevel: 'verbose',
		onVideoThumbnail,
		onDone,
		onWaveformBars,
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
		rotation,
		done,
		error,
		metadata,
		location,
		keyframes,
		images,
	} = probeResult;

	const onClick = useCallback(() => {
		setProbeDetails((p) => !p);
	}, [setProbeDetails]);

	const sortedTracks = useMemo(
		() =>
			tracks
				? [...tracks.audioTracks, ...tracks.videoTracks].sort(
						(a, b) => a.trackId - b.trackId,
					)
				: [],
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

	const isAudio = isAudioOnly({tracks, container});

	useAddFilenameToTitle(name);
	useCopyThumbnailToFavicon(videoThumbnailRef);

	return (
		<div className="w-full lg:w-[350px]">
			<Card className="overflow-hidden lg:w-[350px]">
				<div className="flex flex-row lg:flex-col w-full border-b-2 border-black">
					{(images?.length ?? 0) > 0 ? (
						<EmbeddedImage images={images as MediaParserEmbeddedImage[]} />
					) : isAudio ? (
						<AudioWaveForm bars={waveform} />
					) : null}
					{error ? null : thumbnailError ? null : isAudio ? null : (
						<VideoThumbnail
							ref={videoThumbnailRef}
							smallThumbOnMobile
							rotation={userRotation - (rotation ?? 0)}
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
							<CardDescription className="!mt-0 text-red-500">
								Failed to parse media:
								<br />
								{error.message}
							</CardDescription>
						) : null}
						<CardDescription
							className={clsx('!mt-0 truncate', styles['fade-in'])}
						>
							{done ? (
								<SourceLabel src={src} />
							) : (
								<span id="not-done">0% read</span>
							)}
						</CardDescription>
					</CardHeader>
				</div>
				{sortedTracks.length && probeDetails ? (
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
									location={location}
								/>
							) : selectedTrack.type === 'video' ? (
								<VideoTrackOverview
									location={location}
									metadata={metadata}
									track={selectedTrack}
									keyframes={keyframes}
									durationInSeconds={durationInSeconds ?? null}
								/>
							) : selectedTrack.type === 'audio' ? (
								<AudioTrackOverview
									location={location}
									metadata={metadata}
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
