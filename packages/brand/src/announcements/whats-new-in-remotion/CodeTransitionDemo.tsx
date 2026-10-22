import {getThemeColors} from '@code-hike/lighter';
import {highlight} from 'codehike/code';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill} from 'remotion';
import type {ThemeColors} from './calculate-metadata/theme';
import {ThemeProvider} from './calculate-metadata/theme';
import {CodeTransition} from './CodeTransition';

const CODE_BEFORE = `
import { LightLeak } from "@remotion/light-leaks";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
`.trim();

const CODE_AFTER = `
import { LightLeak } from "@remotion/light-leaks";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Overlay durationInFrames={15}>
    <LightLeak seed={4} />
  </TransitionSeries.Overlay>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
`.trim();

const THEME = 'github-light';

export const CodeTransitionDemo: React.FC = () => {
	const [data, setData] = useState<{
		before: Awaited<ReturnType<typeof highlight>>;
		after: Awaited<ReturnType<typeof highlight>>;
		themeColors: ThemeColors;
	} | null>(null);

	useEffect(() => {
		Promise.all([
			highlight({value: CODE_BEFORE, lang: 'tsx', meta: ''}, THEME),
			highlight({value: CODE_AFTER, lang: 'tsx', meta: ''}, THEME),
			getThemeColors(THEME),
		]).then(([before, after, themeColors]) => {
			setData({before, after, themeColors});
		});
	}, []);

	if (!data) return null;

	return (
		<ThemeProvider themeColors={data.themeColors}>
			<AbsoluteFill style={{backgroundColor: data.themeColors.background}}>
				<CodeTransition
					previousCode={data.before}
					currentCode={data.after}
					nextCode={null}
					topExplainerContent="Adding a Light Leak transition"
				/>
			</AbsoluteFill>
		</ThemeProvider>
	);
};
