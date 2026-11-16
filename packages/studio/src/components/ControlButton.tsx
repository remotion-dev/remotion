import React from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';

export const CONTROL_BUTTON_PADDING = 6;

export const ControlButton = (
	props: Omit<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		'children' | 'onClick' | 'title'
	> & {
		readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
		readonly children: React.ReactNode | RenderInlineAction;
	},
) => {
	const {children, onClick, ...buttonProps} = props;
	const renderAction: RenderInlineAction =
		typeof children === 'function' ? children : () => children;

	return (
		<InlineAction
			{...buttonProps}
			onClick={onClick}
			renderAction={renderAction}
			variant={null}
			unhoveredColor={LIGHT_TEXT}
		/>
	);
};
