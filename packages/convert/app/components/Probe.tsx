import React, {useCallback, useMemo, useState} from 'react';
import {Source} from '~/lib/convert-state';
import {AudioTrackOverview} from './AudioTrackOverview';
import {ContainerOverview} from './ContainerOverview';
import {SourceLabel} from './SourceLabel';
import {TrackSwitcher} from './TrackSwitcher';
import {VideoThumbnail} from './VideoThumbnail';
import {VideoTrackOverview} from './VideoTrackOverview';
import {Button} from './ui/button';
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import {ScrollArea} from './ui/scroll-area';
import {Separator} from './ui/separator';
import {Skeleton} from './ui/skeleton';
import {useProbe} from './use-probe';

export const Probe: React.FC<{
	readonly src: Source;
	readonly setProbeDetails: React.Dispatch<React.SetStateAction<boolean>>;
	readonly probeDetails: boolean;
}> = ({src, probeDetails, setProbeDetails}) => {
	const {
		audioCodec,
		fps,
		tracks,
		name,
		thumbnail,
		container,
		dimensions,
		size,
		videoCodec,
		durationInSeconds,
	} = useProbe(src);

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

	const selectedTrack = useMemo(() => {
		if (!probeDetails || trackDetails === null) {
			return null;
		}

		return sortedTracks[trackDetails];
	}, [probeDetails, sortedTracks, trackDetails]);

	return (
		<Card
			className={`w-full lg:${probeDetails ? 'w-[800px]' : 'w-[350px]'} max-h-[700px] overflow-hidden`}
		>
			<VideoThumbnail thumbnail={thumbnail} />
			<CardHeader className="border-b-2 border-black">
				<CardTitle title={name ?? undefined}>
					{name ? name : <Skeleton className="h-5 w-[220px] inline-block" />}
				</CardTitle>
				<CardDescription>
					<SourceLabel src={src} />
				</CardDescription>
			</CardHeader>
			{sortedTracks.length && probeDetails ? (
				<div className=" pr-6 border-b-2 border-black">
					<TrackSwitcher
						selectedTrack={trackDetails}
						sortedTracks={sortedTracks}
						onTrack={(track) => {
							setTrackDetails(track);
						}}
					/>
				</div>
			) : null}
			<ScrollArea height={300} className="flex-1">
				{selectedTrack === null ? (
					<ContainerOverview
						container={container ?? null}
						dimensions={dimensions ?? null}
						videoCodec={videoCodec ?? null}
						size={size ?? null}
						durationInSeconds={durationInSeconds}
						audioCodec={audioCodec ?? null}
						fps={fps}
					/>
				) : selectedTrack.type === 'video' ? (
					<VideoTrackOverview track={selectedTrack} />
				) : selectedTrack.type === 'audio' ? (
					<AudioTrackOverview track={selectedTrack} />
				) : null}
			</ScrollArea>
			<Separator orientation="horizontal" />
			<CardFooter className="flex flex-row items-center justify-center pb-3 pt-3">
				<div className="flex-1" />
				<Button disabled={!tracks} variant="link" onClick={onClick}>
					{probeDetails ? 'Hide details' : 'Show details'}
				</Button>
			</CardFooter>
		</Card>
	);
};
