import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table';
import type {MediaParserKeyframe} from '@remotion/media-parser';
import type {InputVideoTrack} from 'mediabunny';
import React, {useEffect, useState} from 'react';
import {renderHumanReadableVideoCodec} from '~/lib/render-codec-label';
import {KeyframesInfo} from './KeyframesInfo';

export const VideoTrackOverview: React.FC<{
	readonly track: InputVideoTrack;
	readonly keyframes: MediaParserKeyframe[] | null;
	readonly durationInSeconds: number | null;
}> = ({track, keyframes, durationInSeconds}) => {
	const [colorSpace, setColorSpace] = useState<VideoColorSpaceInit | null>(
		null,
	);
	useEffect(() => {
		track.getColorSpace().then((space) => {
			setColorSpace(space);
		});
	}, [track]);

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
						{renderHumanReadableVideoCodec(track.codec)}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">WebCodecs Codec String</TableCell>
					<TableCell className="text-right">{track.codec}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Dimensions</TableCell>
					<TableCell className="text-right">
						{track.displayWidth}x{track.displayHeight}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-brand">Timescale</TableCell>
					<TableCell className="text-right">{track.timeResolution}</TableCell>
				</TableRow>
				{keyframes !== null ? (
					<KeyframesInfo
						durationInSeconds={durationInSeconds}
						keyframes={keyframes}
						trackId={track.id}
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
				{colorSpace ? (
					<>
						<TableRow>
							<TableCell className="font-brand">Color Primaries</TableCell>
							<TableCell className="text-right">
								{colorSpace.primaries ?? 'N/A'}
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-brand">Color Matrix</TableCell>
							<TableCell className="text-right">
								{colorSpace.matrix ?? 'N/A'}
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-brand">
								Color Transfer Characteristics
							</TableCell>
							<TableCell className="text-right">
								{colorSpace.transfer ?? 'N/A'}
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-brand">Color Full Range</TableCell>
							<TableCell className="text-right">
								{colorSpace.fullRange
									? 'Yes'
									: colorSpace.fullRange === false
										? 'No'
										: 'N/A'}
							</TableCell>
						</TableRow>
					</>
				) : null}
			</TableBody>
		</Table>
	);
};
