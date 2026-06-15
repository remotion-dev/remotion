import React, {useContext} from 'react';
import {VisualControlsContext} from '../../visual-controls/VisualControls';
import {CompactNotSetUp} from '../CompactExplanation';
import {SchemaSeparationLine} from '../RenderModal/SchemaEditor/SchemaSeparationLine';
import {VisualControlHandle} from './VisualControlHandle';

export const VisualControlsContent = () => {
	const {handles} = useContext(VisualControlsContext);

	const entries = Object.entries(handles);

	if (entries.length === 0) {
		return (
			<CompactNotSetUp
				learnMoreHref="https://www.remotion.dev/docs/studio/visual-control"
				learnMoreAriaLabel="Learn more about visual controls"
			/>
		);
	}

	return (
		<div>
			{entries.map(([key, value], i) => {
				return (
					<React.Fragment key={key}>
						<VisualControlHandle keyName={key} value={value} />
						{i === entries.length - 1 ? null : <SchemaSeparationLine />}
					</React.Fragment>
				);
			})}
		</div>
	);
};
