import {useCallback, useContext, useMemo, useState} from 'react';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BORDER_WHITE, LIGHT_COLOR, WHITE_HEX} from '../../helpers/colors';
import {openOriginalPositionInEditor} from '../../helpers/open-in-editor';
import {showNotification} from '../Notifications/NotificationCenter';
import {getSchemaEditorFieldsetPadding} from '../RenderModal/SchemaEditor/Fieldset';
import {getOriginalSourceAttribution} from '../Timeline/TimelineStack/source-attribution';
import {useEditorOpening} from '../use-default-editor-info';

export type OriginalFileNameState =
	| {
			type: 'loaded';
			originalFileName: OriginalPosition;
	  }
	| {
			type: 'error';
			error: Error;
	  }
	| {
			type: 'loading';
	  };

const container: React.CSSProperties = {
	paddingLeft: getSchemaEditorFieldsetPadding(),
	paddingTop: getSchemaEditorFieldsetPadding() / 2,
};

export const ClickableFileName = ({
	originalFileName,
}: {
	readonly originalFileName: OriginalFileNameState;
}) => {
	const [titleHovered, setTitleHovered] = useState(false);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canOpenInEditor, defaultEditorId} = useEditorOpening(
		previewServerState.type === 'connected',
	);
	const canOpen =
		canOpenInEditor &&
		defaultEditorId !== null &&
		originalFileName.type === 'loaded';
	const hoverEffect = titleHovered && canOpen;

	const onTitlePointerEnter = useCallback(() => {
		setTitleHovered(true);
	}, []);

	const onTitlePointerLeave = useCallback(() => {
		setTitleHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			fontSize: 12,
			cursor: canOpen ? 'pointer' : undefined,
			borderBottom: hoverEffect ? BORDER_WHITE : 'none',
			color: hoverEffect ? WHITE_HEX : LIGHT_COLOR,
		};
	}, [canOpen, hoverEffect]);

	const onClick = useCallback(() => {
		if (originalFileName.type !== 'loaded' || !canOpen || !defaultEditorId) {
			return;
		}

		openOriginalPositionInEditor(
			originalFileName.originalFileName,
			defaultEditorId,
		).catch((err) => {
			showNotification((err as Error).message, 2000);
		});
	}, [canOpen, defaultEditorId, originalFileName]);

	return (
		<div style={container}>
			<span
				style={style}
				onClick={onClick}
				onPointerEnter={onTitlePointerEnter}
				onPointerLeave={onTitlePointerLeave}
			>
				{originalFileName.type === 'loaded'
					? getOriginalSourceAttribution(originalFileName.originalFileName)
					: originalFileName.type === 'loading'
						? 'Loading...'
						: 'Error loading'}
			</span>
		</div>
	);
};
