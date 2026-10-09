import {Composition, Folder, Series, useVideoConfig} from 'remotion';
import {BasicsLeftTrimComposition} from './BasicsLeftTrimComposition';
import {
	BasicsLeftTrimScene,
	BasicsLeftTrimSceneComposition,
} from './BasicsLeftTrimScene';
import {BasicsPlaybackRateComposition} from './BasicsPlaybackRateComposition';
import {
	BasicsPlaybackRateScene,
	BasicsPlaybackRateSceneComposition,
} from './BasicsPlaybackRateScene';
import {BasicsSeriesTrimComposition} from './BasicsSeriesTrimComposition';
import {
	BasicsSeriesTrimScene,
	BasicsSeriesTrimSceneComposition,
} from './BasicsSeriesTrimScene';
import {BasicsSourceOnlyTrimComposition} from './BasicsSourceOnlyTrimComposition';
import {
	BasicsSourceOnlyTrimScene,
	BasicsSourceOnlyTrimSceneComposition,
} from './BasicsSourceOnlyTrimScene';
import {BasicsTitlePanel} from './BasicsTitlePanel';
import {BasicsVirtualizedTimelineComposition} from './BasicsVirtualizedTimelineComposition';
import {
	BasicsVirtualizedTimelineScene,
	BasicsVirtualizedTimelineSceneComposition,
} from './BasicsVirtualizedTimelineScene';
import {BasicsVolumeKeyframesComposition} from './BasicsVolumeKeyframesComposition';
import {
	BasicsVolumeKeyframesScene,
	BasicsVolumeKeyframesSceneComposition,
} from './BasicsVolumeKeyframesScene';

export const BasicsShowcase = () => {
	const {fps} = useVideoConfig();

	return (
		<Series>
			<Series.Sequence
				name="Left Trim"
				durationInFrames={3 * fps}
				premountFor={fps}
			>
				<BasicsLeftTrimScene premountFor={fps} />
			</Series.Sequence>
			<Series.Sequence
				name="Source-only trim"
				durationInFrames={3 * fps}
				premountFor={fps}
			>
				<BasicsSourceOnlyTrimScene premountFor={fps} />
			</Series.Sequence>
			<Series.Sequence
				name="Series trimming"
				durationInFrames={3 * fps}
				premountFor={fps}
			>
				<BasicsSeriesTrimScene premountFor={fps} />
			</Series.Sequence>
			<Series.Sequence
				name="Playback rate"
				durationInFrames={3 * fps}
				premountFor={fps}
			>
				<BasicsPlaybackRateScene premountFor={fps} />
			</Series.Sequence>
			<Series.Sequence
				name="Volume keyframes"
				durationInFrames={3 * fps}
				premountFor={fps}
			>
				<BasicsVolumeKeyframesScene premountFor={fps} />
			</Series.Sequence>
			<Series.Sequence
				name="Virtualized timeline"
				durationInFrames={3 * fps}
				premountFor={fps}
			>
				<BasicsVirtualizedTimelineScene premountFor={fps} />
			</Series.Sequence>
		</Series>
	);
};

export const BasicsShowcaseCompositions = () => {
	return (
		<Folder name="Basics">
			<Composition
				id="BasicsShowcase"
				component={BasicsShowcase}
				durationInFrames={1080}
				fps={60}
				width={1920}
				height={1080}
			/>
			<Folder name="Scenes">
				<BasicsLeftTrimSceneComposition />
				<BasicsSourceOnlyTrimSceneComposition />
				<BasicsSeriesTrimSceneComposition />
				<BasicsPlaybackRateSceneComposition />
				<BasicsVolumeKeyframesSceneComposition />
				<BasicsVirtualizedTimelineSceneComposition />
			</Folder>
			<BasicsLeftTrimComposition />
			<BasicsSourceOnlyTrimComposition />
			<BasicsSeriesTrimComposition />
			<BasicsPlaybackRateComposition />
			<BasicsVolumeKeyframesComposition />
			<BasicsVirtualizedTimelineComposition />
			<Composition
				id="BasicsTitlePanel"
				component={BasicsTitlePanel}
				durationInFrames={180}
				fps={60}
				width={1920}
				height={1080}
				defaultProps={{children: 'Left Trim', style: null}}
			/>
		</Folder>
	);
};
