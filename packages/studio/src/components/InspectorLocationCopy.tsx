import React, {useCallback, useMemo} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {copyText} from '../helpers/copy-text';
import {formatContextForAgents} from '../helpers/format-file-location';
import {
	HOVER_GROUP_CLASS_NAME,
	HOVER_GROUP_REVEAL_KEEP_SPACE_CLASS_NAME,
} from '../helpers/hoverable';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {CopyIcon} from '../icons/copy';
import {ActionTooltip} from './ActionTooltip';
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
	const {copied, markCopied} = useCopyFeedback();
	const contextForAgents = useMemo(() => {
		return formatContextForAgents({
			location,
			name,
			root: window.remotion_cwd,
		});
	}, [location, name]);

	const renderCopyAction: RenderInlineAction = useCallback(
		(color) => {
			return <CopyIcon copied={copied} style={icon} color={color} />;
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
		<div
			aria-label="Inspector source location"
			role="group"
			style={row}
			className={HOVER_GROUP_CLASS_NAME}
		>
			<div style={content}>{children}</div>
			{contextForAgents || openInEditorLocation ? (
				<div
					style={action}
					className={HOVER_GROUP_REVEAL_KEEP_SPACE_CLASS_NAME}
				>
					<InspectorOpenInEditor
						annotationName={name}
						locationType={null}
						contextForAgents={contextForAgents}
						location={openInEditorLocation}
						showTooltips
					/>
					{contextForAgents ? (
						<ActionTooltip
							label="Copy context for agents"
							shortcut={null}
							delay={800}
							dismissOnClick
						>
							<InlineAction
								variant={null}
								onClick={onCopy}
								renderAction={renderCopyAction}
								aria-label="Copy context for agents"
							/>
						</ActionTooltip>
					) : null}
				</div>
			) : null}
		</div>
	);
};
