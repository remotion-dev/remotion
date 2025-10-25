import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';
import type {
	InputAudioTrack,
	InputFormat,
	InputVideoTrack,
	MetadataTags,
} from 'mediabunny';
import React from 'react';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';
import {formatBytes} from '~/lib/format-bytes';
import {formatSeconds} from '~/lib/format-seconds';
import {
	renderHumanReadableAudioCodec,
	renderHumanReadableVideoCodec,
} from '~/lib/render-codec-label';
import {MetadataDisplay} from './MetadataTable';
import {Skeleton} from './ui/skeleton';

export const ContainerOverview: React.FC<{
	readonly dimensions: Dimensions | null | undefined;
	readonly durationInSeconds: number | null | undefined;
	readonly videoCodec: InputVideoTrack['codec'] | null;
	readonly audioCodec: InputAudioTrack['codec'] | null | undefined;
	readonly size: number | null;
	readonly fps: number | null | undefined;
	readonly container: InputFormat | null;
	readonly isHdr: boolean | undefined;
	readonly metadata: MetadataTags | null;
	readonly isAudioOnly: boolean;
	readonly sampleRate: number | null;
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
	isAudioOnly,
	sampleRate,
}) => {
	return (
		<Table className="table-fixed">
			<TableBody>
				<TableRow>
					<TableCell className="font-brand">Container</TableCell>
					<TableCell className="text-right">
						{container ? (
							container.name
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
				{!isAudioOnly && (
					<TableRow>
						<TableCell className="font-brand">Dimensions</TableCell>
						<TableCell className="text-right">
							{dimensions === undefined ? (
								<Skeleton className="h-3 w-[100px] inline-block" />
							) : dimensions === null ? (
								<>N/A</>
							) : (
								<>
									{dimensions.width}x{dimensions.height}
								</>
							)}
						</TableCell>
					</TableRow>
				)}
				{isAudioOnly ? null : (
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
				)}
				{isAudioOnly ? null : (
					<TableRow>
						<TableCell className="font-brand">Video Codec</TableCell>
						<TableCell className="text-right">
							{videoCodec === undefined ? (
								<Skeleton className="h-3 w-[100px] inline-block" />
							) : videoCodec === null ? (
								<>N/A</>
							) : (
								renderHumanReadableVideoCodec(videoCodec)
							)}
						</TableCell>
					</TableRow>
				)}
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
				{sampleRate !== null ? (
					<TableRow>
						<TableCell className="font-brand">Sample Rate</TableCell>
						<TableCell className="text-right">{sampleRate} Hz</TableCell>
					</TableRow>
				) : null}
				{isAudioOnly ? null : (
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
				)}
				{metadata ? <MetadataDisplay metadata={metadata} /> : null}
			</TableBody>
		</Table>
	);
};
