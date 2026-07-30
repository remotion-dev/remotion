import React from 'react';
import type {_InternalTypes} from 'remotion';
import type {StaticFile} from '../../api/get-static-files';
import {DismissableModal} from '../NewComposition/DismissableModal';
import type {QuickSwitcherMode} from './NoResults';
import {QuickSwitcherContent} from './QuickSwitcherContent';

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	overflow: 'hidden',
};

const QuickSwitcher: React.FC<{
	readonly initialMode: QuickSwitcherMode;
	readonly invocationTimestamp: number;
	readonly readOnlyStudio: boolean;
	readonly assetSelection: {
		readonly initialQuery: string;
		readonly onSelectFile: () => void;
		readonly onSelected: (asset: StaticFile) => void;
	} | null;
	readonly compositionSelection: {
		readonly excludeCompositionId: string;
		readonly onSelected: (
			composition: _InternalTypes['AnyComposition'],
		) => void;
	} | null;
}> = ({
	initialMode,
	invocationTimestamp,
	readOnlyStudio,
	assetSelection,
	compositionSelection,
}) => {
	return (
		<DismissableModal panelStyle={panelStyle}>
			<QuickSwitcherContent
				readOnlyStudio={readOnlyStudio}
				invocationTimestamp={invocationTimestamp}
				initialMode={initialMode}
				assetSelection={assetSelection}
				compositionSelection={compositionSelection}
			/>
		</DismissableModal>
	);
};

export default QuickSwitcher;
