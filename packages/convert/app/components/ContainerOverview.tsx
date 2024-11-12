import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';
import type {
	Dimensions,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	ParseMediaContainer,
} from '@remotion/media-parser';
import React from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatSeconds} from '~/lib/format-seconds';
import {
	renderHumanReadableAudioCodec,
	renderHumanReadableVideoCodec,
} from '~/lib/render-codec-label';
import {Skeleton} from './ui/skeleton';

export const ContainerOverview: React.FC<{
	readonly dimensions: Dimensions | null;
	readonly durationInSeconds: number | null;
	readonly videoCodec: MediaParserVideoCodec | null;
	readonly audioCodec: MediaParserAudioCodec | null | undefined;
	readonly size: number | null;
	readonly fps: number | null | undefined;
	readonly container: ParseMediaContainer | null;
}> = ({
	container,
	dimensions,
	videoCodec,
	durationInSeconds,
	audioCodec,
	size,
	fps,
}) => {
	return (
		<Table>
			<TableBody>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Size
					</TableCell>
					<TableCell className="text-right">
						{size === null ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : (
							<>{formatBytes(size)}</>
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Container
					</TableCell>
					<TableCell className="text-right">
						{container ? (
							<>{String(container)}</>
						) : (
							<Skeleton className="h-3 w-[100px] inline-block" />
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Duration
					</TableCell>
					<TableCell className="text-right">
						{
							// TODO: For display1687984009979.webm, this does not get displayed
							durationInSeconds === null ? (
								<Skeleton className="h-3 w-[100px] inline-block" />
							) : (
								<>{formatSeconds(durationInSeconds)}</>
							)
						}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Dimensions
					</TableCell>
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
					<TableCell className="font-brand" colSpan={3}>
						Frame Rate
					</TableCell>
					<TableCell className="text-right">
						{fps === undefined ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : fps ? (
							<>{fps} FPS</>
						) : (
							'N/A'
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Video Codec
					</TableCell>
					<TableCell className="text-right">
						{videoCodec === null ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : (
							renderHumanReadableVideoCodec(videoCodec)
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand" colSpan={3}>
						Audio Codec
					</TableCell>
					<TableCell className="text-right">
						{audioCodec === undefined ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : audioCodec === null ? (
							'No audio'
						) : (
							renderHumanReadableAudioCodec(audioCodec)
						)}
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
};
