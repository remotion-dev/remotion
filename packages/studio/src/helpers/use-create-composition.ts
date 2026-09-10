import type {
	CanvasCaptureData,
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {useCallback, useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
import {useSelectComposition} from '../components/InitialCompositionLoader';
import {applyCodemod} from '../components/RenderQueue/actions';
import {slugifyName} from './slugify-name';
import {
	validateCompositionDimension,
	validateCompositionName,
} from './validate-new-comp-data';

const toPascalCase = (value: string) => {
	const words = value.match(/[a-zA-Z0-9]+/g) ?? [];
	const candidate = words
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join('');

	if (!candidate) {
		return 'NewComposition';
	}

	if (/^[0-9]/.test(candidate)) {
		return `Composition${candidate}`;
	}

	return candidate;
};

export const getUniqueCompositionName = (
	compositions: _InternalTypes['AnyComposition'][],
) => {
	let counter = 1;

	while (true) {
		const name = counter === 1 ? 'NewComposition' : `NewComposition${counter}`;
		const err = validateCompositionName(name, compositions);
		if (!err) {
			return name;
		}

		counter++;
	}
};

export const useCreateComposition = ({
	compositions,
	durationInFrames,
	folderName,
	newId,
	parentName,
	selectedFrameRate,
	size,
	canvasCapture,
}: {
	compositions: _InternalTypes['AnyComposition'][];
	durationInFrames: number;
	folderName: string | null;
	newId: string;
	parentName: string | null;
	selectedFrameRate: number;
	size: {
		width: number;
		height: number;
	};
	canvasCapture: {
		readonly data: CanvasCaptureData;
		readonly videoFileName: string;
		readonly videoHeight: number;
		readonly videoWidth: number;
	} | null;
}) => {
	const selectComposition = useSelectComposition();
	const compositionId = slugifyName(newId);
	const componentName = useMemo(
		() => toPascalCase(compositionId),
		[compositionId],
	);

	const nameValidationMessage = useMemo(() => {
		return compositionId
			? validateCompositionName(compositionId, compositions)
			: 'Enter an ID containing letters or numbers.';
	}, [compositionId, compositions]);

	const widthValidationMessage = useMemo(() => {
		return validateCompositionDimension('Width', size.width);
	}, [size.width]);

	const heightValidationMessage = useMemo(() => {
		return validateCompositionDimension('Height', size.height);
	}, [size.height]);

	const codemod: RecastCodemod = useMemo(() => {
		return {
			type: 'new-composition',
			newDurationInFrames: Number(durationInFrames),
			newFps: Number(selectedFrameRate),
			newHeight: Number(size.height),
			newWidth: Number(size.width),
			newId: compositionId,
			componentName,
			componentImportPath: `./${componentName}`,
			folderName,
			parentName,
			canvasCapture:
				canvasCapture === null
					? null
					: {
							data: canvasCapture.data,
							keyframeFps: Number(selectedFrameRate),
							videoFileName: canvasCapture.videoFileName,
							videoHeight: canvasCapture.videoHeight,
							videoWidth: canvasCapture.videoWidth,
						},
		};
	}, [
		canvasCapture,
		componentName,
		compositionId,
		durationInFrames,
		folderName,
		parentName,
		selectedFrameRate,
		size.height,
		size.width,
	]);

	const valid =
		nameValidationMessage === null &&
		widthValidationMessage === null &&
		heightValidationMessage === null;

	const createComposition = useCallback(
		async ({
			signal,
			symbolicatedStack,
		}: {
			signal: AbortSignal;
			symbolicatedStack: SymbolicatedStackFrame | null;
		}) => {
			const result = await applyCodemod({
				codemod,
				dryRun: false,
				signal,
				symbolicatedStack,
			});

			if (result.success) {
				selectComposition(
					{
						id: compositionId,
						folderName,
						parentFolderName: parentName,
					},
					true,
				);
			}

			return result;
		},
		[codemod, compositionId, folderName, parentName, selectComposition],
	);

	return {
		codemod,
		compositionId,
		createComposition,
		heightValidationMessage,
		nameValidationMessage,
		valid,
		widthValidationMessage,
	};
};
