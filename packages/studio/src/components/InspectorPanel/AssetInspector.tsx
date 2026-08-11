import React from 'react';
import {CurrentAsset} from '../CurrentAsset';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {inspectorOverviewSection, scrollableContainer} from './styles';

export const AssetInspector: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	return (
		<div style={scrollableContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<div style={inspectorOverviewSection}>
				<CurrentAsset readOnlyStudio={readOnlyStudio} />
			</div>
		</div>
	);
};
