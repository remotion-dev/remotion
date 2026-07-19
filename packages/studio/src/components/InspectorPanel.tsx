import React, {useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
import {InspectorMessage} from './InspectorPanel/common';
import {DefaultInspector} from './InspectorPanel/DefaultInspector';
import {getSameSequenceInspectorSelection} from './InspectorPanel/inspector-selection';
import {SelectedInspector} from './InspectorPanel/SelectedInspector';
import {container} from './InspectorPanel/styles';
import type {UpdaterFunction} from './RenderModal/SchemaEditor/ZodSwitch';
import {useTimelineSelection} from './Timeline/TimelineSelection';

export const InspectorPanel: React.FC<{
	readonly composition: _InternalTypes['AnyComposition'] | null;
	readonly currentDefaultProps: Record<string, unknown>;
	readonly readOnlyStudio: boolean;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
}> = ({composition, currentDefaultProps, readOnlyStudio, setDefaultProps}) => {
	const {selectedItems} = useTimelineSelection();
	const sameSequenceInspectorSelection = useMemo(
		() => getSameSequenceInspectorSelection(selectedItems),
		[selectedItems],
	);

	if (selectedItems.length === 0) {
		return (
			<DefaultInspector
				composition={composition}
				currentDefaultProps={currentDefaultProps}
				readOnlyStudio={readOnlyStudio}
				setDefaultProps={setDefaultProps}
			/>
		);
	}

	if (selectedItems.length > 1) {
		if (sameSequenceInspectorSelection) {
			return (
				<div style={container}>
					<SelectedInspector
						selection={sameSequenceInspectorSelection}
						readOnlyStudio={readOnlyStudio}
					/>
				</div>
			);
		}

		return (
			<div style={container}>
				<InspectorMessage>
					{selectedItems.length} items selected
				</InspectorMessage>
			</div>
		);
	}

	return (
		<div style={container}>
			<SelectedInspector
				selection={selectedItems[0]}
				readOnlyStudio={readOnlyStudio}
			/>
		</div>
	);
};
