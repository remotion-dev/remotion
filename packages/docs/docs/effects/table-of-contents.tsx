import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
};

const previewImage: React.CSSProperties = {
	width: 150,
	height: 100,
	objectFit: 'cover',
	borderRadius: 4,
	flexShrink: 0,
};

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/effects/blur">
					<div style={row}>
						<img
							src="/img/effects-blur-preview.jpg"
							alt="blur effect preview"
							style={previewImage}
						/>
						<div style={{flex: 1, marginLeft: 10}}>
							<strong>
								<code>{'blur()'}</code>
							</strong>
							<div>Gaussian blur effect</div>
						</div>
					</div>
				</TOCItem>
				<TOCItem link="/docs/effects/grayscale">
					<div style={row}>
						<img
							src="/img/effects-grayscale-preview.jpg"
							alt="grayscale effect preview"
							style={previewImage}
						/>
						<div style={{flex: 1, marginLeft: 10}}>
							<strong>
								<code>{'grayscale()'}</code>
							</strong>
							<div>Black-and-white effect</div>
						</div>
					</div>
				</TOCItem>
				<TOCItem link="/docs/effects/invert">
					<div style={row}>
						<img
							src="/img/effects-invert-preview.jpg"
							alt="invert effect preview"
							style={previewImage}
						/>
						<div style={{flex: 1, marginLeft: 10}}>
							<strong>
								<code>{'invert()'}</code>
							</strong>
							<div>Negative color effect</div>
						</div>
					</div>
				</TOCItem>
				<TOCItem link="/docs/effects/hue">
					<div style={row}>
						<img
							src="/img/effects-hue-preview.jpg"
							alt="hue effect preview"
							style={previewImage}
						/>
						<div style={{flex: 1, marginLeft: 10}}>
							<strong>
								<code>{'hue()'}</code>
							</strong>
							<div>Hue rotation effect</div>
						</div>
					</div>
				</TOCItem>
				<TOCItem link="/docs/effects/wave">
					<div style={row}>
						<img
							src="/img/effects-wave-preview.jpg"
							alt="wave effect preview"
							style={previewImage}
						/>
						<div style={{flex: 1, marginLeft: 10}}>
							<strong>
								<code>{'wave()'}</code>
							</strong>
							<div>Sine wave distortion</div>
						</div>
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
