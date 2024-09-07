import type {ParseMediaResult} from '@remotion/media-parser';
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
	const [metadata, setMetadata] = useState<ParseMediaResult<{
		audioCodec: true;
		fps: true;
		durationInSeconds: true;
		videoCodec: true;
		dimensions: true;
		name: true;
		size: true;
	}> | null>(null);

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
		}).then((data) => {
			setMetadata(data);
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
				<CardTitle title={title}>
					{metadata?.name ? (
						metadata.name
					) : (
						<Skeleton className="h-5 w-[220px] inline-block" />
					)}
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
					dimensions={metadata?.dimensions ?? null}
					videoCodec={metadata?.videoCodec ?? null}
					size={metadata?.size ?? null}
					durationInSeconds={metadata?.durationInSeconds ?? null}
					audioCodec={metadata?.audioCodec ?? null}
					fps={metadata?.fps ?? null}
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
