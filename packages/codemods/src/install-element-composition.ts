import type {ElementInitialProps} from '@remotion/studio-protocol';
import type {InsertElementRequest} from '@remotion/studio-shared';
import {addComposition} from './add-composition';
import {addElement} from './add-element';
import {applyCodemodChanges, type CodemodProject} from './codemod-project';
import type {CompositionMetadata} from './composition-editing';
import {getNodeProps} from './get-node-props';
import {getNodes} from './get-nodes';
import {
	createElementFromInsertable,
	toCodemodValue,
} from './insertable-element';
import type {CodemodNodeResult, NodePathRemapping} from './node-references';
import {resolveCompositionComponent} from './resolve-composition-component';
import {updateNodeProps} from './update-node-props';

const getElementImportPath = (fromFile: string, elementFile: string) => {
	const from = fromFile.replaceAll('\\', '/').split('/').slice(0, -1);
	const to = elementFile
		.replaceAll('\\', '/')
		.replace(/\.tsx$/, '')
		.split('/');
	while (from.length > 0 && from[0] === to[0]) {
		from.shift();
		to.shift();
	}

	const relative = [...from.map(() => '..'), ...to].join('/');
	return relative.startsWith('.') ? relative : `./${relative}`;
};

export const getElementInitialProps = (
	element: InsertElementRequest['element'],
): ElementInitialProps => {
	const initialProps = {...element.initialProps};
	if (element.installationMode === 'component-owned-sequence') {
		if (
			['from', 'durationInFrames', 'name'].some((key) =>
				Object.hasOwn(initialProps, key),
			)
		) {
			throw new Error(
				'Component-owned Element initial props must not override from, durationInFrames, or name',
			);
		}

		if (
			initialProps.style !== undefined &&
			(initialProps.style === null ||
				typeof initialProps.style !== 'object' ||
				Array.isArray(initialProps.style))
		) {
			throw new Error(
				'Component-owned Element initial style must be an object',
			);
		}

		// Older schema-enabled Elements expect their bounds on the visual root.
		if (element.dimensions !== null) {
			initialProps.style = {
				...element.dimensions,
				...(typeof initialProps.style === 'object' ? initialProps.style : {}),
			};
		}
	}

	return initialProps;
};

