import {Composition, Folder} from 'remotion';
import {MyCompositionSchema} from '../announcements/whats-new-in-remotion/Composition';
import {Scene11} from '../announcements/whats-new-in-remotion/Scene11';

export const StudioCodeHandoffRoot: React.FC = () => {
	return (
		<>
			<Folder name="Logo" />
			<Folder name="Showcases" />
			<Folder name="SocialMediaAnnouncements">
				<Composition
					id="Outro"
					component={Scene11}
					durationInFrames={742}
					fps={30}
					width={1920}
					height={1080}
					schema={MyCompositionSchema}
					defaultProps={{platform: 'youtube'}}
				/>
			</Folder>
			<Folder name="VideoElements" />
		</>
	);
};
