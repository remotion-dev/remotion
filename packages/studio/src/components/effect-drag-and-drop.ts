import {
	ASSET_DRAG_MIME_TYPE,
	COMPOSITION_DRAG_MIME_TYPE,
	COMPONENT_DRAG_MIME_TYPE,
	EFFECT_DRAG_MIME_TYPE,
	ELEMENT_DRAG_MIME_TYPE,
	getRequiredPackageForEffectImportPath,
	parseEffectDragData,
	SFX_DRAG_MIME_TYPE,
	type EffectDragData,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {installRequiredPackages} from '../helpers/install-required-package';
import {callApi} from './call-api';
import {showNotification} from './Notifications/NotificationCenter';

export const hasEffectDragType = (dataTransfer: DataTransfer) => {
	const types = Array.from(dataTransfer.types);
	const hasExplicitEffectType = types.includes(EFFECT_DRAG_MIME_TYPE);
	if (!hasExplicitEffectType && hasImportableAssetDragType(dataTransfer)) {
		return false;
	}

	return types.some(
		(type) => type === EFFECT_DRAG_MIME_TYPE || isGenericDragType(type),
	);
};

export const hasExplicitEffectDragType = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).includes(EFFECT_DRAG_MIME_TYPE);
};

const isGenericDragType = (type: string) => {
	return type === 'application/json' || type === 'text/plain';
};

const hasImportableAssetDragType = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).some(
		(type) =>
			type === 'Files' ||
			type === ASSET_DRAG_MIME_TYPE ||
			type === COMPOSITION_DRAG_MIME_TYPE ||
			type === COMPONENT_DRAG_MIME_TYPE ||
			type === ELEMENT_DRAG_MIME_TYPE ||
			type === SFX_DRAG_MIME_TYPE ||
			type === 'text/uri-list' ||
			type === 'text/html',
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
