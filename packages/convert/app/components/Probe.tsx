import type {
	Dimensions,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	ParseMediaContainer,
	TracksField,
} from '@remotion/media-parser';
import {parseMedia} from '@remotion/media-parser';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {AudioTrackOverview} from './AudioTrackOverview';
import {ContainerOverview} from './ContainerOverview';
import {SourceLabel} from './SourceLabel';
import {TrackSwitcher} from './TrackSwitcher';
import {VideoThumbnail} from './VideoThumbnail';
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
import {Separator} from './ui/separator';
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
	const [container, setContainer] = useState<ParseMediaContainer | null>(null);
	const [thumbnail, setThumbnail] = useState<VideoFrame | null>(null);

	const getStart = useCallback(() => {
		const controller = new AbortController();
		let hasFps = false;
		let hasDuration = false;
		let hasDimensions = false;
		let hasVideoCodec = false;
		let hasAudioCodec = false;
		let hasSize = false;
		let hasName = false;
		let hasFrame = false;
		let hasContainer = false;
		let hasTracks = false;

		const cancelIfDone = () => {
			if (
				hasFps &&
				hasDuration &&
				hasDimensions &&
				hasVideoCodec &&
				hasAudioCodec &&
				hasSize &&
				hasName &&
				hasFrame &&
				hasContainer &&
				hasTracks
			) {
				controller.abort(new Error('Cancelled (all info)'));
			}
		};

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
				container: true,
			},
			signal: controller.signal,
			onVideoTrack: async (track) => {
				if (typeof VideoDecoder === 'undefined') {
					return null;
				}

				let frames = 0;

				const decoder = new VideoDecoder({
					error: (error) => {
						// eslint-disable-next-line no-console
						console.log(error);
					},
					output(frame) {
						frames++;
						if (frames < 30) {
							frame.close();
							return;
						}

						setThumbnail((f) => {
							if (f) {
								frame.close();
								return f;
							}

							return frame;
						});
						hasFrame = true;
						cancelIfDone();
					},
				});

				if (!(await VideoDecoder.isConfigSupported(track)).supported) {
					return null;
				}

				// TODO: See if possible
				decoder.configure(track);
				return (sample) => {
					if (hasFrame) {
						return;
					}

					decoder.decode(new EncodedVideoChunk(sample));
				};
			},
			onContainer(c) {
				hasContainer = true;
				setContainer(c);
				cancelIfDone();
			},
			onAudioCodec: (codec) => {
				hasAudioCodec = true;
				setAudioCodec(codec);
				cancelIfDone();
			},
			onFps: (f) => {
				hasFps = true;
				setFps(f);
				cancelIfDone();
			},
			onDurationInSeconds: (d) => {
				hasDuration = true;
				setDurationInSeconds(d);
				cancelIfDone();
			},
			onName: (n) => {
				hasName = true;
				setName(n);
				cancelIfDone();
			},
			onDimensions(dim) {
				hasDimensions = true;
				setDimensions(dim);
				cancelIfDone();
			},
			onVideoCodec: (codec) => {
				hasVideoCodec = true;
				setVideoCodec(codec);
				cancelIfDone();
			},
			onTracks: (trx) => {
				hasTracks = true;
				setTracks(trx);
				cancelIfDone();
			},
			onSize(s) {
				hasSize = true;
				setSize(s);
				cancelIfDone();
			},
		})
			.then(() => {})
			.catch((err) => {
				if ((err as Error).stack?.includes('Cancelled')) {
					return;
				}

				// eslint-disable-next-line no-console
				console.log(err);
			});

		return controller;
	}, [src]);

	useEffect(() => {
		const start = getStart();
		return () => {
			start.abort(new Error('Cancelled (strict mode)'));
		};
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
				' h-5/6 max-h-[700px] flex flex-col max-w-[90vw] overflow-hidden'
			}
		>
			<VideoThumbnail thumbnail={thumbnail} />
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
				</CardContent>
			</ScrollArea>
			<Separator orientation="horizontal" />
			<CardFooter className="flex flex-row items-center justify-center pb-3 pt-3">
				<div className="flex-1" />
				<Button disabled={!tracks} onClick={onClick} variant={'link'}>
					{probeDetails ? 'Hide details' : 'Show details'}
				</Button>
			</CardFooter>
		</Card>
	);
};
