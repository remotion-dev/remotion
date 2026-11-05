import type {Caption} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {loadFont} from '@remotion/google-fonts/FiraCode';
import React, {createContext, useContext, useMemo} from 'react';
import {
	Interactive,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceProps,
} from 'remotion';

type BasicCaptionsProps = InteractiveTransformProps &
	Pick<SequenceProps, 'width'> & {
		readonly captions: Caption[];
		readonly combineTokensWithinMilliseconds: number | null;
	};

const defaultCombineTokensWithinMilliseconds = 3000;
const defaultWidth = 900;
const captionsVisibilityContext = createContext(true);
export const BasicCaptionsVisibility = captionsVisibilityContext.Provider;
const {fontFamily: firaCode} = loadFont('normal', {
	weights: ['400'],
	subsets: ['latin'],
});

const basicCaptionsSchema = {
	...Interactive.captionsSchema,
	width: {
		type: 'number',
		min: 1,
		step: 1,
		default: undefined,
		description: 'Caption area width',
		hiddenFromList: false,
	},
	combineTokensWithinMilliseconds: {
		type: 'number',
		min: 0,
		step: 50,
		default: defaultCombineTokensWithinMilliseconds,
		description: 'Time between caption pages',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const BasicCaptionsContent: React.FC<BasicCaptionsProps> = ({
	captions,
	combineTokensWithinMilliseconds,
	style,
	width = defaultWidth,
}) => {
	const frame = useCurrentFrame();
	const visible = useContext(captionsVisibilityContext);
	const {fps} = useVideoConfig();
	const pages = useMemo(
		() =>
			createTikTokStyleCaptions({
				captions,
				combineTokensWithinMilliseconds:
					combineTokensWithinMilliseconds ??
					defaultCombineTokensWithinMilliseconds,
			}).pages,
		[captions, combineTokensWithinMilliseconds],
	);
	const currentTimeMs = (frame / fps) * 1000;
	if (!visible) return null;
	const page = pages.find(
		(candidate) =>
			currentTimeMs >= candidate.startMs &&
			currentTimeMs < candidate.startMs + candidate.durationMs,
	);

	return (
		<div
			style={{
				alignItems: 'center',
				display: 'flex',
				justifyContent: 'center',
				width,
				...style,
			}}
		>
			{page ? (
				<div
					style={{
						backgroundColor: 'rgba(64, 64, 64, 0.75)',
						color: '#ffffff',
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 64,
						fontWeight: 400,
						lineHeight: 1.2,
						padding: '14px 22px',
						textAlign: 'center',
						textWrap: 'balance',
						whiteSpace: 'pre-wrap',
					}}
				>
					{React.Children.map(
						page.text.trim().split(/`([^`\n]+)`/g),
						(text, index) =>
							index % 2 === 0 ? (
								text
							) : (
								<code style={{fontFamily: firaCode, whiteSpace: 'nowrap'}}>
									{text}
								</code>
							),
					)}
				</div>
			) : null}
		</div>
	);
};

export const BasicCaptions = Interactive.create({
	Component: BasicCaptionsContent,
	componentName: '<BasicCaptions>',
	schema: basicCaptionsSchema,
});
