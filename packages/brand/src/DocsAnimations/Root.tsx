import {Composition, Folder} from 'remotion';
import {
	AnimatingPropertiesGraph,
	AnimatingPropertiesText,
} from './AnimatingProperties';
import {ConnectedCompositionExamples} from './ConnectedCompositions';

const transparentVideoMetadata = () => ({
	defaultCodec: 'vp9' as const,
	defaultVideoImageFormat: 'png' as const,
	defaultPixelFormat: 'yuva420p' as const,
});

export const DocsAnimationCompositions = () => {
	return (
		<Folder name="DocsAnimations">
			<Folder name="ConnectedCompositions">
				<ConnectedCompositionExamples />
			</Folder>
			<Composition
				id="AnimatingPropertiesGraphLight"
				component={AnimatingPropertiesGraph}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'light', animation: 'opacity'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="AnimatingPropertiesGraphDark"
				component={AnimatingPropertiesGraph}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'dark', animation: 'opacity'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="AnimatingPropertiesTextLight"
				component={AnimatingPropertiesText}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'light', animation: 'opacity'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="AnimatingPropertiesTextDark"
				component={AnimatingPropertiesText}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'dark', animation: 'opacity'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="EasingGraphLight"
				component={AnimatingPropertiesGraph}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'light', animation: 'easing'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="EasingGraphDark"
				component={AnimatingPropertiesGraph}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'dark', animation: 'easing'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="EasingTextLight"
				component={AnimatingPropertiesText}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'light', animation: 'easing'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="EasingTextDark"
				component={AnimatingPropertiesText}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'dark', animation: 'easing'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="PosterizationGraphLight"
				component={AnimatingPropertiesGraph}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'light', animation: 'posterization'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="PosterizationGraphDark"
				component={AnimatingPropertiesGraph}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'dark', animation: 'posterization'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="PosterizationTextLight"
				component={AnimatingPropertiesText}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'light', animation: 'posterization'}}
				calculateMetadata={transparentVideoMetadata}
			/>
			<Composition
				id="PosterizationTextDark"
				component={AnimatingPropertiesText}
				width={640}
				height={360}
				fps={30}
				durationInFrames={120}
				defaultProps={{theme: 'dark', animation: 'posterization'}}
				calculateMetadata={transparentVideoMetadata}
			/>
		</Folder>
	);
};
