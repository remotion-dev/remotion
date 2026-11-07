import {Interactive, useCurrentFrame} from 'remotion';
import {getNaturalTypedCharacterCount} from '../natural-typing';
import {HigherLevelTaskPrompt} from './HigherLevelTaskPrompt';

const BeatMatchPromptContent = () => {
	const frame = useCurrentFrame();
	const prefix = 'See ';
	const path = '~/Downloads/track.mp3';
	const instruction =
		' and analyze the beat for its rhythm. Place placeholder text on the timeline so I can fill in content later.';
	const typedPrefix = getNaturalTypedCharacterCount({
		text: prefix,
		frame,
		startFrame: 0,
		durationInFrames: 12,
		startCharacter: 0,
		endCharacter: prefix.length,
	});
	const typedInstruction = getNaturalTypedCharacterCount({
		text: instruction,
		frame,
		startFrame: 32,
		durationInFrames: 158,
		startCharacter: 0,
		endCharacter: instruction.length,
	});

	return (
		<HigherLevelTaskPrompt
			name="Paste the track path, then describe the beat match"
			isInitialPrompt={false}
			theme="light"
			blurStrength={6}
			pluginName="Remotion"
			prompt={
				frame < 20
					? prefix.slice(0, typedPrefix)
					: prefix + path + instruction.slice(0, typedInstruction)
			}
			typingStartFrame={0}
			typingDurationInFrames={0}
			cameraDurationInFrames={270}
		/>
	);
};

export const BeatMatchPrompt = Interactive.create({
	Component: BeatMatchPromptContent,
	layout: 'absolute-fill',
	schema: {},
});
