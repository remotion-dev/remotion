import {MetadataEntry} from '@remotion/media-parser';
import React, {useMemo} from 'react';
import {
	renderMetadataLabel,
	renderMetadataValue,
	sortMetadataByRelevance,
} from '~/lib/render-metadata-label';
import {TableCell, TableRow} from './ui/table';

const LimitedWidthLabel: React.FC<{
	readonly children: React.ReactNode;
	readonly alt: string;
}> = ({children, alt}) => {
	return (
		<div className="text-ellipsis break-words" title={alt}>
			{children}
		</div>
	);
};

export const MetadataDisplay: React.FC<{
	readonly metadata: MetadataEntry[];
	readonly trackId: number | null;
}> = ({metadata, trackId}) => {
	const filtered = useMemo(() => {
		return sortMetadataByRelevance(metadata).filter((entry) => {
			return entry.trackId === trackId;
		});
	}, [metadata, trackId]);

	return (
		<>
			{filtered.map((entry) => (
				<TableRow>
					<TableCell className="font-brand">
						<LimitedWidthLabel alt={entry.key}>
							{renderMetadataLabel(entry.key)}
						</LimitedWidthLabel>
					</TableCell>
					<TableCell className="text-right">
						<LimitedWidthLabel alt={entry.key}>
							{renderMetadataValue(entry.key, entry.value)}
						</LimitedWidthLabel>
					</TableCell>
				</TableRow>
			))}
		</>
	);
};
