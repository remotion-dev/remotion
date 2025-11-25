import type {MetadataTags} from 'mediabunny';
import React from 'react';
import {
	parseIsMadeWithRemotion,
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
	return (
		<>
			{Object.entries(metadata).map(([key, value]) => {
				if (typeof value !== 'string' && typeof value !== 'number') {
					return null;
				}

				const version = parseIsMadeWithRemotion(key, value);

				return (
					<TableRow key={key}>
						<TableCell className="font-brand">
							<LimitedWidthLabel alt={key}>
								{renderMetadataLabel(key, value)}
							</LimitedWidthLabel>
						</TableCell>
						<TableCell className="text-right">
							<LimitedWidthLabel alt={key}>
								{version ? (
									<a
										className="inline-flex flex-row items-center text-brand"
										href={`https://github.com/remotion-dev/remotion/releases/v${version}`}
										target="_blank"
									>
										<svg
											className="h-3 mr-1"
											viewBox="0 0 208 214"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M46.7998 0.0183829C42.3026 0.260829 38.6786 0.969513 35.0265 2.34959C33.2051 3.0303 30.2195 4.51298 28.5765 5.53871C21.7041 9.81881 16.4652 16.253 13.7332 23.7408C13.1886 25.2235 11.7146 29.9511 10.7664 33.2055C4.44784 54.9604 0.861403 78.7481 0.0915388 103.925C-0.0305129 107.935 -0.0305129 117.483 0.0915388 121.428C0.607911 138.119 2.21336 153.188 5.12382 168.556C6.30679 174.775 8.20328 183.13 9.30175 186.926C11.5456 194.637 16.1273 201.202 22.6429 206.014C27.0086 209.24 31.9658 211.403 37.4581 212.466C40.1057 212.979 43.5983 213.212 46.1707 213.045C49.729 212.811 56.7892 211.87 62.5257 210.853C88.3819 206.275 112.266 198.078 133.926 186.347C147.643 178.916 159.369 170.868 170.682 161.105C181.958 151.389 191.572 140.935 200.031 129.205C201.993 126.491 202.979 124.906 203.965 122.911C206.5 117.763 207.692 112.644 207.683 106.918C207.683 101.585 206.669 96.8476 204.481 91.9987C203.43 89.6582 202.425 87.9797 200.172 84.7906C191.872 73.0506 182.662 62.8212 171.433 52.881C154.027 37.4763 133.353 24.8411 110.267 15.4883C105.263 13.4648 100.334 11.6838 94.3999 9.75353C81.838 5.67857 66.2905 2.14445 53.1371 0.382054C51.0716 0.102309 48.2644 -0.0562159 46.7998 0.0183829Z"
												className="fill-brand"
											/>
										</svg>
										{version}
									</a>
								) : (
									renderMetadataValue({
										key,
										value,
									})
								)}
							</LimitedWidthLabel>
						</TableCell>
					</TableRow>
				);
			})}
		</>
	);
};
