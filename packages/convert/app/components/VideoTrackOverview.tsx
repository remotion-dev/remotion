import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';
import type {VideoTrack} from '@remotion/media-parser';
import React from 'react';

export const VideoTrackOverview: React.FC<{
	readonly track: VideoTrack;
}> = ({track}) => {
	return (
		<Table>
			<TableBody>
				<TableRow>
					<TableCell colSpan={3}>Type</TableCell>
					<TableCell className="text-right">Video</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Codec</TableCell>
					<TableCell className="text-right">
						{track.codecWithoutConfig}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>WebCodecs Codec String</TableCell>
					<TableCell className="text-right">{track.codec}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Dimensions</TableCell>
					<TableCell className="text-right">
						{track.width}x{track.height}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Timescale</TableCell>
					<TableCell className="text-right">{track.timescale}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Sample Aspect Ratio</TableCell>
					<TableCell className="text-right">
						{track.sampleAspectRatio.numerator}:
						{track.sampleAspectRatio.denominator}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Rotation</TableCell>
					<TableCell className="text-right">{track.rotation}°</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Unrotated dimensions</TableCell>
					<TableCell className="text-right">
						{track.codedWidth}x{track.codedHeight}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Color Primaries</TableCell>
					<TableCell className="text-right">
						{track.color.primaries ?? 'N/A'}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Color Matrix</TableCell>
					<TableCell className="text-right">
						{track.color.matrixCoefficients ?? 'N/A'}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Color Transfer Characteristics</TableCell>
					<TableCell className="text-right">
						{track.color.transferCharacteristics ?? 'N/A'}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell colSpan={3}>Color Full Range</TableCell>
					<TableCell className="text-right">
						{track.color.fullRange
							? 'Yes'
							: track.color.fullRange === false
								? 'No'
								: 'N/A'}
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
};
