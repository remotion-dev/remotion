import {getThemeColors} from '@code-hike/lighter';
import {highlight} from 'codehike/code';
import React, {useEffect, useState} from 'react';
import {
	AbsoluteFill,
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
	readonly code: string;
	/** Previous code for transition animation. Default: none */
	readonly previousCode?: string;
	/** Duration in seconds. Default: 4 */
	readonly durationSeconds?: number;
	/** Fade in/out duration in seconds. Default: 0.2 */
	readonly fadeDuration?: number;
	/** Language for syntax highlighting. Default: "tsx" */
	readonly lang?: string;
	/** Top explainer text. Default: "" */
	readonly topExplainer?: string;
};

export const CodeBRoll: React.FC<CodeBRollProps> = ({
	code,
	previousCode,
	durationSeconds = 4,
	fadeDuration = 0.2,
	lang = 'tsx',
	topExplainer = '',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const duration = Math.round(durationSeconds * fps);
	const fade = fadeDuration * fps;

	const opacity = interpolate(
		frame,
		[0, fade, duration - fade, duration],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

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
		<AbsoluteFill style={{opacity}}>
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
