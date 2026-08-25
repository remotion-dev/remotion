import {
	Caption,
	createTikTokStyleCaptions,
	TikTokToken,
} from '@remotion/captions';
import React, {useMemo} from 'react';
import {
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const Token: React.FC<{
	token: TikTokToken;
	pageStart: number;
}> = ({token, pageStart}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const start = ((token.fromMs - pageStart) / 1000) * 30;
	const end = ((token.toMs - pageStart) / 1000) * 30;

	const active = frame >= start && frame < end;
	const jump =
		spring({
			fps,
			frame,
			config: {damping: 200},
			durationInFrames: 3,
			delay: start,
		}) -
		spring({
			fps,
			frame,
			config: {damping: 200},
			durationInFrames: 3,
			delay: 1 + start,
		});

	const style: React.CSSProperties = useMemo(() => {
		return {
			display: 'inline-block',
			background: active ? '#0983F1' : 'white',
			paddingTop: 3,
			paddingBottom: 3,
			color: active ? 'white' : 'black',
			border: active ? '2px double #0983F1' : '1px solid transparent',
			borderRadius: 5,
			scale: String(1 + jump * 0.1),
		};
	}, [active, jump]);

	return (
		<span>
			{' '}
			<span style={style}>{token.text.trim()}</span>
		</span>
	);
};

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
						key={page.startMs}
					>
						<div key={page.startMs}>
							{page.tokens.map((t) => {
								return (
									<Token pageStart={page.startMs} key={t.fromMs} token={t} />
								);
							})}
						</div>
					</Sequence>
				);
			})}
		</div>
	);
};
