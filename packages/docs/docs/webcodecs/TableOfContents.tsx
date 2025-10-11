import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const WebCodecsGuide: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/webcodecs/convert-a-video">
					<strong>Convert a video</strong>
					<div>from one format to another</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/rotate-a-video">
					<strong>Rotate a video</strong>
					<div>Fix bad orientation</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/track-transformation">
					<strong>Track Transformation</strong>
					<div>Copy, re-encode or drop tracks</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/pause-resume-abort">
					<strong>Pause, resume and abort conversion</strong>
					<div>Steer the conversion process</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/fix-mediarecorder-video">
					<strong>Fix a MediaRecorder video</strong>
					<div>Fix missing video duration and poor seeking performance</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/resample-audio-16khz">
					<strong>Resample audio to 16kHz</strong>
					<div>Resample an audio track to 16kHz for use with Whisper</div>
				</TOCItem>
			</Grid>
		</div>
	);
};

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
				<TOCItem link="/docs/webcodecs/webcodecs-controller">
					<strong>{'webcodecsController()'}</strong>
					<div>Pause, resume and abort the conversion.</div>
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
				<TOCItem link="/docs/webcodecs/get-available-audio-codecs">
					<strong>{'getAvailableAudioCodecs()'}</strong>
					<div>Get the audio codecs that can fit in a container.</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/get-available-video-codecs">
					<strong>{'getAvailableVideoCodecs()'}</strong>
					<div>Get the video codecs that can fit in a container.</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/convert-audiodata">
					<strong>{'convertAudioData()'}</strong>
					<div>
						Change the format or sample rate of an <code>AudioData</code>{' '}
						object.
					</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/create-audio-decoder">
					<strong>{'createAudioDecoder()'}</strong>
					<div>
						Create an <code>AudioDecoder</code> object.
					</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/create-video-decoder">
					<strong>{'createVideoDecoder()'}</strong>
					<div>
						Create a <code>VideoDecoder</code> object.
					</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/extract-frames">
					<strong>{'extractFrames()'}</strong>
					<div>Extract frames from a video at specific timestamps.</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/get-partial-audio-data">
					<strong>{'getPartialAudioData()'}</strong>
					<div>
						Extract audio data from a specific time window of a media file.
					</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/rotate-and-resize-video-frame">
					<strong>{'rotateAndResizeVideoFrame()'}</strong>
					<div>Rotate and resize a video frame.</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/web-fs-writer">
					<strong>{'webFsWriter'}</strong>
					<div>
						Writer that saves to browser file system using File System Access
						API.
					</div>
				</TOCItem>
				<TOCItem link="/docs/webcodecs/buffer-writer">
					<strong>{'bufferWriter'}</strong>
					<div>Writer that saves to an in-memory resizable ArrayBuffer.</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
