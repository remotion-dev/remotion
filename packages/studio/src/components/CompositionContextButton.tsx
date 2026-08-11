import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {EllipsisIcon} from '../icons/ellipsis';
import type {RenderInlineAction} from './InlineAction';
import {InlineDropdown} from './InlineDropdown';
import type {ComboboxValue} from './NewComposition/ComboBox';

export const CompositionContextButton: React.FC<{
	readonly visible: boolean;
	readonly getItems: () => ComboboxValue[];
}> = ({visible, getItems}) => {
	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 12,
			},
		};
	}, []);

	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return <EllipsisIcon fill={color} svgProps={iconStyle} />;
		},
		[iconStyle],
	);

	if (!visible || connectionStatus !== 'connected') {
		return null;
	}

	return (
		<InlineDropdown
			renderAction={renderAction}
			getItems={getItems}
			variant={null}
		/>
	);
};
