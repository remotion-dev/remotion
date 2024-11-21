import {
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	ParseMediaOnProgress,
	TracksField,
} from '@remotion/media-parser';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Source} from '~/lib/convert-state';
import {formatBytes} from '~/lib/format-bytes';
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
import {useProbe} from './use-probe';

export const Probe: React.FC<{
	readonly src: Source;
	readonly setProbeDetails: React.Dispatch<React.SetStateAction<boolean>>;
	readonly setAudioCodec: React.Dispatch<
		React.SetStateAction<MediaParserAudioCodec | null>
	>;
	readonly setVideoCodec: React.Dispatch<
		React.SetStateAction<MediaParserVideoCodec | null>
	>;
	readonly probeDetails: boolean;
	readonly onTracks: (tracks: TracksField) => void;
}> = ({
	src,
	probeDetails,
	setProbeDetails,
	setAudioCodec,
	setVideoCodec,
	onTracks,
}) => {
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
		done,
	} = useProbe({
		src,
		onVideoThumbnail,
		onAudioCodec: setAudioCodec,
		onVideoCodec: setVideoCodec,
		onTracks,
		logLevel: 'verbose',
		onProgress,
	});

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
				<VideoThumbnail ref={videoThumbnailRef} smallThumbOnMobile />
				<CardHeader className=" p-3 lg:p-4 w-full">
					<CardTitle title={name ?? undefined}>
						{name ? name : <Skeleton className="h-5 w-[220px] inline-block" />}
					</CardTitle>
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
							/>
						) : selectedTrack.type === 'video' ? (
							<VideoTrackOverview track={selectedTrack} />
						) : selectedTrack.type === 'audio' ? (
							<AudioTrackOverview track={selectedTrack} />
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
