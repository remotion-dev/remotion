import {Caption, createTikTokStyleCaptions} from '@remotion/captions';
import React from 'react';
import {Sequence, staticFile, useVideoConfig} from 'remotion';

export const Captions: React.FC = () => {
	const [captions, setCaptions] = React.useState<Caption[] | null>(null);
	const {fps} = useVideoConfig();

	React.useEffect(() => {
		fetch(staticFile('video.json'))
			.then((response) => response.json())
			.then((data) => setCaptions(data));
	}, []);

	if (!captions) {
		return null;
	}

	const tikTokCaptions = createTikTokStyleCaptions({
		captions,
		combineTokensWithinMilliseconds: 800,
	});

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
			}}
		>
			{tikTokCaptions.pages.map((page) => {
				return (
					<Sequence
						from={(page.startMs / 1000) * fps}
						durationInFrames={(page.durationMs / 1000) * fps}
						layout="none"
					>
						<div key={page.startMs}>
							{page.tokens.map((t) => {
								return <span style={{display: 'inline'}}>{t.text}</span>;
							})}
						</div>
					</Sequence>
				);
			})}
		</div>
	);
};
