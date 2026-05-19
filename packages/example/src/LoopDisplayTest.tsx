import {Composition} from 'remotion';
import {calculateMetadataFn} from './LoopDisplayTest-calculate-metadata';
import {LoopDisplayTestComponent} from './LoopDisplayTest-component';

export const LoopDisplayTestComp = () => {
	return (
		<Composition
			component={LoopDisplayTestComponent}
			id="LoopDisplayTest"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};
