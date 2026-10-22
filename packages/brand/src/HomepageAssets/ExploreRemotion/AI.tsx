import {colorCorrection} from '@remotion/effects/color-correction';
import {grayscale} from '@remotion/effects/grayscale';
import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {AbsoluteFill, HtmlInCanvas, Sequence, Solid} from 'remotion';
import {AiPromptRecordingComposition} from '../../AiPromptRecordingComposition';

export const ExploreRemotionAI = () => {
	return (
		<>
			<Solid
				width={1080}
				height={1080}
				color={'#060708'}
				style={{position: 'absolute'}}
				durationInFrames={222}
			/>
			<HtmlInCanvas
				width={1080}
				height={1080}
				effects={[
					grayscale({}),
					colorCorrection({
						pivot: 0,
						shadows: 1,
						whites: 0.26,
						blacks: -1,
						temperature: -1,
					}),
					linearProgressiveBlur({
						end: [0.725, 0.915],
						start: [0.23, 0.203],
						endBlur: 28,
					}),
				]}
				durationInFrames={222}
			>
				<AbsoluteFill durationInFrames={224} trimBefore={218}>
					<AbsoluteFill
						name="Angled AI prompt"
						style={{
							width: 1284,
							height: 500,
							left: -95,
							top: 290,
							overflow: 'hidden',
							rotate: '0.2122 0.973833 -0.081363 27.920954deg',
							scale: 1.84,
							translate: '457.6px 0px',
						}}
					>
						<AbsoluteFill
							style={{
								width: 1494,
								height: 1440,
								transform: 'translate(-210px, -570px)',
								translate: '56.4px 0px',
							}}
						>
							<Sequence name="Real prompt typing" from={-206} layout="none">
								<AiPromptRecordingComposition />
							</Sequence>
						</AbsoluteFill>
					</AbsoluteFill>
				</AbsoluteFill>
			</HtmlInCanvas>
		</>
	);
};
