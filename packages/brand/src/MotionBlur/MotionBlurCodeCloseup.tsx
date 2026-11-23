import type {HighlightedCode} from 'codehike/code';
import {highlight, Pre} from 'codehike/code';
import {useLayoutEffect, useState} from 'react';
import {
	Interactive,
	interpolate,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
} from 'remotion';
import {brandCodeLineHeight, brandCodeTheme} from '../code-theme';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const example = `import {
  HtmlInCanvasMotionBlur,
} from '@remotion/motion-blur';
import {
  useCurrentFrame, useVideoConfig,
} from 'remotion';

const MovingText = () => {
  const translate = \`\${useCurrentFrame() * 10}px 0\`;
  return <h1 style={{translate}}>Hello!</h1>;
};

export const MotionBlurExample = () => {
  const {width, height} = useVideoConfig();

  return (
    <HtmlInCanvasMotionBlur
      width={width}
      height={height}
      samples={8}
      shutterAngle={180}
    >
      <MovingText />
    </HtmlInCanvasMotionBlur>
  );
};`;

const MotionBlurCodeCloseupContent = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const fitScale = Math.min(width / 1080, height / 960);
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [highlighted, setHighlighted] = useState<{
		readonly code: HighlightedCode;
		readonly handle: number;
	} | null>(null);

	useLayoutEffect(() => {
		const handle = delayRender('Highlighting the motion blur example');
		let cancelled = false;
		highlight({value: example, lang: 'tsx', meta: ''}, brandCodeTheme)
			.then((code) => {
				if (!cancelled) setHighlighted({code, handle});
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
		if (highlighted) continueRender(highlighted.handle);
	}, [continueRender, highlighted]);

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: '#24292e',
				overflow: 'hidden',
			}}
		>
			<Interactive.Div
				name="Motion blur React example"
				style={{
					position: 'absolute',
					left: `calc(50% + ${218 * fitScale}px)`,
					top: `calc(46% - ${250 * fitScale}px)`,
					width: 960,
					translate: '-50% -50%',
					rotate: EXPLORE_CAMERA_ANGLE,
					transform: 'perspective(100px)',
					willChange: 'transform',
					scale: interpolate(
						frame,
						[0, 2.6 * fps],
						[1.55 * fitScale, 1.63 * fitScale],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					boxSizing: 'border-box',
					padding: '26px 32px',
				}}
			>
				{highlighted ? (
					<Pre
						code={highlighted.code}
						style={{
							margin: 0,
							fontFamily: 'Menlo, Monaco, monospace',
							fontSize: 27,
							lineHeight: brandCodeLineHeight,
						}}
					/>
				) : null}
			</Interactive.Div>
		</div>
	);
};

export const MotionBlurCodeCloseup = Interactive.create({
	Component: MotionBlurCodeCloseupContent,
	layout: 'absolute-fill',
	schema: {},
});
