import {
	StudioProtocolInternals,
	type EffectDragData,
} from '@remotion/studio-protocol';
import {
	type EffectDefinition,
	getRequiredPackageForEffectImportPath,
} from '@remotion/studio-shared';
import {staticFile} from 'remotion';
import {getBrowserStudioEffectOperations} from '../helpers/browser-studio-operations';
import {parseCubeLut} from '../helpers/cube-lut';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {installRequiredPackages} from '../helpers/install-required-package';
import {addEffect} from './effect-operations-api';
import {showNotification} from './Notifications/NotificationCenter';
import type {useTimelineSelection} from './Timeline/TimelineSelection';

export const LUT_ASSET_DRAG_TYPE = 'application/vnd.remotion.lut';
export const LUT_EFFECT_DROP_TARGET_ATTR =
	'data-remotion-lut-effect-drop-target';

export const hasExplicitEffectDragType = (dataTransfer: DataTransfer) => {
	return (
		StudioProtocolInternals.getDragPreviewMetadata(dataTransfer.types)?.type ===
		'effect'
	);
};

export const hasEffectDragType = (dataTransfer: DataTransfer) => {
	return (
		hasExplicitEffectDragType(dataTransfer) ||
		Array.from(dataTransfer.types).includes(LUT_ASSET_DRAG_TYPE)
	);
};

export const isLutEffectDrop = (event: DragEvent) => {
	const {dataTransfer, target} = event;
	if (
		dataTransfer === null ||
		!(target instanceof Element) ||
		target.closest(`[${LUT_EFFECT_DROP_TARGET_ATTR}="true"]`) === null
	) {
		return false;
	}

	const files = Array.from(dataTransfer.files);
	if (files.length > 0) {
		return files.length === 1 && getPreviewFileType(files[0].name) === 'lut';
	}

	const parsed = StudioProtocolInternals.parseDragData(dataTransfer);
	return (
		parsed?.type === 'asset' &&
		getPreviewFileType(parsed.data.assetPath) === 'lut'
	);
};

export const isEffectDragOverTarget = (event: DragEvent) => {
	return (
		event.dataTransfer !== null &&
		(hasEffectDragType(event.dataTransfer) ||
			// File names are unavailable during native file drags until the drop.
			Array.from(event.dataTransfer.types).includes('Files')) &&
		event.target instanceof Element &&
		event.target.closest(`[${LUT_EFFECT_DROP_TARGET_ATTR}="true"]`) !== null
	);
};

export const getEffectDragData = (
	dataTransfer: DataTransfer,
): EffectDragData | null => {
	const parsed = StudioProtocolInternals.parseDragData(dataTransfer);
	return parsed?.type === 'effect' ? parsed.data : null;
};

export const addEffectFromDrop = async ({
	clientId,
	dataTransfer,
	fileName,
	nodePathInfo,
	selectItems,
}: {
	readonly clientId: string;
	readonly dataTransfer: DataTransfer;
	readonly fileName: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly selectItems: ReturnType<typeof useTimelineSelection>['selectItems'];
}) => {
	try {
		const dragData = getEffectDragData(dataTransfer);
		let effect = dragData?.effect ?? null;
		if (effect === null) {
			const files = Array.from(dataTransfer.files);
			const parsed = StudioProtocolInternals.parseDragData(dataTransfer);
			let content: string;
			if (files.length === 1 && getPreviewFileType(files[0].name) === 'lut') {
				content = await files[0].text();
			} else if (
				files.length === 0 &&
				parsed?.type === 'asset' &&
				getPreviewFileType(parsed.data.assetPath) === 'lut'
			) {
				const response = await fetch(staticFile(parsed.data.assetPath));
				if (!response.ok) {
					throw new Error(`Could not read LUT file ${parsed.data.assetPath}`);
				}

				content = await response.text();
			} else {
				if (hasExplicitEffectDragType(dataTransfer)) {
					showNotification('Could not read effect drag data', 3000);
				}

				return;
			}

			content = content.replace(/^\uFEFF/, '').replace(/\r\n?|\n/g, '\n');
			const lut = parseCubeLut(content);
			if (lut.type !== '3d') {
				throw new Error('lut() only supports 3D .cube files.');
			}

			// lut() uses domain headers for the input range.
			content = content.replace(
				/^\s*LUT_3D_INPUT_RANGE[^\n]*$/gm,
				`DOMAIN_MIN ${lut.domainMin.join(' ')}\nDOMAIN_MAX ${lut.domainMax.join(' ')}`,
			);
			effect = {
				name: 'lut',
				importPath: '@remotion/effects/lut',
				config: {content},
			};
		}

		await addEffectToSequence({
			clientId,
			effect,
			fileName,
			nodePathInfo,
			selectItems,
		});
	} catch (err) {
		showNotification((err as Error).message, 4000);
	}
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
