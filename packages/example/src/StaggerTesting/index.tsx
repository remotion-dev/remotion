import {FC} from 'react';
import {Stagger, StaggerChild} from 'remotion';
import ReactSvg from '../ReactSvg';
import Tiles from '../Tiles';

const StaggerTesting: FC = () => {
	return (
		<Stagger>
			<StaggerChild durationInFrames={10}>
				<Tiles />
			</StaggerChild>
			<StaggerChild durationInFrames={50}>
				<ReactSvg transparent={false} />
			</StaggerChild>
			<StaggerChild durationInFrames={80}>
				<Tiles />
			</StaggerChild>
		</Stagger>
	);
};

export {StaggerTesting};
