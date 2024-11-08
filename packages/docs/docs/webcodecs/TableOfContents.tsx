import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/webcodecs/convert-media">
					<strong>{'convertMedia()'}</strong>
					<div>Converts a video using WebCodecs and Media Parser</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/can-reencode-video-track">
					<strong>{'canReencodeVideoTrack()'}</strong>
					<div>Determine if a video track can be re-encoded</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/can-reencode-audio-track">
					<strong>{'canReencodeAudioTrack()'}</strong>
					<div>Determine if a audio track can be re-encoded</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/can-copy-video-track">
					<strong>{'canCopyVideoTrack()'}</strong>
					<div>
						Determine if a video track can be copied without re-encoding
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
