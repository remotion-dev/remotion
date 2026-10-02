import type {Caption, TikTokPage} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import React, {useMemo} from 'react';
import {
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceProps,
} from 'remotion';
import {display} from '../fonts';
import {colors} from '../theme';

type PunchyCaptionsProps = InteractiveTransformProps &
	Pick<SequenceProps, 'width'> & {
		readonly captions: Caption[];
		readonly combineTokensWithinMilliseconds?: number;
		readonly fontSize?: number;
		readonly keywords?: string[];
		readonly keywordColor?: string;
	};

const punchyCaptionsSchema = {
	...Interactive.captionsSchema,
	width: {
		type: 'number',
		min: 1,
		step: 1,
		default: undefined,
		description: 'Caption area width',
		hiddenFromList: false,
	},
	fontSize: {
		type: 'number',
		min: 10,
		step: 1,
		default: 60,
		description: 'Font size',
		hiddenFromList: false,
	},
	combineTokensWithinMilliseconds: {
		type: 'number',
		min: 0,
		step: 50,
		default: 1500,
		description: 'Time between caption pages',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const normalize = (word: string) =>
	word
		.trim()
		.toLowerCase()
		.replace(/[.,!?;:]/g, '');

const CaptionPage: React.FC<{
	readonly page: TikTokPage;
	readonly timeMs: number;
	readonly fontSize: number;
	readonly keywords: Set<string>;
	readonly keywordColor: string;
}> = ({page, timeMs, fontSize, keywords, keywordColor}) => {
	const {fps} = useVideoConfig();
	const pageFrame = ((timeMs - page.startMs) / 1000) * fps;
	const enter = spring({
		frame: pageFrame,
		fps,
		config: {damping: 200},
		durationInFrames: 7,
	});

	return (
		<div
			style={{
				fontFamily: display,
				fontWeight: 700,
				fontSize,
				lineHeight: 1.22,
				letterSpacing: '-0.01em',
				textAlign: 'center',
				textWrap: 'balance',
				color: colors.paper,
				opacity: enter,
				translate: `0px ${(1 - enter) * 14}px`,
				textShadow: '0 2px 3px rgba(0,0,0,0.55), 0 6px 22px rgba(0,0,0,0.45)',
			}}
		>
			{page.tokens.map((token, i) => {
				const visible = token.text.trim();
				const leading = token.text.slice(0, token.text.indexOf(visible));
				const active = timeMs >= token.fromMs && timeMs < token.toMs;
				const spoken = timeMs >= token.toMs;
				const tokenFrame = ((timeMs - token.fromMs) / 1000) * fps;
				const popIn = active
					? spring({
							frame: tokenFrame,
							fps,
							config: {damping: 14, stiffness: 220},
							durationInFrames: 8,
						})
					: 0;
				const isKeyword = keywords.has(normalize(visible));
				return (
					<React.Fragment key={`${token.fromMs}-${i}`}>
						{leading}
						<span
							style={{
								display: 'inline-block',
								whiteSpace: 'pre',
								padding: '0.02em 0.16em 0.06em',
								margin: '0 -0.06em',
								borderRadius: '0.22em',
								backgroundColor: active ? colors.blue : 'rgba(11,132,243,0)',
								color: active
									? colors.paper
									: isKeyword
										? keywordColor
										: colors.paper,
								opacity: active || spoken ? 1 : 0.62,
								scale: active ? interpolate(popIn, [0, 1], [0.92, 1.06]) : 1,
								boxShadow: active ? '0 8px 24px rgba(11,132,243,0.45)' : 'none',
								textShadow: active ? 'none' : undefined,
							}}
						>
							{visible}
						</span>
					</React.Fragment>
				);
			})}
		</div>
	);
};

const PunchyCaptionsContent: React.FC<PunchyCaptionsProps> = ({
	captions,
	combineTokensWithinMilliseconds = 1500,
	fontSize = 60,
	keywords = [],
	keywordColor = '#FFD34D',
	style,
	width = 1300,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pages = useMemo(
		() =>
			createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds})
				.pages,
		[captions, combineTokensWithinMilliseconds],
	);
	const keywordSet = useMemo(
		() => new Set(keywords.map(normalize)),
		[keywords],
	);
	const timeMs = (frame / fps) * 1000;
	const page = pages.find(
		(p) => timeMs >= p.startMs && timeMs < p.startMs + p.durationMs,
	);

	return (
		<div
			style={{
				position: 'absolute',
				width,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'flex-end',
				...style,
			}}
		>
			{page ? (
				<CaptionPage
					key={page.startMs}
					page={page}
					timeMs={timeMs}
					fontSize={fontSize}
					keywords={keywordSet}
					keywordColor={keywordColor}
				/>
			) : null}
		</div>
	);
};

export const PunchyCaptions = Interactive.withSchema({
	Component: PunchyCaptionsContent,
	componentName: '<PunchyCaptions>',
	schema: punchyCaptionsSchema,
	wrapInSequence: true,
});
