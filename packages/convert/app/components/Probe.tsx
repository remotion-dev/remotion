import React, {useCallback, useMemo, useState} from 'react';
import {Source} from '~/lib/convert-state';
import {useIsNarrow} from '~/lib/is-narrow';
import {AudioTrackOverview} from './AudioTrackOverview';
import {ContainerOverview} from './ContainerOverview';
import {SourceLabel} from './SourceLabel';
import {TrackSwitcher} from './TrackSwitcher';
import {VideoThumbnail, VideoThumbnailRef} from './VideoThumbnail';
import {VideoTrackOverview} from './VideoTrackOverview';
import {Button} from './ui/button';
import {Card, CardDescription, CardHeader, CardTitle} from './ui/card';
import {ScrollArea} from './ui/scroll-area';
import {Separator} from './ui/separator';
import {Skeleton} from './ui/skeleton';
import {ProbeResult} from './use-probe';

export const Probe: React.FC<{
	readonly src: Source;
	readonly setProbeDetails: React.Dispatch<React.SetStateAction<boolean>>;
	readonly probeDetails: boolean;
	readonly probeResult: ProbeResult;
	readonly videoThumbnailRef: React.RefObject<VideoThumbnailRef | null>;
	readonly userRotation: number;
	readonly mirrorHorizontal: boolean;
	readonly mirrorVertical: boolean;
	readonly thumbnailError: Error | null;
}> = ({
	src,
	probeDetails,
	setProbeDetails,
	probeResult,
	videoThumbnailRef,
	userRotation,
	mirrorHorizontal,
	mirrorVertical,
	thumbnailError,
}) => {
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

	const isCompact = isNarrow && !probeDetails;

	return (
		<Card className="w-full lg:w-[350px] overflow-hidden">
			<div className="flex flex-row lg:flex-col w-full border-b-2 border-black">
				{error ? null : thumbnailError ? null : (
					<VideoThumbnail
						ref={videoThumbnailRef}
						smallThumbOnMobile
						rotation={userRotation - (rotation ?? 0)}
						mirrorHorizontal={mirrorHorizontal}
						mirrorVertical={mirrorVertical}
					/>
				)}
				<CardHeader className="p-3 lg:p-4 w-full">
					<CardTitle title={name ?? undefined}>
						{name ? name : <Skeleton className="h-5 w-[220px] inline-block" />}
					</CardTitle>
					{error ? (
						<CardDescription className="!mt-0">
							<p className="text-red-500">
								Failed to parse media:
								<br />
								{error.message}
							</p>
						</CardDescription>
					) : null}
					{done ? (
						<CardDescription className="!mt-0">
							<SourceLabel src={src} />
						</CardDescription>
					) : (
						<div id="not-done" />
					)}
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
			{isCompact ? null : (
				<>
					<ScrollArea height={300} className="flex-1">
						{selectedTrack === null ? (
							<ContainerOverview
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
								durationInSeconds={durationInSeconds}
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
				<Button disabled={!tracks} variant="link" onClick={onClick}>
					{probeDetails ? 'Hide details' : 'Show details'}
				</Button>
			</div>
		</Card>
	);
};
