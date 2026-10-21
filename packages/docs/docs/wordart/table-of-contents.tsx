import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/wordart/rainbow-word-art">
				<strong>{'<RainbowWordArt>'}</strong>
				<div>Arched rainbow text with a gray drop shadow.</div>
			</TOCItem>
			<TOCItem link="/docs/wordart/orange-word-art">
				<strong>{'<OrangeWordArt>'}</strong>
				<div>Slanted gold-to-orange text with deep brown extrusion.</div>
			</TOCItem>
			<TOCItem link="/docs/wordart/blue-wave-word-art">
				<strong>{'<BlueWaveWordArt>'}</strong>
				<div>
					Cyan-to-blue text on a wavy baseline with dark blue extrusion.
				</div>
			</TOCItem>
			<TOCItem link="/docs/wordart/chrome-word-art">
				<strong>{'<ChromeWordArt>'}</strong>
				<div>
					Slanted silver text with a reflective gradient and metallic outline.
				</div>
			</TOCItem>
		</Grid>
	);
};
