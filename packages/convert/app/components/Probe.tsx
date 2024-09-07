import type {
	Dimensions,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
} from '@remotion/media-parser';
import {parseMedia} from '@remotion/media-parser';
import React, {useCallback, useEffect, useState} from 'react';
import {TableDemo} from './DataTable';
import {Button} from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
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
			onSize(s) {
				setSize(s);
			},
		}).then(() => {
			console.log('done');
		});
	}, [src]);

	useEffect(() => {
		getStart();
	}, [getStart]);

	const onClick = useCallback(() => {
		setProbeDetails((p) => !p);
	}, [setProbeDetails]);

	return (
		<Card className={probeDetails ? 'w-[800px]' : 'w-[350px]'}>
			<CardHeader>
				<CardTitle title={name ?? undefined}>
					{name ? name : <Skeleton className="h-5 w-[220px] inline-block" />}
				</CardTitle>
				<CardDescription>From URL</CardDescription>
			</CardHeader>
			<CardContent>
				{probeDetails ? (
					<div>
						<div className="flex flex-row">
							<Button variant={'secondary'}>Overview</Button>
							<Separator orientation="vertical" />
							<Button variant={'link'}>Track 1</Button>
						</div>
						<div className="h-4" />
					</div>
				) : null}
				<TableDemo
					container="MP4"
					dimensions={dimensions ?? null}
					videoCodec={videoCodec ?? null}
					size={size ?? null}
					durationInSeconds={durationInSeconds}
					audioCodec={audioCodec ?? null}
					fps={fps}
				/>
			</CardContent>
			<CardFooter className="flex justify-between">
				<div className="flex-1" />
				<Button onClick={onClick} variant={'link'}>
					{probeDetails ? 'Hide details' : 'Show details'}
				</Button>
			</CardFooter>
		</Card>
	);
};
