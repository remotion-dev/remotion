import {getThemeColors} from '@code-hike/lighter';
import {highlight} from 'codehike/code';
import React, {useLayoutEffect, useState} from 'react';
import {AbsoluteFill, useDelayRender} from 'remotion';
import {brandCodeTheme} from '../../code-theme';
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

export const CodeTransitionDemo: React.FC = () => {
	const {cancelRender, continueRender, delayRender} = useDelayRender();
	const [data, setData] = useState<{
		before: Awaited<ReturnType<typeof highlight>>;
		after: Awaited<ReturnType<typeof highlight>>;
		themeColors: ThemeColors;
		handle: number;
	} | null>(null);

	useLayoutEffect(() => {
		const handle = delayRender('Highlighting the code transition');
		let cancelled = false;
		Promise.all([
			highlight({value: CODE_BEFORE, lang: 'tsx', meta: ''}, brandCodeTheme),
			highlight({value: CODE_AFTER, lang: 'tsx', meta: ''}, brandCodeTheme),
			getThemeColors(brandCodeTheme),
		])
			.then(([before, after, themeColors]) => {
				if (!cancelled) setData({before, after, themeColors, handle});
			})
			.catch((error) => {
				if (!cancelled) cancelRender(error);
			});
		return () => {
			cancelled = true;
			continueRender(handle);
		};
	}, [cancelRender, continueRender, delayRender]);

	useLayoutEffect(() => {
		if (data) continueRender(data.handle);
	}, [continueRender, data]);

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
