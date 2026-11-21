import type {Caption} from '@remotion/captions';
import {Video} from '@remotion/media';
import React from 'react';
import {
	Interactive,
	Track,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const SourceCaptionsInner: React.FC<{
	readonly captions: Caption[];
}> = ({captions}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sourceTimeMs = (frame / fps) * 1000;
	const caption = captions.find(
		({startMs, endMs}) => sourceTimeMs >= startMs && sourceTimeMs < endMs,
	);

	return (
		<div>
			{caption ? (
				<span style={{backgroundColor: '#111827', padding: '16px 32px'}}>
					{caption.text}
				</span>
			) : null}
		</div>
	);
};

const SourceCaptions = Interactive.create({
	Component: SourceCaptionsInner,
	layout: 'absolute-fill',
	schema: Interactive.captionsSchema,
});

const CaptionedVideoInner: React.FC = () => {
	return (
		<>
			<Video name="Footage" src={staticFile('demo_smpte_h264_aac.mp4')} />
			<SourceCaptions
				name="Captions"
				captions={[
					{
						text: 'Source second 2',
						startMs: 2000,
						endMs: 3000,
						timestampMs: null,
						confidence: null,
					},
					{
						text: 'Source second 3',
						startMs: 3000,
						endMs: 4000,
						timestampMs: null,
						confidence: null,
					},
					{
						text: 'Source second 4',
						startMs: 4000,
						endMs: 5000,
						timestampMs: null,
						confidence: null,
					},
				]}
			/>
		</>
	);
};

export const CaptionedVideo = Interactive.create({
	Component: CaptionedVideoInner,
	layout: 'absolute-fill',
});

export const CombinedCaptionedVideoExample: React.FC = () => {
	return (
		<Track name="Captioned clips">
			<CaptionedVideo trimBefore={60} durationInFrames={90} />
			<CaptionedVideo
				from={90}
				trimBefore={60}
				durationInFrames={90}
				playbackRate={1.5}
			/>
		</Track>
	);
};
