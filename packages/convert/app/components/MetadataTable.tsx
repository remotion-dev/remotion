import type {MetadataTags} from 'mediabunny';
import React from 'react';
import {
	renderMetadataLabel,
	renderMetadataValue,
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
	readonly metadata: MetadataTags;
}> = ({metadata}) => {
	console.log(Object.entries(metadata));
	return (
		<>
			{Object.entries(metadata).map(([key, value]) => {
				if (typeof value !== 'string' && typeof value !== 'number') {
					return null;
				}

				return (
					<TableRow key={key}>
						<TableCell className="font-brand">
							<LimitedWidthLabel alt={key}>
								{renderMetadataLabel(key)}
							</LimitedWidthLabel>
						</TableCell>
						<TableCell className="text-right">
							<LimitedWidthLabel alt={key}>
								{renderMetadataValue({
									key,
									value,
								})}
							</LimitedWidthLabel>
						</TableCell>
					</TableRow>
				);
			})}
		</>
	);
};
