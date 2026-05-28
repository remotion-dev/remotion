import type {GitSource} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {LIGHT_TEXT, VERY_LIGHT_TEXT} from '../../helpers/colors';
import {getGitRefUrl} from '../../helpers/get-git-menu-item';
import {openOriginalPositionInEditor} from '../../helpers/open-in-editor';
import {Spacing} from '../layout';
import {showNotification} from '../Notifications/NotificationCenter';
import {Spinner} from '../Spinner';
import {getOriginalSourceAttribution} from './TimelineStack/source-attribution';

export const TimelineItemStack: React.FC<{
	readonly isCompact: boolean;
	readonly originalLocation: OriginalPosition | null;
}> = ({isCompact, originalLocation}) => {
	const [hovered, setHovered] = useState(false);
	const [opening, setOpening] = useState(false);

	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;

	const openEditor = useCallback(async (location: OriginalPosition) => {
		if (!window.remotion_editorName) {
			return;
		}

		setOpening(true);
		try {
			await openOriginalPositionInEditor(location);
		} catch (err) {
			showNotification((err as Error).message, 2000);
		} finally {
			setOpening(false);
		}
	}, []);

	const canOpenInEditor = Boolean(
		window.remotion_editorName &&
		connectionStatus === 'connected' &&
		originalLocation,
	);

	const canOpenInGitHub = Boolean(
		window.remotion_gitSource && originalLocation,
	);
	const hoverable = !isCompact && (canOpenInEditor || canOpenInGitHub);

	const onClick = useCallback(() => {
		if (!originalLocation) {
			return;
		}

		if (canOpenInEditor) {
			openEditor(originalLocation);
			return;
		}

		if (canOpenInGitHub) {
			window.open(
				getGitRefUrl(window.remotion_gitSource as GitSource, originalLocation),
				'_blank',
			);
		}
	}, [canOpenInEditor, canOpenInGitHub, openEditor, originalLocation]);

	const onPointerEnter = useCallback(() => setHovered(true), []);
	const onPointerLeave = useCallback(() => setHovered(false), []);

	const style = useMemo((): React.CSSProperties => {
		return {
			fontSize: 12,
			color: opening
				? VERY_LIGHT_TEXT
				: hovered && hoverable
					? LIGHT_TEXT
					: VERY_LIGHT_TEXT,
			cursor: hoverable ? 'pointer' : undefined,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			flexShrink: 100000,
			userSelect: 'none',
			WebkitUserSelect: 'none',
		};
	}, [opening, hovered, hoverable]);

	if (isCompact || !originalLocation) {
		return null;
	}

	return (
		<>
			<div
				onPointerEnter={hoverable ? onPointerEnter : undefined}
				onPointerLeave={hoverable ? onPointerLeave : undefined}
				onClick={hoverable ? onClick : undefined}
				style={style}
			>
				{getOriginalSourceAttribution(originalLocation)}
			</div>
			{opening ? (
				<>
					<Spacing x={0.5} />
					<Spinner duration={0.5} size={12} />
				</>
			) : null}
		</>
	);
};
