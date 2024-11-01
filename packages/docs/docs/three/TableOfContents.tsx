import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/three-canvas">
					<strong>{'<ThreeCanvas>'}</strong>
					<div>A wrapper for React Three Fiber{"'"} Canvas</div>
				</TOCItem>
				<TOCItem link="/docs/use-video-texture">
					<strong>{'useVideoTexture('}</strong>
					<div>Use a video in React Three Fiber </div>
				</TOCItem>
				<TOCItem link="/docs/use-offthread-video-texture">
					<strong>{'useOffthreadVideoTexture()'}</strong>
					<div>Use an {'<OffthreadVideo>'} in React Three Fiber </div>
				</TOCItem>
			</Grid>
		</div>
	);
};
