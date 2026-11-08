import React, {useCallback} from 'react';
import {copyText} from '../helpers/copy-text';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {CopyIcon} from '../icons/copy';
import {ActionTooltip} from './ActionTooltip';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {
	inspectorActionIconStyle,
	inspectorHeaderActionStyle,
} from './InspectorPanel/common';
import {showNotification} from './Notifications/NotificationCenter';

const row: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexDirection: 'row',
	marginBottom: 8,
	maxWidth: 'round(down, 100%, 1px)',
	minWidth: 0,
	width: '100%',
};

const content: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	minWidth: 0,
	overflow: 'hidden',
};

const action: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
	height: 24,
	marginLeft: 0,
	marginRight: 3,
};

export const inspectorHeaderIconStyle: React.CSSProperties = {
	...inspectorActionIconStyle,
	flexShrink: 0,
};

const clipboardIconStyle: React.CSSProperties = {
	...inspectorHeaderIconStyle,
	height: 16,
	overflow: 'visible',
	width: 12,
};

const copyIconContainer: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	width: 12,
};

export const InspectorHeaderAction: React.FC<{
	readonly label: string;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly renderIcon: RenderInlineAction;
}> = ({label, onClick, renderIcon}) => (
	<ActionTooltip label={label} shortcut={null} delay={800} dismissOnClick>
		<InlineAction
			variant={null}
			onClick={onClick}
			renderAction={renderIcon}
			aria-label={label}
			style={inspectorHeaderActionStyle}
		/>
	</ActionTooltip>
);

export const InspectorLocationCopy: React.FC<{
	readonly children: React.ReactNode;
	readonly contextForAgents: string | null;
	readonly actions: React.ReactNode;
	readonly trailingActions: React.ReactNode;
	readonly isEditing: boolean;
}> = ({children, contextForAgents, actions, trailingActions, isEditing}) => {
	const {copied, markCopied} = useCopyFeedback();

	const renderCopyAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<span style={copyIconContainer}>
					<CopyIcon
						copied={copied}
						style={clipboardIconStyle}
						viewBox={copied ? '0 0 512 512' : '0 32 384 480'}
						preserveAspectRatio={copied ? 'xMidYMid meet' : 'none'}
						color={color}
					/>
				</span>
			);
		},
		[copied],
	);

	const onCopy: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(event) => {
			event.stopPropagation();
			if (!contextForAgents) {
				return;
			}

			copyText(contextForAgents)
				.then(markCopied)
				.catch((err) => {
					showNotification(
						`Could not copy to clipboard: ${(err as Error).message}`,
						2000,
					);
				});
		},
		[contextForAgents, markCopied],
	);

	return (
		<div aria-label="Inspector source location" role="group" style={row}>
			<div style={content}>{children}</div>
			{isEditing ? null : (
				<div style={action}>
					{actions}
					{contextForAgents ? (
						<InspectorHeaderAction
							label="Copy context for agents"
							onClick={onCopy}
							renderIcon={renderCopyAction}
						/>
					) : null}
					{trailingActions}
				</div>
			)}
		</div>
	);
};
