import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';
import type {
	Dimensions,
	MediaParserAudioCodec,
	MediaParserLocation,
	MediaParserVideoCodec,
	MetadataEntry,
	ParseMediaContainer,
} from '@remotion/media-parser';
import React from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {formatSeconds} from '~/lib/format-seconds';
import {
	renderHumanReadableAudioCodec,
	renderHumanReadableContainer,
	renderHumanReadableVideoCodec,
} from '~/lib/render-codec-label';
import {MetadataDisplay} from './MetadataTable';
import {Skeleton} from './ui/skeleton';

export const ContainerOverview: React.FC<{
	readonly dimensions: Dimensions | null;
	readonly durationInSeconds: number | null | undefined;
	readonly videoCodec: MediaParserVideoCodec | null;
	readonly audioCodec: MediaParserAudioCodec | null | undefined;
	readonly size: number | null;
	readonly fps: number | null | undefined;
	readonly container: ParseMediaContainer | null;
	readonly isHdr: boolean | undefined;
	readonly metadata: MetadataEntry[] | null;
	readonly location: MediaParserLocation | null;
}> = ({
	container,
	dimensions,
	videoCodec,
	durationInSeconds,
	audioCodec,
	size,
	fps,
	isHdr,
	metadata,
	location,
}) => {
	return (
		<Table className="table-fixed">
			<TableBody>
				<TableRow>
					<TableCell className="font-brand">Container</TableCell>
					<TableCell className="text-right">
						{container ? (
							<>{renderHumanReadableContainer(container)}</>
						) : (
							<Skeleton className="h-3 w-[100px] inline-block" />
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Size</TableCell>
					<TableCell className="text-right">
						{size === null ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : (
							<>{formatBytes(size)}</>
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Duration</TableCell>
					<TableCell className="text-right">
						{durationInSeconds === undefined ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : durationInSeconds === null ? (
							<span>N/A</span>
						) : (
							<>{formatSeconds(durationInSeconds)}</>
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Dimensions</TableCell>
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
					<TableCell className="font-brand">Frame Rate</TableCell>
					<TableCell className="text-right">
						{fps === undefined ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : fps ? (
							<>{fps.toFixed(2)} FPS</>
						) : (
							'N/A'
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Video Codec</TableCell>
					<TableCell className="text-right">
						{videoCodec === null ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : (
							renderHumanReadableVideoCodec(videoCodec)
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Audio Codec</TableCell>
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
				<TableRow>
					<TableCell className="font-brand">HDR</TableCell>
					<TableCell className="text-right">
						{isHdr === undefined ? (
							<Skeleton className="h-3 w-[100px] inline-block" />
						) : isHdr ? (
							'Yes'
						) : (
							'No'
						)}
					</TableCell>
				</TableRow>
				<MetadataDisplay
					location={location}
					metadata={metadata ?? []}
					trackId={null}
				/>
			</TableBody>
		</Table>
	);
};
