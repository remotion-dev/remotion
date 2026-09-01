import React from 'react';
import {WHITE_ALPHA_80} from '../helpers/colors';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';

export const CONTROL_BUTTON_PADDING = 6;

export const ControlButton = (
	props: Omit<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		'children' | 'onClick' | 'title'
	> & {
		readonly title: string;
		readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
		readonly children: React.ReactNode | RenderInlineAction;
	},
) => {
	const {children, onClick, title, ...buttonProps} = props;
	const renderAction: RenderInlineAction =
		typeof children === 'function' ? children : () => children;

	return (
		<InlineAction
			{...buttonProps}
			title={title}
			onClick={onClick}
			renderAction={renderAction}
			variant={null}
			unhoveredColor={WHITE_ALPHA_80}
		/>
	);
};
