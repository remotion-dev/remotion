import {getThemeColors} from '@code-hike/lighter';
import {highlight} from 'codehike/code';
import React, {useEffect, useState} from 'react';
import type {InteractivitySchema} from 'remotion';
import {
	AbsoluteFill,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import type {ThemeColors} from './calculate-metadata/theme';
import {ThemeProvider} from './calculate-metadata/theme';
import {CodeTransition} from './CodeTransition';

const THEME = 'github-light';

type CodeBRollProps = {
	readonly style?: React.CSSProperties;
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
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const [data, setData] = useState<{
		highlighted: Awaited<ReturnType<typeof highlight>>;
		previousHighlighted: Awaited<ReturnType<typeof highlight>> | null;
		themeColors: ThemeColors;
	} | null>(null);

	useEffect(() => {
		const promises: Promise<unknown>[] = [
			highlight({value: code, lang, meta: ''}, THEME),
			getThemeColors(THEME),
		];
		if (previousCode) {
			promises.push(highlight({value: previousCode, lang, meta: ''}, THEME));
		}

		Promise.all(promises).then((results) => {
			setData({
				highlighted: results[0] as Awaited<ReturnType<typeof highlight>>,
				themeColors: results[1] as ThemeColors,
				previousHighlighted: results[2]
					? (results[2] as Awaited<ReturnType<typeof highlight>>)
					: null,
			});
		});
	}, [code, previousCode, lang]);

	if (!data) return null;

	const transitionDelay = data.previousHighlighted ? Math.round(fps) : 0;

	return (
		<AbsoluteFill
			name="Code example fade"
			style={{
				opacity: interpolate(frame, [0, 6, 114, 120], [0, 1, 1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				...style,
			}}
		>
			<ThemeProvider themeColors={data.themeColors}>
				<AbsoluteFill style={{backgroundColor: data.themeColors.background}}>
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
	code: {type: 'text-content', default: '', description: 'Code'},
	previousCode: {
		type: 'text-content',
		default: '',
		description: 'Previous code',
	},
	lang: {type: 'text-content', default: 'tsx', description: 'Language'},
	topExplainer: {type: 'text-content', default: '', description: 'Heading'},
} as const satisfies InteractivitySchema;

export const CodeBRoll = Interactive.withSchema({
	Component: CodeBRollInner,
	componentName: '<CodeBRoll>',
	schema: codeBRollSchema,
	wrapInSequence: true,
});
