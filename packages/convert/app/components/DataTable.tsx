import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';
import type {Dimensions, MediaParserVideoCodec} from '@remotion/media-parser';
import React from 'react';
import {Skeleton} from './ui/skeleton';

export const TableDemo: React.FC<{
	dimensions: Dimensions | null;
	container: string;
	videoCodec: MediaParserVideoCodec | null;
}> = ({container, dimensions, videoCodec}) => {
	return (
		<Table>
			<TableBody>
				<TableRow>
					<TableCell colSpan={3}>Container</TableCell>
					<TableCell className="text-right">{container}</TableCell>
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
