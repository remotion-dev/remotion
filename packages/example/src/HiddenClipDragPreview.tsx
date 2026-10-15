import {Video} from '@remotion/media';
import React from 'react';
import {Sequence, Series, staticFile} from 'remotion';

export const HiddenClipDragPreview: React.FC = () => (
	<>
		<Sequence name="Hidden scene" from={180} durationInFrames={90}>
			<Video
				name="Hidden clip"
				src={staticFile('demo_smpte_h264_aac.mp4')}
				from={0}
				durationInFrames={90}
				trimBefore={0}
				muted
			/>
		</Sequence>
		<Sequence name="Previously visible scene" from={60} durationInFrames={90}>
			<Series>
				<Series.Sequence
					name="Trimmed scene"
					trimBefore={30}
					durationInFrames={90}
				>
					<Video
						name="Nested hidden clip"
						src={staticFile('demo_smpte_h264_aac.mp4')}
						muted
					/>
				</Series.Sequence>
			</Series>
		</Sequence>
	</>
);
