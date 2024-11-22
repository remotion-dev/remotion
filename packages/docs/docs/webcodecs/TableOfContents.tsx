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
				<TOCItem link="/docs/webcodecs/get-available-containers">
					<strong>{'getAvailableContainers()'}</strong>
					<div>
						Get a list of containers <code>@remotion/webcodecs</code> supports.
					</div>
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
				<TOCItem link="/docs/webcodecs/can-copy-audio-track">
					<strong>{'canCopyAudioTrack()'}</strong>
					<div>
						Determine if a audio track can be copied without re-encoding
					</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/get-default-audio-codec">
					<strong>{'getDefaultAudioCodec()'}</strong>
					<div>
						Gets the default audio codec for a container if no other audio codec
						is specified.
					</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/get-default-video-codec">
					<strong>{'getDefaultVideoCodec()'}</strong>
					<div>
						Gets the default video codec for a container if no other audio codec
						is specified.
					</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/default-on-audio-track-handler">
					<strong>{'defaultOnAudioTrackHandler()'}</strong>
					<div>The default track transformation function for audio tracks.</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/default-on-video-track-handler">
					<strong>{'defaultOnVideoTrackHandler()'}</strong>
					<div>The default track transformation function for video tracks.</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
