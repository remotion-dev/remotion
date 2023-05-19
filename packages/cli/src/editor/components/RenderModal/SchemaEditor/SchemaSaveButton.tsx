import React, {useCallback} from 'react';
import type {RenderInlineAction} from '../../InlineAction';
import {InlineAction} from '../../InlineAction';

const icon: React.CSSProperties = {
	height: 14,
	color: 'currentColor',
};

export const SchemaSaveButton: React.FC<{
	onClick: () => void;
	disabled: boolean;
}> = ({onClick, disabled}) => {
	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<svg style={icon} viewBox="0 0 448 512">
					<path
						fill={disabled ? 'grey' : color}
						d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
					/>
				</svg>
			);
		},
		[disabled]
	);

	return (
		<InlineAction
			renderAction={renderAction}
			onClick={onClick}
			disabled={disabled}
		/>
	);
};
