import React, {useCallback, useMemo, useState} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {formatContextForAgents} from '../helpers/format-file-location';
import {ClipboardIcon} from '../icons/clipboard';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {InspectorOpenInEditor} from './InspectorOpenInEditor';
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
	alignItems: 'center',
	display: 'flex',
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
	readonly openInEditorLocation: OriginalPosition | null;
}> = ({children, location, name, openInEditorLocation}) => {
	const [hovered, setHovered] = useState(false);
	const [focusedWithin, setFocusedWithin] = useState(false);
	const contextForAgents = useMemo(() => {
		return formatContextForAgents({
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
			if (!contextForAgents) {
				return;
			}

			navigator.clipboard.writeText(contextForAgents).catch((err) => {
				showNotification(
					`Could not copy to clipboard: ${(err as Error).message}`,
					2000,
				);
			});
		},
		[contextForAgents],
	);

	const showAction = hovered || focusedWithin;

	return (
		<div
			aria-label="Inspector source location"
			role="group"
			style={row}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			onFocus={() => setFocusedWithin(true)}
			onBlur={() => setFocusedWithin(false)}
		>
			<div style={content}>{children}</div>
			{contextForAgents || openInEditorLocation ? (
				<div
					style={{
						...action,
						opacity: showAction ? 1 : 0,
						pointerEvents: showAction ? 'auto' : 'none',
					}}
				>
					<InspectorOpenInEditor
						contextForAgents={contextForAgents}
						location={openInEditorLocation}
					/>
					{contextForAgents ? (
						<InlineAction
							variant={null}
							onClick={onCopy}
							renderAction={renderCopyAction}
							title="Copy context for agents"
						/>
					) : null}
				</div>
			) : null}
		</div>
	);
};
