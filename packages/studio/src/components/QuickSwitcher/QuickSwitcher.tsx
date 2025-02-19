import React from 'react';
import {DismissableModal} from '../NewComposition/DismissableModal';
import type {QuickSwitcherMode} from './NoResults';
import {QuickSwitcherContent} from './QuickSwitcherContent';

const QuickSwitcher: React.FC<{
	readonly initialMode: QuickSwitcherMode;
	readonly invocationTimestamp: number;
	readonly readOnlyStudio: boolean;
}> = ({initialMode, invocationTimestamp, readOnlyStudio}) => {
	return (
		<DismissableModal>
			<QuickSwitcherContent
				readOnlyStudio={readOnlyStudio}
				invocationTimestamp={invocationTimestamp}
				initialMode={initialMode}
			/>
		</DismissableModal>
	);
};

export default QuickSwitcher;
