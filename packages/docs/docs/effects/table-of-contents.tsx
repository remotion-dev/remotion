import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
};

const previewImage: React.CSSProperties = {
	width: 180,
	height: 120,
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
							<div>Gaussian blur for canvas components</div>
						</div>
					</div>
				</TOCItem>
				<TOCItem link="/docs/effects/wave">
					<div style={row}>
						<div style={{flex: 1}}>
							<strong>
								<code>{'wave()'}</code>
							</strong>
							<div>Sine wave warp for canvas components</div>
						</div>
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
