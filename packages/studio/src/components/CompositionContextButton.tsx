import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVER_GROUP_REVEAL_CLASS_NAME,
	NO_HOVER_BACKGROUND_STYLE,
} from '../helpers/hoverable';
import {EllipsisIcon} from '../icons/ellipsis';
import type {RenderInlineAction} from './InlineAction';
import {InlineDropdown} from './InlineDropdown';
import type {ComboboxValue} from './NewComposition/ComboBox';

const revealStyle: React.CSSProperties = {
	display: 'flex',
};

export const CompositionContextButton: React.FC<{
	readonly visible: boolean;
	readonly getItems: () => ComboboxValue[];
	readonly readOnlyStudio: boolean;
}> = ({visible, getItems, readOnlyStudio}) => {
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

	if (!visible || (connectionStatus !== 'connected' && !readOnlyStudio)) {
		return null;
	}

	return (
		<div className={HOVER_GROUP_REVEAL_CLASS_NAME} style={revealStyle}>
			<InlineDropdown
				renderAction={renderAction}
				getItems={getItems}
				variant={null}
				style={NO_HOVER_BACKGROUND_STYLE}
				className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
			/>
		</div>
	);
};
