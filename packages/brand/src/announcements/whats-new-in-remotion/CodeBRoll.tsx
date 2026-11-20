import {getThemeColors} from '@code-hike/lighter';
import {highlight} from 'codehike/code';
import React, {useLayoutEffect, useState} from 'react';
import type {InteractivitySchema} from 'remotion';
import {
	AbsoluteFill,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
} from 'remotion';
import {brandCodeTheme} from '../../code-theme';
import type {ThemeColors} from './calculate-metadata/theme';
import {ThemeProvider} from './calculate-metadata/theme';
import {CodeTransition} from './CodeTransition';

type CodeBRollProps = {
	readonly code: string;
	/** Previous code for transition animation. Default: none */
	readonly previousCode?: string;
	/** Language for syntax highlighting. Default: "tsx" */
	readonly lang?: string;
	/** Top explainer text. Default: "" */
	readonly topExplainer?: string;
};

const CodeBRollInner: React.FC<CodeBRollProps> = ({
	code,
	previousCode,
	lang = 'tsx',
	topExplainer = '',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {cancelRender, continueRender, delayRender} = useDelayRender();

	const [data, setData] = useState<{
		highlighted: Awaited<ReturnType<typeof highlight>>;
		previousHighlighted: Awaited<ReturnType<typeof highlight>> | null;
		themeColors: ThemeColors;
		handle: number;
	} | null>(null);

	useLayoutEffect(() => {
		const handle = delayRender('Highlighting the promo code example');
		let cancelled = false;
		Promise.all([
			highlight({value: code, lang, meta: ''}, brandCodeTheme),
			getThemeColors(brandCodeTheme),
			previousCode
				? highlight({value: previousCode, lang, meta: ''}, brandCodeTheme)
				: null,
		])
			.then(([highlighted, themeColors, previousHighlighted]) => {
				if (!cancelled) {
					setData({highlighted, themeColors, previousHighlighted, handle});
				}
			})
			.catch((error) => {
				if (!cancelled) cancelRender(error);
			});
		return () => {
			cancelled = true;
			continueRender(handle);
		};
	}, [cancelRender, code, continueRender, delayRender, lang, previousCode]);

	useLayoutEffect(() => {
		if (data) continueRender(data.handle);
	}, [continueRender, data]);

	if (!data) return null;

	const transitionDelay = data.previousHighlighted ? Math.round(fps) : 0;

	return (
		<AbsoluteFill
			showInTimeline={false}
			name="Code example fade"
			style={{
				opacity: interpolate(frame, [0, 6, 114, 120], [0, 1, 1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			<ThemeProvider themeColors={data.themeColors}>
				<AbsoluteFill
					showInTimeline={false}
					style={{backgroundColor: data.themeColors.background}}
				>
					{data.previousHighlighted &&
						transitionDelay > 0 &&
						frame < transitionDelay && (
							<CodeTransition
								previousCode={null}
								currentCode={data.previousHighlighted}
								nextCode={null}
								topExplainerContent={topExplainer}
							/>
						)}
					<Sequence from={transitionDelay} layout="none">
						<CodeTransition
							previousCode={data.previousHighlighted}
							currentCode={data.highlighted}
							nextCode={null}
							topExplainerContent={topExplainer}
						/>
					</Sequence>
				</AbsoluteFill>
			</ThemeProvider>
		</AbsoluteFill>
	);
};

const codeBRollSchema = {
	code: {type: 'string', default: '', description: 'Code'},
	previousCode: {
		type: 'string',
		default: '',
		description: 'Previous code',
	},
	lang: {type: 'string', default: 'tsx', description: 'Language'},
	topExplainer: {type: 'string', default: '', description: 'Heading'},
} as const satisfies InteractivitySchema;

export const CodeBRoll = Interactive.withSchema({
	Component: CodeBRollInner,
	componentName: 'CodeBRoll',
	schema: codeBRollSchema,
	wrapInSequence: true,
	layout: 'absolute-fill',
});
