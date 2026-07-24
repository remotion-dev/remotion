import React, {useCallback, useMemo, useState} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {formatLocationForAgents} from '../helpers/format-file-location';
import {ClipboardIcon} from '../icons/clipboard';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {showNotification} from './Notifications/NotificationCenter';

const row: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexDirection: 'row',
	minWidth: 0,
	width: '100%',
};

const content: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
	overflow: 'hidden',
};

const action: React.CSSProperties = {
	flexShrink: 0,
	height: 24,
	marginLeft: 0,
	marginRight: 4,
};

const icon: React.CSSProperties = {
	flexShrink: 0,
	height: 12,
	width: 12,
};

export const InspectorLocationCopy: React.FC<{
	readonly children: React.ReactNode;
	readonly location: OriginalPosition | null;
	readonly name: string | null;
}> = ({children, location, name}) => {
	const [hovered, setHovered] = useState(false);
	const [focusedWithin, setFocusedWithin] = useState(false);
	const textToCopy = useMemo(() => {
		return formatLocationForAgents({
			location,
			name,
			root: window.remotion_cwd,
		});
	}, [location, name]);

	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon style={icon} color={color} />;
	}, []);

	const onCopy: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(event) => {
			event.stopPropagation();
			if (!textToCopy) {
				return;
			}

			navigator.clipboard.writeText(textToCopy).catch((err) => {
				showNotification(
					`Could not copy to clipboard: ${(err as Error).message}`,
					2000,
				);
			});
		},
		[textToCopy],
	);

	const showAction = hovered || focusedWithin;

	return (
		<div
			style={row}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			onFocus={() => setFocusedWithin(true)}
			onBlur={() => setFocusedWithin(false)}
		>
			<div style={content}>{children}</div>
			{textToCopy ? (
				<div
					style={{
						...action,
						opacity: showAction ? 1 : 0,
						pointerEvents: showAction ? 'auto' : 'none',
					}}
				>
					<InlineAction
						onClick={onCopy}
						renderAction={renderCopyAction}
						title="Copy location for agents"
					/>
				</div>
			) : null}
		</div>
	);
};
