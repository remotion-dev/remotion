import {Composition} from 'remotion';
import {calculateMetadataFn} from './NewVideo-calculate-metadata';
import {AudioSmoothnessNewVideoComponent} from './NewVideo-component';

export const AudioSmoothnessNewVideoComp: React.FC = () => {
	return (
		<Composition
			component={AudioSmoothnessNewVideoComponent}
			id="audio-smoothness-new-video"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};
