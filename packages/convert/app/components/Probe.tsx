import type {
	Dimensions,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	TracksField,
} from '@remotion/media-parser';
import {parseMedia} from '@remotion/media-parser';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {AudioTrackOverview} from './AudioTrackOverview';
import {ContainerOverview} from './ContainerOverview';
import {SourceLabel} from './SourceLabel';
import {TrackSwitcher} from './TrackSwitcher';
import {VideoTrackOverview} from './VideoTrackOverview';
import {Button} from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import {ScrollArea} from './ui/scroll-area';
import {Skeleton} from './ui/skeleton';

export const Probe: React.FC<{
	readonly src: string;
	readonly setProbeDetails: React.Dispatch<React.SetStateAction<boolean>>;
	readonly probeDetails: boolean;
}> = ({src, probeDetails, setProbeDetails}) => {
	const [audioCodec, setAudioCodec] = useState<MediaParserAudioCodec | null>(
		null,
	);
	const [fps, setFps] = useState<number | null | undefined>(undefined);
	const [durationInSeconds, setDurationInSeconds] = useState<number | null>(
		null,
	);
	const [dimensions, setDimensions] = useState<Dimensions | null>(null);
	const [name, setName] = useState<string | null>(null);
	const [videoCodec, setVideoCodec] = useState<MediaParserVideoCodec | null>(
		null,
	);
	const [size, setSize] = useState<number | null>(null);
	const [tracks, setTracks] = useState<TracksField | null>(null);

	const getStart = useCallback(() => {
		parseMedia({
			src,
			fields: {
				dimensions: true,
				videoCodec: true,
				size: true,
				durationInSeconds: true,
				audioCodec: true,
				fps: true,
				name: true,
				tracks: true,
			},
			onAudioCodec: (codec) => {
				setAudioCodec(codec);
			},
			onFps: (f) => {
				setFps(f);
			},
			onDurationInSeconds: (d) => {
				setDurationInSeconds(d);
			},
			onName: (n) => {
				setName(n);
			},
			onDimensions(dim) {
				setDimensions(dim);
			},
			onVideoCodec: (codec) => {
				setVideoCodec(codec);
			},
			onTracks: (trx) => {
				setTracks(trx);
			},
			onSize(s) {
				setSize(s);
			},
		}).then(() => {});
	}, [src]);

	useEffect(() => {
		getStart();
	}, [getStart]);

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
			className={
				(probeDetails ? 'w-[800px]' : 'w-[350px]') +
				' h-5/6 max-h-[700px] flex flex-col max-w-[90vw]'
			}
		>
			<CardHeader>
				<CardTitle title={name ?? undefined}>
					{name ? name : <Skeleton className="h-5 w-[220px] inline-block" />}
				</CardTitle>
				<CardDescription>
					<SourceLabel src={src} />
				</CardDescription>
			</CardHeader>
			{sortedTracks.length && probeDetails ? (
				<div className="pl-6 pr-6">
					<TrackSwitcher
						selectedTrack={trackDetails}
						onTrack={(track) => {
							setTrackDetails(track);
						}}
						sortedTracks={sortedTracks}
					/>
				</div>
			) : null}
			<ScrollArea className="flex-1">
				<CardContent className="flex flex-1 flex-col">
					{selectedTrack === null ? (
						<ContainerOverview
							container="MP4"
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
				</CardContent>
			</ScrollArea>
			<CardFooter className="flex justify-between">
				<div className="flex-1" />
				<Button disabled={!tracks} onClick={onClick} variant={'link'}>
					{probeDetails ? 'Hide details' : 'Show details'}
				</Button>
			</CardFooter>
		</Card>
	);
};
