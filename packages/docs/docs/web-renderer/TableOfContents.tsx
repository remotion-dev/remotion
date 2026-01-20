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
				<TOCItem link="/docs/web-renderer/can-render-media-on-web">
					<strong>{'canRenderMediaOnWeb()'}</strong>
					<div>Check if a render can be performed</div>
				</TOCItem>
				<TOCItem link="/docs/web-renderer/get-encodable-video-codecs">
					<strong>{'getEncodableVideoCodecs()'}</strong>
					<div>Get video codecs the browser can encode</div>
				</TOCItem>
				<TOCItem link="/docs/web-renderer/get-encodable-audio-codecs">
					<strong>{'getEncodableAudioCodecs()'}</strong>
					<div>Get audio codecs the browser can encode</div>
				</TOCItem>
				<TOCItem link="/docs/web-renderer/types">
					<strong>{'Types'}</strong>
					<div>TypeScript types reference</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
