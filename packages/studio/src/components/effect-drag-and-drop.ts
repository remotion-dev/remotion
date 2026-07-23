import {
	getDragPreviewMetadata,
	parseDragData,
	type EffectDragData,
} from '@remotion/drag-and-drop';
import {getRequiredPackageForEffectImportPath} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {installRequiredPackages} from '../helpers/install-required-package';
import {callApi} from './call-api';
import {showNotification} from './Notifications/NotificationCenter';

export const hasEffectDragType = (dataTransfer: DataTransfer) => {
	return getDragPreviewMetadata(dataTransfer.types)?.type === 'effect';
};

export const hasExplicitEffectDragType = (dataTransfer: DataTransfer) => {
	return hasEffectDragType(dataTransfer);
};

export const getEffectDragData = (
	dataTransfer: DataTransfer,
): EffectDragData | null => {
	const parsed = parseDragData(dataTransfer);
	return parsed?.type === 'effect' ? parsed.data : null;
};

export const addEffectFromDragData = ({
	clientId,
	dragData,
	fileName,
	nodePath,
}: {
	readonly clientId: string;
	readonly dragData: EffectDragData;
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	return addEffectToSequence({
		clientId,
		effect: dragData.effect,
		fileName,
		nodePath,
	});
};

export const addEffectToSequence = async ({
	clientId,
	effect,
	fileName,
	nodePath,
}: {
	readonly clientId: string;
	readonly effect: EffectDragData['effect'];
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	try {
		const requiredPackage = getRequiredPackageForEffectImportPath(
			effect.importPath,
		);
		await installRequiredPackages(requiredPackage ? [requiredPackage] : []);

		const result = await callApi('/api/add-effect', {
			fileName,
			sequenceNodePath: nodePath,
			effectName: effect.name,
			effectImportPath: effect.importPath,
			effectConfig: effect.config,
			clientId,
		});

		if (result.success) {
			showNotification(`Added ${effect.name}()`, 2000);
		} else {
			showNotification(result.reason, 4000);
		}
	} catch (err) {
		showNotification((err as Error).message, 4000);
	}
};
