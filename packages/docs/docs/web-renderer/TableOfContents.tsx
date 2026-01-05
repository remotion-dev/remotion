import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/web-renderer/render-media-on-web">
					<strong>{'renderMediaOnWeb()'}</strong>
					<div>Render a video in the browser</div>
				</TOCItem>
				<TOCItem link="/docs/web-renderer/render-still-on-web">
					<strong>{'renderStillOnWeb()'}</strong>
					<div>Render a still image in the browser</div>
				</TOCItem>
				<TOCItem link="/docs/web-renderer/can-render">
					<strong>{'canRender()'}</strong>
					<div>Check if browser supports rendering</div>
				</TOCItem>
				<TOCItem link="/docs/web-renderer/can-render-video-codec">
					<strong>{'canRenderVideoCodec()'}</strong>
					<div>Check video codec support</div>
				</TOCItem>
				<TOCItem link="/docs/web-renderer/can-render-audio-codec">
					<strong>{'canRenderAudioCodec()'}</strong>
					<div>Check audio codec support</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
