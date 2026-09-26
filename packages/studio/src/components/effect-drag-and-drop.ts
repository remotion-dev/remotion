import {
	StudioProtocolInternals,
	type EffectDragData,
} from '@remotion/studio-protocol';
import {
	type EffectDefinition,
	getRequiredPackageForEffectImportPath,
} from '@remotion/studio-shared';
import {getBrowserStudioEffectOperations} from '../helpers/browser-studio-operations';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {installRequiredPackages} from '../helpers/install-required-package';
import {addEffect} from './effect-operations-api';
import {showNotification} from './Notifications/NotificationCenter';
import type {useTimelineSelection} from './Timeline/TimelineSelection';

export const hasEffectDragType = (dataTransfer: DataTransfer) => {
	return (
		StudioProtocolInternals.getDragPreviewMetadata(dataTransfer.types)?.type ===
		'effect'
	);
};

export const hasExplicitEffectDragType = (dataTransfer: DataTransfer) => {
	return hasEffectDragType(dataTransfer);
};

export const getEffectDragData = (
	dataTransfer: DataTransfer,
): EffectDragData | null => {
	const parsed = StudioProtocolInternals.parseDragData(dataTransfer);
	return parsed?.type === 'effect' ? parsed.data : null;
};

export const addEffectFromDragData = ({
	clientId,
	dragData,
	fileName,
	nodePathInfo,
	selectItems,
}: {
	readonly clientId: string;
	readonly dragData: EffectDragData;
	readonly fileName: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly selectItems: ReturnType<typeof useTimelineSelection>['selectItems'];
}) => {
	return addEffectToSequence({
		clientId,
		effect: dragData.effect,
		fileName,
		nodePathInfo,
		selectItems,
	});
};

export const addEffectToSequence = async ({
	clientId,
	effect,
	fileName,
	nodePathInfo,
	selectItems,
}: {
	readonly clientId: string;
	readonly effect: EffectDefinition;
	readonly fileName: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly selectItems: ReturnType<typeof useTimelineSelection>['selectItems'];
}) => {
	try {
		const requiredPackage = getRequiredPackageForEffectImportPath(
			effect.importPath,
		);
		if (getBrowserStudioEffectOperations() === null) {
			await installRequiredPackages(
				requiredPackage ? [{name: requiredPackage, version: null}] : [],
			);
		}

		const result = await addEffect({
			fileName,
			sequenceNodePath: nodePathInfo.sequenceSubscriptionKey,
			effectName: effect.name,
			effectImportPath: effect.importPath,
			effectConfig: effect.config,
			clientId,
		});

		if (!result.success) {
			showNotification(result.reason, 4000);
			return;
		}

		selectItems(
			[
				{
					type: 'sequence-effect',
					nodePathInfo: {
						...nodePathInfo,
						sequenceSubscriptionKey: {
							...nodePathInfo.sequenceSubscriptionKey,
							nodePath: result.insertedEffect.nodePath,
						},
					},
					i: result.insertedEffect.effectIndex,
				},
			],
			{revealInInspector: true},
		);
	} catch (err) {
		showNotification((err as Error).message, 4000);
	}
};
