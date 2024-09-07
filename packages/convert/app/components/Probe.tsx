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

export const Probe: React.FC<{
	readonly src: string;
	readonly setProbeDetails: React.Dispatch<React.SetStateAction<boolean>>;
	readonly probeDetails: boolean;
}> = ({src, probeDetails, setProbeDetails}) => {
	const [dimensions, setDimensions] = useState<Dimensions | null>(null);
	const [videoCodec, setVideoCodec] = useState<MediaParserVideoCodec | null>(
		null,
	);
	const [audioCodec, setAudioCodec] = useState<MediaParserAudioCodec | null>(
		null,
	);
	const [size, setSize] = useState<number | null>(null);
	const [durationInSeconds, setDurationInSeconds] = useState<number | null>(
		null,
	);
	const [fps, setFps] = useState<number | null>(null);

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
			},
		}).then((data) => {
			setDimensions(data.dimensions);
			setVideoCodec(data.videoCodec);
			setAudioCodec(data.audioCodec);
			setSize(data.size);
			setDurationInSeconds(data.durationInSeconds);
			setFps(data.fps);
		});
	}, [src]);

	useEffect(() => {
		getStart();
	}, [getStart]);

	const onClick = useCallback(() => {
		setProbeDetails((p) => !p);
	}, [setProbeDetails]);

	const title = 'bigbuckbfdsdsfkjsdflkunny.mp4';

	return (
		<Card className={probeDetails ? 'w-[800px]' : 'w-[350px]'}>
			<CardHeader>
				<CardTitle title={title}>{title}</CardTitle>
				<CardDescription>From URL</CardDescription>
			</CardHeader>
			<CardContent>
				<TableDemo
					container="MP4"
					dimensions={dimensions}
					videoCodec={videoCodec}
					size={size}
					durationInSeconds={durationInSeconds}
					audioCodec={audioCodec}
					fps={fps}
				/>
			</CardContent>
			<CardFooter className="flex justify-between">
				<div className="flex-1" />
				<Button onClick={onClick} variant={'link'}>
					Show details
				</Button>
			</CardFooter>
		</Card>
	);
};