// Shared by the filesystem and virtual-project installers. Registration and
// insertion use the same copied export; the library's source is never rewritten.
export const installElementComposition = ({
	project,
	request,
	registrationFile,
	elementFile,
	componentName,
	target,
}: {
	project: CodemodProject;
	request: Extract<InsertElementRequest, {captionTarget: null}>;
	registrationFile: string;
	elementFile: string;
	componentName: string;
	target: {filePath: string; exportName: string} | null;
}) => {
	const {element, newComposition} = request;
	const initialProps = getElementInitialProps(element);
	let nextProject = {
		...project,
		files: {...project.files, [elementFile]: element.sourceCode},
	};
	const remappings: NodePathRemapping[] = [];
	const apply = (result: CodemodNodeResult) => {
		// Compose paths across insertion, registration and default-prop edits,
		// including when the component and its registrations share one file.
		for (const previous of remappings) {
			const next = result.nodePathRemappings.find(
				(entry) =>
					entry.filePath === previous.filePath &&
					entry.oldNodePath !== null &&
					JSON.stringify(entry.oldNodePath) ===
						JSON.stringify(previous.newNodePath),
			);
			if (next) previous.newNodePath = next.newNodePath;
		}

		for (const entry of result.nodePathRemappings) {
			if (
				entry.oldNodePath === null ||
				!remappings.some(
					(previous) =>
						previous.filePath === entry.filePath &&
						JSON.stringify(previous.newNodePath) ===
							JSON.stringify(entry.newNodePath),
				)
			) {
				remappings.push({...entry});
			}
		}

		nextProject = applyCodemodChanges(nextProject, result.changes);
	};

	const compositionNodes = Object.keys(project.files)
		.filter(
			(filePath) => /\.[jt]sx?$/.test(filePath) && filePath !== elementFile,
		)
		.flatMap((filePath) =>
			getNodes({project, filePath}).filter(
				(node) =>
					node.componentIdentity === 'dev.remotion.remotion.Composition' ||
					node.componentIdentity === 'dev.remotion.remotion.Still',
			),
		);
	const ids = new Set(request.compositionContext?.compositionIds ?? []);
	let existingId: string | null = null;
	let existingRegistrationFile: string | null = null;
	let targetMetadata: Partial<CompositionMetadata> = {};
	for (const node of compositionNodes) {
		const {props} = getNodeProps({
			project,
			node,
			keys: ['id', 'width', 'height', 'fps', 'durationInFrames'],
		});
		if (props.id.status !== 'static' || typeof props.id.codeValue !== 'string')
			continue;
		const id = props.id.codeValue;
		ids.add(id);
		if (id === request.compositionId && node.filePath === registrationFile) {
			for (const key of [
				'width',
				'height',
				'fps',
				'durationInFrames',
			] as const) {
				if (
					props[key].status === 'static' &&
					typeof props[key].codeValue === 'number'
				)
					targetMetadata[key] = props[key].codeValue;
			}
		}

		if (newComposition !== null) continue;
		try {
			const resolved = resolveCompositionComponent({
				project: nextProject,
				compositionFile: node.filePath,
				compositionId: id,
			});
			if (
				resolved.filePath === elementFile &&
				resolved.exportName === componentName
			) {
				existingId = id;
				existingRegistrationFile = node.filePath;
			}
		} catch {
			// Unrelated lazy or external compositions need not be resolvable in
			// the subset of source files loaded for this installation.
		}
	}

	targetMetadata = request.compositionContext ?? targetMetadata;
	const options = newComposition?.options ?? null;
	const metadata: CompositionMetadata =
		options === null
			? {
					width: Math.ceil(
						element.dimensions?.width ?? targetMetadata.width ?? 1920,
					),
					height: Math.ceil(
						element.dimensions?.height ?? targetMetadata.height ?? 1080,
					),
					fps: targetMetadata.fps ?? 30,
					durationInFrames:
						element.durationInFrames ?? targetMetadata.durationInFrames ?? 150,
				}
			: {
					width: options.newWidth,
					height: options.newHeight,
					fps: options.newFps,
					durationInFrames: options.newDurationInFrames,
				};
	const baseId =
		elementFile
			.split(/[\\/]/)
			.at(-1)!
			.replace(/\.element\.tsx$/, '')
			.replace(/[^a-zA-Z0-9-]/g, '-')
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join('') || componentName;
	let compositionId = options?.newId ?? existingId ?? baseId;
	if (options !== null && ids.has(compositionId)) {
		throw new Error(`Composition "${compositionId}" already exists`);
	}

	if (options === null && existingId === null) {
		let suffix = 2;
		while (ids.has(compositionId)) compositionId = `${baseId}${suffix++}`;
	}

	if (target !== null) {
		const instanceProps = {...initialProps};
		if (element.installationMode === 'component-owned-sequence') {
			// The old installer replaced positioning on schema-enabled roots.
			// Keep the root absolute, but apply drop translation only once, on
			// the containing Sequence. Standalone defaults retain preview styles.
			instanceProps.style = {
				...Object.fromEntries(
					Object.entries(
						typeof initialProps.style === 'object' &&
							initialProps.style !== null
							? initialProps.style
							: {},
					).filter(
						([key]) =>
							key !== 'position' &&
							(request.position === null || key !== 'translate'),
					),
				),
				position: 'absolute',
			};
		}

		const inserted = addElement({
			project: nextProject,
			target: {type: 'component', ...target},
			element: createElementFromInsertable({
				element: {
					type: 'component',
					componentName,
					importName: componentName,
					importPath: getElementImportPath(target.filePath, elementFile),
					props: Object.entries(instanceProps).map(([name, value]) => ({
						name,
						value,
					})),
					position: null,
				},
				from: null,
				wrapInSequence: {
					dimensions: element.dimensions,
					durationInFrames:
						element.durationInFrames ?? metadata.durationInFrames,
					from: request.from,
					name: element.displayName,
					position: request.position,
				},
			}),
			prettierConfigOverride: null,
		});
		apply(inserted);
	}

	if (existingRegistrationFile === null) {
		const registration = addComposition({
			project: nextProject,
			compositionFile: registrationFile,
			compositionId,
			component: {
				importName: componentName,
				importPath: getElementImportPath(registrationFile, elementFile),
			},
			metadata,
			folder: options?.folderName
				? {name: options.folderName, parentName: options.parentName}
				: undefined,
		});
		apply(registration);
		if (Object.keys(initialProps).length > 0) {
			apply(
				updateNodeProps({
					project: nextProject,
					node: registration.insertedNode,
					props: {defaultProps: toCodemodValue(initialProps)},
				}),
			);
		}
	}

	return {
		compositionId,
		changes: Object.entries(nextProject.files).flatMap(
			([filePath, nextContents]) =>
				project.files[filePath] === nextContents
					? []
					: [
							{
								filePath,
								previousContents: project.files[filePath] ?? null,
								nextContents,
							},
						],
		),
		nodePathRemappings: remappings,
	};
};
