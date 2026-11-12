import React, {useCallback, useContext} from 'react';
import {createPortal} from 'react-dom';
import {BACKGROUND, BORDER_BLACK, WHITE} from '../helpers/colors';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME} from '../helpers/hoverable';
import {ArrowLeft} from '../icons/keys';
import {SetSelectedModalContext} from '../state/modals';
import {useZIndex} from '../state/z-index';
import {ActionTooltip} from './ActionTooltip';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {MENU_TOOLBAR_HEIGHT} from './menu-toolbar-height';
import {getPortal} from './Menu/portals';

const panel: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	display: 'flex',
	flexDirection: 'column',
	overflow: 'hidden',
	backgroundColor: BACKGROUND,
	color: WHITE,
};

const header: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	flexShrink: 0,
	gap: 6,
	height: MENU_TOOLBAR_HEIGHT,
	padding: '0 6px',
	borderBottom: BORDER_BLACK,
};

const title: React.CSSProperties = {
	color: WHITE,
	fontSize: 13,
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const headerContentStyle: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	justifyContent: 'center',
	minWidth: 0,
};

const backButton: React.CSSProperties = {
	cursor: 'default',
};

export const FullscreenPanel: React.FC<{
	readonly children: React.ReactNode;
	readonly ariaLabel: string;
	readonly headerContent: React.ReactNode;
	readonly rightAction: React.ReactNode;
}> = ({children, ariaLabel, headerContent, rightAction}) => {
	const {currentZIndex} = useZIndex();
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const goBack = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);
	const renderBackIcon: RenderInlineAction = useCallback(() => {
		return <ArrowLeft />;
	}, []);
	const onPointerDown = useCallback((event: React.PointerEvent) => {
		event.stopPropagation();
	}, []);

	return createPortal(
		<div
			className="css-reset"
			role="dialog"
			aria-label={ariaLabel}
			style={panel}
			onPointerDown={onPointerDown}
		>
			<div style={header}>
				<ActionTooltip
					label="Back to Studio"
					shortcut={null}
					delay={800}
					dismissOnClick
				>
					<InlineAction
						aria-label="Back to Studio"
						className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
						onClick={goBack}
						renderAction={renderBackIcon}
						style={backButton}
						variant={null}
					/>
				</ActionTooltip>
				<div style={title}>{ariaLabel}</div>
				<div style={headerContentStyle}>{headerContent}</div>
				{rightAction}
			</div>
			{children}
		</div>,
		getPortal(currentZIndex),
	);
};
