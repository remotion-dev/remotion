import {
	EFFECT_DRAG_MIME_TYPE,
	getRequiredPackageForEffectImportPath,
	parseEffectDragData,
	type EffectDragData,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {installRequiredPackages} from '../helpers/install-required-package';
import {callApi} from './call-api';
import {showNotification} from './Notifications/NotificationCenter';

export const hasEffectDragType = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).some(
		(type) =>
			type === EFFECT_DRAG_MIME_TYPE ||
			type === 'application/json' ||
			type === 'text/plain',
	);
};

export const getEffectDragData = (
	dataTransfer: DataTransfer,
): EffectDragData | null => {
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

export const addEffectFromDragData = async ({
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
			clientId,
		});

		if (result.success) {
			showNotification(`Added ${dragData.effect.name}()`, 2000);
		} else {
			showNotification(result.reason, 4000);
		}
	} catch (err) {
		showNotification((err as Error).message, 4000);
	}
};
