import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import type {
	ElementInstallExpectedFileState,
	InsertElementRequest,
	PrepareElementInstallRequest,
} from '@remotion/studio-shared';
import {resolveCompositionComponentWithFile} from '../../helpers/resolve-composition-component';
import {getProjectInfo} from '../project-info';
import {getSafeElementInstallPaths} from './safe-element-install-path';

export const normalizeElementSourceForComparison = (source: string) => {
	return source.replace(/\r\n/g, '\n').trim();
};

export const getElementSourceHash = (source: string) => {
	return createHash('sha256').update(source).digest('hex');
};

export const validateElementInstallPosition = (
	position: InsertElementRequest['position'],
) => {
	if (position === null) {
		return;
	}

	if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
		throw new Error('Position must be finite');
	}
};

const validateDimensions = (
	dimensions: InsertElementRequest['element']['dimensions'],
) => {
	if (dimensions === null) {
		return;
	}

	if (
		!Number.isFinite(dimensions.width) ||
		!Number.isFinite(dimensions.height) ||
		dimensions.width <= 0 ||
		dimensions.height <= 0
	) {
		throw new Error('Element dimensions must be positive finite numbers');
	}
};

export const validateElementForInstallation = (
	element: InsertElementRequest['element'],
) => {
	if (
		StudioProtocolInternals.makeElementFileNameFromSlug(element.slug) === null
	) {
		throw new Error(
			'Element slug must produce a safe lowercase .tsx file name',
		);
	}

	if (
		typeof element.sourceCode !== 'string' ||
		element.sourceCode.trim().length === 0 ||
		element.sourceCode.length > 200000
	) {
		throw new Error('Unsupported Element source code');
	}

	if (
		StudioProtocolInternals.getElementComponentNameFromSourceCode(
			element.sourceCode,
		) === null
	) {
		throw new Error('Element source must export exactly one named component');
	}

	validateDimensions(element.dimensions);
};

export const makeRelativeElementImportPath = ({
	fromFile,
	toFile,
}: {
	fromFile: string;
	toFile: string;
}) => {
	const withoutExtension = toFile.replace(/\.tsx$/, '');
	let relative = path
		.relative(path.dirname(fromFile), withoutExtension)
		.split(path.sep)
		.join('/');

	if (!relative.startsWith('.')) {
		relative = `./${relative}`;
	}

	return relative;
};

const getExpectedFileState = (
	existingSource: string | null,
): ElementInstallExpectedFileState => {
	if (existingSource === null) {
		return {exists: false};
	}

	return {
		exists: true,
		sourceHash: getElementSourceHash(existingSource),
	};
};

export const getElementInstallPlan = async ({
	destination,
	element,
	entryPoint,
	remotionRoot,
}: PrepareElementInstallRequest & {
	entryPoint: string;
	remotionRoot: string;
}) => {
	validateElementForInstallation(element);

	const componentName =
		StudioProtocolInternals.getElementComponentNameFromSourceCode(
			element.sourceCode,
		);
	if (componentName === null) {
		throw new Error('Element source must export exactly one named component');
	}

	const location =
		destination.type === 'current-composition'
			? await resolveCompositionComponentWithFile({
					remotionRoot,
					compositionFile: destination.compositionFile,
					compositionId: destination.compositionId,
				})
			: null;
	if (location !== null && !location.canAddSequence) {
		throw new Error('Cannot insert Element into this composition component');
	}

	const derivedElementFileName =
		StudioProtocolInternals.makeElementFileNameFromSlug(element.slug);
	if (derivedElementFileName === null) {
		throw new Error(
			'Element slug must produce a safe lowercase .tsx file name',
		);
	}

	const destinationCompositionFile = destination.compositionFile;
	const destinationCompositionFileName =
		destinationCompositionFile === null
			? (await getProjectInfo(remotionRoot, entryPoint)).rootFile
			: path.resolve(remotionRoot, destinationCompositionFile);
	if (destinationCompositionFileName === null) {
		throw new Error('Could not find the root file of the project');
	}

	const compositionFileName =
		location?.fileName ?? destinationCompositionFileName;

	const safePaths = await getSafeElementInstallPaths({
		compositionFileName,
		elementFileName: path.resolve(
			path.dirname(compositionFileName),
			derivedElementFileName,
		),
		remotionRoot,
	});
	const elementFileExists = existsSync(safePaths.elementFileName);
	const existingElementSource = elementFileExists
		? readFileSync(safePaths.elementFileName, 'utf-8')
		: null;

	return {
		componentName,
		destinationCompositionFileName,
		elementFileExists,
		elementFileName: safePaths.elementFileName,
		existingElementSource,
		expectedFileState: getExpectedFileState(existingElementSource),
		filePath: path
			.relative(safePaths.remotionRoot, safePaths.elementFileName)
			.split(path.sep)
			.join('/'),
		importPath: makeRelativeElementImportPath({
			fromFile: safePaths.compositionFileName,
			toFile: safePaths.elementFileName,
		}),
		location,
		safePaths,
	};
};
