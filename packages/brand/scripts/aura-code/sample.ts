import {editorCode} from '../../../promo-pages/src/components/homepage/studio-handoff/editor-code';

// Use the actual homepage example, with timing and assets expressed according
// to the current Remotion markup guidance.
export const sample = editorCode
	.map((line) => line.map(([content]) => content).join(''))
	.join('\n')
	.replace(
		"import {TransitionSeries} from '@remotion/transitions';",
		"import {TransitionSeries} from '@remotion/transitions';\nimport {staticFile, useVideoConfig} from 'remotion';",
	)
	.replace(
		'export const WhatsNew = () => {',
		'export const WhatsNew = () => {\n  const {fps} = useVideoConfig();',
	)
	.replace('durationInFrames={250}', 'durationInFrames={5 * fps}')
	.replace('durationInFrames={864}', 'durationInFrames={14 * fps}')
	.replace('durationInFrames={180}', 'durationInFrames={3 * fps}')
	.replace('src="score.wav"', "src={staticFile('score.wav')}");
