import {Composition, Still} from 'remotion';
import {RollerSkiBlueprintCompositions} from './blueprint/RollerSkiBlueprint';
import {CommuteMotionGraphic} from './CommuteMotionGraphic';
import {MyComposition} from './Composition';
import {IntroLowerThird} from './IntroLowerThird';
import {NordicRoutes} from './nordic/NordicRoutes';
import {Thumbnail} from './Thumbnail';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<MyComposition />
			<Composition
				id="NordicRoutes"
				component={NordicRoutes}
				durationInFrames={180}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="CommuteMotionGraphic"
				component={CommuteMotionGraphic}
				durationInFrames={245}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="IntroLowerThird"
				component={IntroLowerThird}
				durationInFrames={108}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					nameText: 'Jonny Burger',
					roleText: 'Roller Ski Enthusiast',
				}}
			/>
			<RollerSkiBlueprintCompositions />
			<Still
				id="RollerSkiThumbnail"
				component={Thumbnail}
				width={1920}
				height={1080}
			/>
		</>
	);
};
