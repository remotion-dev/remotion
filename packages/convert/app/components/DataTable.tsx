import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';
import type {Dimensions, MediaParserVideoCodec} from '@remotion/media-parser';
import React from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {Skeleton} from './ui/skeleton';

const formatSeconds = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const secondsLeft = seconds % 60;

	return `${minutes}:${secondsLeft < 10 ? '0' : ''}${Math.round(secondsLeft)} min`;
};

export const TableDemo: React.FC<{
	dimensions: Dimensions | null;
	container: string;
	durationInSeconds: number | null;
	videoCodec: MediaParserVideoCodec | null;
	size: number | null;
}> = ({container, dimensions, videoCodec, durationInSeconds, size}) => {
	return (
		<Table>
			<TableBody>
				<TableRow>
					<TableCell colSpan={3}>Container</TableCell>
					<TableCell className="text-right">{container}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Size</TableCell>
					<TableCell className="text-right">
						{size === null ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : (
							<>{formatBytes(size)}</>
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Duration</TableCell>
					<TableCell className="text-right">
						{durationInSeconds === null ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : (
							<>{formatSeconds(durationInSeconds)}</>
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Dimensions</TableCell>
					<TableCell className="text-right">
						{dimensions === null ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : (
							<>
								{dimensions.width}x{dimensions.height}
							</>
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Video Codec</TableCell>
					<TableCell className="text-right">
						{videoCodec === null ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : (
							videoCodec
						)}
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
};
