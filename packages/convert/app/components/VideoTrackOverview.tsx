import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';
import type {
	MediaParserKeyframe,
	MediaParserLocation,
	MetadataEntry,
	VideoTrack,
} from '@remotion/media-parser';
import React from 'react';
import {renderHumanReadableVideoCodec} from '~/lib/render-codec-label';
import {KeyframesInfo} from './KeyframesInfo';
import {MetadataDisplay} from './MetadataTable';

export const VideoTrackOverview: React.FC<{
	readonly track: VideoTrack;
	readonly metadata: MetadataEntry[] | null;
	readonly location: MediaParserLocation | null;
	readonly keyframes: MediaParserKeyframe[] | null;
	readonly durationInSeconds: number | null;
}> = ({track, metadata, location, keyframes, durationInSeconds}) => {
	return (
		<Table className="table-fixed">
			<TableBody>
				<TableRow>
					<TableCell className="font-brand">Type</TableCell>
					<TableCell className="text-right">Video</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Codec</TableCell>
					<TableCell className="text-right">
						{renderHumanReadableVideoCodec(track.codecWithoutConfig)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">WebCodecs Codec String</TableCell>
					<TableCell className="text-right">{track.codec}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Dimensions</TableCell>
					<TableCell className="text-right">
						{track.width}x{track.height}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Timescale</TableCell>
					<TableCell className="text-right">{track.timescale}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Sample Aspect Ratio</TableCell>
					<TableCell className="text-right">
						{track.sampleAspectRatio.numerator}:
						{track.sampleAspectRatio.denominator}
					</TableCell>
				</TableRow>
				{keyframes !== null ? (
					<KeyframesInfo
						durationInSeconds={durationInSeconds}
						keyframes={keyframes}
						trackId={track.trackId}
					/>
				) : null}
				<TableRow>
					<TableCell className="font-brand">Rotation</TableCell>
					<TableCell className="text-right">{track.rotation}°</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Unrotated dimensions</TableCell>
					<TableCell className="text-right">
						{track.codedWidth}x{track.codedHeight}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Color Primaries</TableCell>
					<TableCell className="text-right">
						{track.color.primaries ?? 'N/A'}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Color Matrix</TableCell>
					<TableCell className="text-right">
						{track.color.matrixCoefficients ?? 'N/A'}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">
						Color Transfer Characteristics
					</TableCell>
					<TableCell className="text-right">
						{track.color.transferCharacteristics ?? 'N/A'}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Color Full Range</TableCell>
					<TableCell className="text-right">
						{track.color.fullRange
							? 'Yes'
							: track.color.fullRange === false
								? 'No'
								: 'N/A'}
					</TableCell>
				</TableRow>
				<MetadataDisplay
					location={location}
					metadata={metadata ?? []}
					trackId={track.trackId}
				/>
			</TableBody>
		</Table>
	);
};
