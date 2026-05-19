import {Composition} from 'remotion';
import {calculateMetadataFn} from './NewVideo-calculate-metadata';
import {NewVideoComponent} from './NewVideo-component';

export const NewVideoComp = () => {
	return (
		<Composition
			component={NewVideoComponent}
			id="NewVideo"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};

// In Root.tsx:
// <NewVideoComp />
