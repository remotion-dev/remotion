import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/skia/enable-skia">
					<strong>{'enableSkia()'}</strong>
					<div>Webpack override for enabling Skia</div>
				</TOCItem>
				<TOCItem link="/docs/skia/skia-canvas">
					<strong>{'<SkiaCanvas>'}</strong>
					<div>React Native Skia {'<Canvas>'} wrapper</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
