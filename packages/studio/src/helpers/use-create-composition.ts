import type {
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {useCallback, useContext, useMemo} from 'react';
import {Internals, type _InternalTypes} from 'remotion';
import {applyCodemod} from '../components/RenderQueue/actions';
import {pushUrl} from './url-state';
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

const waitForComposition = (compositionId: string) => {
	return new Promise<void>((resolve) => {
		const started = Date.now();
		const interval = window.setInterval(() => {
			const compositionNames = window.remotion_getCompositionNames?.() ?? [];
			if (
				compositionNames.includes(compositionId) ||
				Date.now() - started > 10000
			) {
				window.clearInterval(interval);
				resolve();
			}
		}, 100);
	});
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
}) => {
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const componentName = useMemo(() => toPascalCase(newId), [newId]);

	const nameValidationMessage = useMemo(() => {
		return validateCompositionName(newId, compositions);
	}, [compositions, newId]);

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
			newId,
			componentName,
			componentImportPath: `./${componentName}`,
			folderName,
			parentName,
		};
	}, [
		componentName,
		durationInFrames,
		folderName,
		newId,
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
				await waitForComposition(newId);
				setCanvasContent({type: 'composition', compositionId: newId});
				pushUrl(`/${newId}`);
			}

			return result;
		},
		[codemod, newId, setCanvasContent],
	);

	return {
		codemod,
		createComposition,
		heightValidationMessage,
		nameValidationMessage,
		valid,
		widthValidationMessage,
	};
};
