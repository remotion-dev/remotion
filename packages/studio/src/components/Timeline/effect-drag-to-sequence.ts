import {
	EFFECT_DRAG_MIME_TYPE,
	getRequiredPackageForEffectImportPath,
	parseEffectDragData,
} from '@remotion/studio-shared';
import {useCallback, useState, type CSSProperties, type DragEvent} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {installRequiredPackages} from '../../helpers/install-required-package';
import type {PreviewServerConnectionState} from '../../helpers/preview-server-events';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';

export const effectDropHighlight: CSSProperties = {
	backgroundColor: 'rgba(0, 155, 255, 0.16)',
	boxShadow: 'inset 0 0 0 2px rgba(0, 155, 255, 0.5)',
	outline: '1px solid rgba(0, 155, 255, 0.75)',
	outlineOffset: -1,
};

export const hasEffectDragType = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).some(
		(type) =>
			type === EFFECT_DRAG_MIME_TYPE ||
			type === 'application/json' ||
			type === 'text/plain',
	);
};

export const getEffectDragData = (dataTransfer: DataTransfer) => {
	for (const type of [
		EFFECT_DRAG_MIME_TYPE,
		'application/json',
		'text/plain',
	]) {
		const value = dataTransfer.getData(type);
		if (!value) {
			continue;
		}

		const parsed = parseEffectDragData(value);
		if (parsed) {
			return parsed;
		}
	}

	return null;
};

export const useEffectDropTarget = ({
	fileName,
	nodePath,
	previewServerState,
	supportsEffects,
}: {
	readonly fileName: string | null;
	readonly nodePath: SequencePropsSubscriptionKey | null;
	readonly previewServerState: PreviewServerConnectionState;
	readonly supportsEffects: boolean;
}) => {
	const [effectDropHovered, setEffectDropHovered] = useState(false);
	const canDropEffect =
		previewServerState.type === 'connected' &&
		nodePath !== null &&
		fileName !== null &&
		supportsEffects;

	const onEffectDragOver = useCallback(
		(e: DragEvent<HTMLDivElement>) => {
			if (!canDropEffect || !hasEffectDragType(e.dataTransfer)) {
				return;
			}

			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			setEffectDropHovered(true);
		},
		[canDropEffect],
	);

	const onEffectDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
			return;
		}

		setEffectDropHovered(false);
	}, []);

	const onEffectDrop = useCallback(
		async (e: DragEvent<HTMLDivElement>) => {
			if (
				!canDropEffect ||
				previewServerState.type !== 'connected' ||
				nodePath === null ||
				fileName === null
			) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			setEffectDropHovered(false);

			const dragData = getEffectDragData(e.dataTransfer);
			if (!dragData) {
				showNotification('Could not read effect drag data', 3000);
				return;
			}

			try {
				const requiredPackage = getRequiredPackageForEffectImportPath(
					dragData.effect.importPath,
				);
				await installRequiredPackages(requiredPackage ? [requiredPackage] : []);

				const result = await callApi('/api/add-effect', {
					fileName,
					sequenceNodePath: nodePath,
					effectName: dragData.effect.name,
					effectImportPath: dragData.effect.importPath,
					effectConfig: dragData.effect.config,
					clientId: previewServerState.clientId,
				});

				if (result.success) {
					showNotification(`Added ${dragData.effect.name}()`, 2000);
				} else {
					showNotification(result.reason, 4000);
				}
			} catch (err) {
				showNotification((err as Error).message, 4000);
			}
		},
		[canDropEffect, fileName, nodePath, previewServerState],
	);

	return {
		canDropEffect,
		effectDropHovered,
		onEffectDragLeave,
		onEffectDragOver,
		onEffectDrop,
	};
};
