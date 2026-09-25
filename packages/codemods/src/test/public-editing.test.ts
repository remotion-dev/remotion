import {expect, test} from 'bun:test';
import {
	addComposition,
	addEffect,
	addElement,
	addFolder,
	applyCodemodChanges,
	createElement,
	deleteComposition,
	deleteEffects,
	deleteJsxNodes,
	detachAudio,
	duplicateComposition,
	duplicateEffects,
	duplicateJsxNodes,
	getJsxNodeProps,
	getJsxNodes,
	moveComposition,
	moveFolder,
	renameComposition,
	renameFolder,
	reorderEffect,
	reorderJsxNode,
	resolveCompositionComponent,
	setCompositionDefaultProps,
	splitSequences,
	staticFileValue,
	unwrapFolder,
	updateCompositionMetadata,
	updateEffectKeyframes,
	updateEffectProps,
	updateJsxNodeKeyframes,
	updateJsxNodeProps,
	updateMultipleJsxNodeProps,
	wrapJsxNode,
	type CodemodProject,
} from '../index';
import {getChangedContents} from './get-changed-contents';

const compositionFile = 'src/Root.tsx';
const filePath = 'src/Video.tsx';
const compositionTarget = {
	type: 'composition' as const,
	compositionFile,
	compositionId: 'Demo',
};
const makeProject = () => ({
	rootDir: '/',
	entryPoint: 'src/index.ts',
	files: {
		'src/index.ts':
			"import {registerRoot} from 'remotion'; import {Root} from './Root'; registerRoot(Root);",
		[compositionFile]: `import {Composition} from 'remotion';
import {Video} from './Video';
export const Root = () => <Composition id="Demo" component={Video} width={1280} height={720} fps={30} durationInFrames={90} />;
`,
		[filePath]: `import {AbsoluteFill} from 'remotion';
// Preserve this unrelated formatting.
const unrelated  =  {value:"keep"};
export const Video = () => <AbsoluteFill><div style={{opacity: 0.5}}>Hello</div></AbsoluteFill>;
`,
		'src/Title.tsx':
			'export const Title = ({text}: {text: string}) => <div>{text}</div>;',
	},
});

const findNode = (
	project: CodemodProject,
	tagName: string,
	sourceFile = filePath,
) => {
	const node = getJsxNodes({project, filePath: sourceFile}).find(
		(item) => item.tagName === tagName,
	);
	if (!node) throw new Error(`No ${tagName} in ${sourceFile}`);
	return node;
};

test('discover, inspect, edit, animate, and remove JSX through the public API', async () => {
	const project = makeProject();
	expect(
		resolveCompositionComponent({
			project,
			compositionFile,
			compositionId: 'Demo',
		}),
	).toMatchObject({filePath, exportName: 'Video', canAddContent: true});
	const node = findNode(project, 'div');
	expect(node.location?.line).toBe(4);
	expect(
		getJsxNodeProps({project, node, keys: ['children']}).props.children,
	).toMatchObject({status: 'static', codeValue: 'Hello'});
	const changed = updateJsxNodeProps({
		project,
		node,
		props: {children: 'Goodbye', 'style.opacity': 0.75, title: 'Example'},
	});
	const afterChange = applyCodemodChanges(project, changed.changes);
	expect(afterChange.entryPoint).toBe(project.entryPoint);
	expect(project.files[filePath]).toContain('Hello');
	expect(getChangedContents(changed, filePath)).toContain('Goodbye');
	expect(getChangedContents(changed, filePath)).toContain(
		'const unrelated  =  {value:"keep"};',
	);
	const animated = await updateJsxNodeKeyframes({
		project: afterChange,
		node: changed.updatedNode,
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 0, value: 0}},
			{key: 'style.opacity', operation: {type: 'add', frame: 30, value: 1}},
		],
	});
	const afterAnimation = applyCodemodChanges(afterChange, animated.changes);
	expect(getChangedContents(animated, filePath)).toContain('useCurrentFrame');
	expect(
		animated.nodePathRemappings.some(
			(entry) =>
				JSON.stringify(entry.oldNodePath) === JSON.stringify(node.nodePath),
		),
	).toBe(true);
	expect(
		getJsxNodeProps({
			project: afterAnimation,
			node: animated.updatedNode,
			keys: ['style.opacity'],
		}).props['style.opacity'],
	).toMatchObject({
		status: 'keyframed',
		keyframes: [
			{frame: 0, value: 0},
			{frame: 30, value: 1},
		],
	});
	const withoutTitle = updateJsxNodeProps({
		project: afterAnimation,
		node: animated.updatedNode,
		props: {title: undefined},
	});
	expect(getChangedContents(withoutTitle, filePath)).not.toContain('title=');
	const afterRemoveTitle = applyCodemodChanges(
		afterAnimation,
		withoutTitle.changes,
	);
	const deleted = await deleteJsxNodes({
		project: afterRemoveTitle,
		nodes: [withoutTitle.updatedNode],
	});
	expect(
		getJsxNodes({
			project: applyCodemodChanges(afterRemoveTitle, deleted.changes),
			filePath,
		}).map((entry) => entry.tagName),
	).toEqual(['AbsoluteFill']);
	expect(
		deleted.nodePathRemappings.some((entry) => entry.newNodePath === null),
	).toBe(true);
});

test('insert media and components, reorder copies, and delete nodes across files', async () => {
	const project = makeProject();
	const image = createElement({
		component: 'Img',
		importPath: 'remotion',
		props: {
			src: staticFileValue('photo.png'),
			style: {width: 100, height: 100},
		},
	});
	const media = addElement({
		project,
		element: createElement({
			component: 'Sequence',
			importPath: 'remotion',
			props: {from: 10, durationInFrames: 30},
		}).withChild(image),
		target: compositionTarget,
	});
	expect(getChangedContents(media, filePath)).toMatch(
		/staticFile\(["']photo\.png["']\)/,
	);
	expect(getChangedContents(media, filePath)).toContain(
		"import {AbsoluteFill, Sequence, Img, staticFile} from 'remotion';",
	);
	const afterMedia = applyCodemodChanges(project, media.changes);
	expect(
		getJsxNodeProps({
			project: afterMedia,
			node: media.insertedNode,
			keys: ['from'],
		}).props.from,
	).toMatchObject({codeValue: 10});
	const imageNode = getJsxNodes({project: afterMedia, filePath}).find(
		(node) => node.tagName === 'Img',
	)!;
	expect(imageNode.parentNodePath).toEqual(media.insertedNode.nodePath);
	const added = addElement({
		project: afterMedia,
		element: createElement({
			component: 'Title',
			importPath: './Title',
			props: {text: 'A title'},
		}),
		target: compositionTarget,
	});
	expect(getChangedContents(added, filePath)).toContain("from './Title'");
	expect(getChangedContents(added, filePath)).toContain(
		'<Title text="A title" />',
	);
	const afterAdd = applyCodemodChanges(afterMedia, added.changes);
	const duplicated = await duplicateJsxNodes({
		project: afterAdd,
		nodes: [added.insertedNode, findNode(afterAdd, 'div', 'src/Title.tsx')],
	});
	expect(duplicated.insertedNodes).toHaveLength(2);
	expect(duplicated.changes.map((change) => change.filePath)).toEqual([
		filePath,
		'src/Title.tsx',
	]);
	const copiedTitle = duplicated.insertedNodes.find(
		(node) => node.filePath === filePath,
	)!;
	const afterDuplicate = applyCodemodChanges(afterAdd, duplicated.changes);
	const reordered = await reorderJsxNode({
		project: afterDuplicate,
		node: copiedTitle,
		target: added.insertedNode,
		position: 'before',
	});
	const afterReorder = applyCodemodChanges(afterDuplicate, reordered.changes);
	const updatedCopy = updateJsxNodeProps({
		project: afterReorder,
		node: reordered.updatedNode,
		props: {text: 'Copied title'},
	});
	expect(
		getChangedContents(updatedCopy, filePath).indexOf('Copied title'),
	).toBeLessThan(getChangedContents(updatedCopy, filePath).indexOf('A title'));
	const afterUpdate = applyCodemodChanges(afterReorder, updatedCopy.changes);
	const deleted = await deleteJsxNodes({
		project: afterUpdate,
		nodes: [
			updatedCopy.updatedNode,
			duplicated.insertedNodes.find(
				(node) => node.filePath === 'src/Title.tsx',
			)!,
		],
	});
	const afterDelete = applyCodemodChanges(afterUpdate, deleted.changes);
	expect(
		getJsxNodes({project: afterDelete, filePath}).filter(
			(node) => node.tagName === 'Title',
		),
	).toHaveLength(1);
	expect(getChangedContents(deleted, 'src/Title.tsx')).toContain('{text}');
	expect(Object.keys(afterDelete.files)).toEqual(Object.keys(project.files));
});

test('split timeline media and detach audio', async () => {
	const project = makeProject();
	project.files[filePath] = `import {Video, Audio} from '@remotion/media';
export const VideoComposition = () => <><Video src="video.mp4" from={10} durationInFrames={80} trimBefore={5}/><Audio src="audio.mp3" from={0} durationInFrames={90}/></>;`;
	const split = await splitSequences({
		project,
		splits: [
			{node: findNode(project, 'Video'), frame: 40},
			{node: findNode(project, 'Audio'), frame: 40},
		],
	});
	expect(split.insertedNodes).toHaveLength(2);
	const secondVideo = split.insertedNodes[0];
	const afterSplit = applyCodemodChanges(project, split.changes);
	expect(
		getJsxNodeProps({
			project: afterSplit,
			node: secondVideo,
			keys: ['from', 'durationInFrames', 'trimBefore'],
		}).props,
	).toMatchObject({
		from: {codeValue: 40},
		durationInFrames: {codeValue: 50},
		trimBefore: {codeValue: 35},
	});
	const detached = await detachAudio({
		project: afterSplit,
		node: secondVideo,
	});
	const afterDetach = applyCodemodChanges(afterSplit, detached.changes);
	expect(
		getJsxNodeProps({
			project: afterDetach,
			node: detached.updatedNode,
			keys: ['muted'],
		}).props.muted,
	).toMatchObject({codeValue: true});
	expect(
		getJsxNodeProps({
			project: afterDetach,
			node: detached.insertedNode,
			keys: ['src', 'trimBefore'],
		}).props,
	).toMatchObject({src: {codeValue: 'video.mp4'}, trimBefore: {codeValue: 35}});
	expect(project.files[filePath]).not.toContain('muted');
});

test('manage composition registrations and nested folders without changing components', () => {
	const original = makeProject();
	const helper = 'const Helper = () => <div>Keep this helper unchanged</div>;';
	original.files[compositionFile] = original.files[compositionFile]
		.replace(
			'export const Root = () => ',
			`export const Root = () => {\n${helper}\nreturn `,
		)
		.replace('/>;\n', '/>;\n};\n');
	let project = applyCodemodChanges(
		original,
		addComposition({
			project: original,
			compositionFile,
			compositionId: 'Second',
			component: {importName: 'Title', importPath: './Title'},
			metadata: {width: 1920, height: 1080, fps: 30, durationInFrames: 60},
		}).changes,
	);
	expect(project.files[compositionFile]).toContain(helper);
	project = applyCodemodChanges(
		project,
		setCompositionDefaultProps({
			project,
			compositionFile,
			compositionId: 'Second',
			defaultProps: {text: 'Title'},
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		duplicateComposition({
			project,
			compositionFile,
			compositionId: 'Second',
			newId: 'Portrait',
			metadata: {width: 1080, height: 1920},
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		renameComposition({
			project,
			compositionFile,
			compositionId: 'Portrait',
			newId: 'Vertical',
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		updateCompositionMetadata({
			project,
			compositionFile,
			compositionId: 'Vertical',
			metadata: {fps: 60, durationInFrames: 120},
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		addFolder({
			project,
			compositionFile,
			folder: {name: 'Social', parentName: null},
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		addFolder({
			project,
			compositionFile,
			folder: {name: 'Archive', parentName: 'Social'},
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		moveComposition({
			project,
			compositionFile,
			compositionId: 'Vertical',
			destination: {
				type: 'folder',
				folder: {name: 'Archive', parentName: 'Social'},
			},
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		renameFolder({
			project,
			compositionFile,
			folder: {name: 'Archive', parentName: 'Social'},
			newName: 'Published',
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		moveFolder({
			project,
			compositionFile,
			folder: {name: 'Published', parentName: 'Social'},
			destination: {type: 'root'},
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		moveFolder({
			project,
			compositionFile,
			folder: {name: 'Published', parentName: null},
			destination: {type: 'folder', folder: {name: 'Social', parentName: null}},
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		unwrapFolder({
			project,
			compositionFile,
			folder: {name: 'Social', parentName: null},
		}).changes,
	);
	expect(project.files[compositionFile]).not.toContain('name="Social"');
	expect(project.files[compositionFile]).toContain('name="Published"');
	const composition = getJsxNodes({project, filePath: compositionFile}).find(
		(node) => {
			const status = getJsxNodeProps({project, node, keys: ['id']}).props.id;
			return status.status === 'static' && status.codeValue === 'Vertical';
		},
	)!;
	expect(
		getJsxNodeProps({
			project,
			node: composition,
			keys: ['width', 'height', 'fps', 'durationInFrames', 'defaultProps'],
		}).props,
	).toMatchObject({
		width: {codeValue: 1080},
		height: {codeValue: 1920},
		fps: {codeValue: 60},
		durationInFrames: {codeValue: 120},
		defaultProps: {codeValue: {text: 'Title'}},
	});
	project = applyCodemodChanges(
		project,
		deleteComposition({
			project,
			compositionFile,
			compositionId: 'Second',
		}).changes,
	);
	expect(project.files[compositionFile]).not.toContain('id="Second"');
	expect(project.files[filePath]).toBe(original.files[filePath]);
	expect(project.files['src/Title.tsx']).toBe(original.files['src/Title.tsx']);
	expect(original.files[compositionFile]).not.toContain('Vertical');
});

test('add, duplicate, reorder, edit, animate, and delete effects', async () => {
	const project = makeProject();
	const node = findNode(project, 'AbsoluteFill');
	const first = await addEffect({
		project,
		node,
		importName: 'blur',
		importPath: '@remotion/effects/blur',
		props: {radius: 1},
	});
	const afterFirst = applyCodemodChanges(project, first.changes);
	const second = await addEffect({
		project: afterFirst,
		node: first.insertedEffect,
		importName: 'brightness',
		importPath: '@remotion/effects/brightness',
		props: {amount: 1},
	});
	const afterSecond = applyCodemodChanges(afterFirst, second.changes);
	const duplicate = await duplicateEffects({
		project: afterSecond,
		effects: [first.insertedEffect, second.insertedEffect],
	});
	expect(duplicate.insertedEffects.map((effect) => effect.effectIndex)).toEqual(
		[1, 3],
	);
	const afterDuplicate = applyCodemodChanges(afterSecond, duplicate.changes);
	const reordered = await reorderEffect({
		project: afterDuplicate,
		effect: duplicate.insertedEffects[1],
		toIndex: 0,
	});
	const afterReorder = applyCodemodChanges(afterDuplicate, reordered.changes);
	const edited = await updateEffectProps({
		project: afterReorder,
		effect: reordered.updatedEffect,
		props: {amount: 2},
	});
	const afterEdit = applyCodemodChanges(afterReorder, edited.changes);
	const animated = await updateEffectKeyframes({
		project: afterEdit,
		effect: edited.updatedEffect,
		updates: [
			{key: 'amount', operation: {type: 'add', frame: 0, value: 1}},
			{key: 'amount', operation: {type: 'add', frame: 30, value: 2}},
		],
	});
	const afterAnimation = applyCodemodChanges(afterEdit, animated.changes);
	const status = getJsxNodeProps({
		project: afterAnimation,
		node: animated.updatedEffect,
		keys: [],
		effectKeys: [['amount'], ['radius'], ['radius'], ['amount']],
	}).effects;
	expect(status[0]).toMatchObject({
		canUpdate: true,
		callee: 'brightness',
		props: {amount: {status: 'keyframed'}},
	});
	const deleted = await deleteEffects({
		project: afterAnimation,
		effects: [
			animated.updatedEffect,
			{...animated.updatedEffect, effectIndex: 3},
		],
	});
	const afterDelete = applyCodemodChanges(afterAnimation, deleted.changes);
	expect(
		getJsxNodeProps({
			project: afterDelete,
			node: animated.updatedEffect,
			keys: [],
			effectKeys: [['radius'], ['radius']],
		}).effects.map((effect) => (effect.canUpdate ? effect.callee : null)),
	).toEqual(['blur', 'blur']);
	expect(getChangedContents(deleted, filePath)).toContain(
		'const unrelated  =  {value:"keep"};',
	);
	expect(project.files[filePath]).not.toContain('effects=');
});

test('reject unsupported expressions and invalid edits atomically', async () => {
	const project = makeProject();
	project.files[filePath] =
		'export const Video = ({timing, style}) => <div {...timing} style={style}>Hello</div>;';
	const original = {...project.files};
	const node = findNode(project, 'div');
	expect(
		getJsxNodeProps({project, node, keys: ['from', 'style.opacity']}).props,
	).toEqual({
		from: {status: 'computed'},
		'style.opacity': {status: 'computed'},
	});
	expect(() =>
		updateJsxNodeProps({project, node, props: {'style.opacity': 1}}),
	).toThrow('computed');
	expect(() =>
		duplicateComposition({
			project,
			compositionFile,
			compositionId: 'Demo',
			newId: 'Demo',
		}),
	).toThrow('already exists');
	expect(() =>
		updateCompositionMetadata({
			project,
			compositionFile,
			compositionId: 'Demo',
			metadata: {fps: -1},
		}),
	).toThrow('positive');
	await expect(
		deleteJsxNodes({
			project,
			nodes: [node, {filePath: 'missing.tsx', nodePath: []}],
		}),
	).rejects.toThrow();
	await expect(
		reorderJsxNode({
			project,
			node,
			target: findNode(project, 'Composition', compositionFile),
			position: 'before',
		}),
	).rejects.toThrow('same file');
	expect(project.files).toEqual(original);
});

test('addElement returns remappings usable by public discovery and targets nodes', () => {
	const project = makeProject();
	const solid = createElement({
		component: 'Solid',
		importPath: 'remotion',
		props: {width: 100, height: 100, color: 'gray'},
	});
	const inserted = addElement({
		project,
		element: createElement({
			component: 'Sequence',
			importPath: 'remotion',
			props: {from: 15},
			children: [solid],
		}),
		target: compositionTarget,
	});
	const afterInsert = applyCodemodChanges(project, inserted.changes);
	expect(
		inserted.nodePathRemappings.some(
			(entry) =>
				entry.oldNodePath === null &&
				JSON.stringify(entry.newNodePath) ===
					JSON.stringify(inserted.insertedNode.nodePath),
		),
	).toBe(true);
	expect(
		getJsxNodeProps({
			project: afterInsert,
			node: inserted.insertedNode,
			keys: ['from'],
		}).props.from,
	).toMatchObject({status: 'static', codeValue: 15});

	const nodes = getJsxNodes({project: afterInsert, filePath});
	const sequence = nodes.find((node) => node.tagName === 'Sequence')!;
	const div = nodes.find((node) => node.tagName === 'div')!;
	const caption = createElement({
		component: 'p',
		props: {className: 'caption', 'data-testid': 'caption'},
		children: ['Hello {world} & friends', {component: 'br'}],
	});
	const inside = addElement({
		project: afterInsert,
		element: caption,
		target: {type: 'inside', node: sequence},
	});
	expect(getChangedContents(inside, filePath)).toContain(
		`<p className="caption" data-testid="caption">`,
	);
	expect(getChangedContents(inside, filePath)).toContain(
		"{'Hello {world} & friends'}",
	);
	const afterInside = applyCodemodChanges(afterInsert, inside.changes);
	expect(
		getJsxNodes({project: afterInside, filePath})
			.filter(
				(node) =>
					JSON.stringify(node.parentNodePath) ===
					JSON.stringify(inside.insertedNode.nodePath),
			)
			.map((node) => node.tagName),
	).toEqual(['br']);
	const before = addElement({
		project: afterInside,
		element: createElement({component: 'span', children: ['first']}),
		target: {
			type: 'before',
			node: getJsxNodes({project: afterInside, filePath}).find(
				(node) => node.tagName === 'div',
			)!,
		},
	});
	const afterBefore = applyCodemodChanges(afterInside, before.changes);
	expect(
		getJsxNodes({project: afterBefore, filePath}).map((node) => node.tagName),
	).toEqual(['AbsoluteFill', 'span', 'div', 'Sequence', 'Solid', 'p', 'br']);
	expect(afterBefore.files[filePath]).toContain('<span>first</span>');
	const wrapped = wrapJsxNode({
		project: afterBefore,
		node: getJsxNodes({project: afterBefore, filePath}).find(
			(node) => node.tagName === 'div',
		)!,
		wrapper: createElement({
			component: 'Sequence',
			importPath: 'remotion',
			props: {from: 5, name: 'Wrapped'},
		}),
	});
	expect(getChangedContents(wrapped, filePath)).toContain(
		'<Sequence from={5} name="Wrapped">',
	);
	expect(() =>
		wrapJsxNode({
			project: afterBefore,
			node: div,
			wrapper: createElement({component: 'div', children: ['x']}),
		}),
	).toThrow('cannot have children');
	expect(() =>
		createElement({component: 'div', importPath: 'remotion'}),
	).toThrow('uppercase');
	expect(() => createElement({component: '1Bad'})).toThrow('tag name');
	expect(() =>
		createElement({component: 'div', props: {'bad name': 1}}),
	).toThrow('prop name');
	expect(solid.withProp('width', 200).props.width).toBe(200);
	expect(solid.props.width).toBe(100);
	expect(solid.withoutProp('color').props).toEqual({width: 100, height: 100});
	expect(JSON.parse(JSON.stringify(caption))).toEqual({
		component: 'p',
		importPath: null,
		props: {className: 'caption', 'data-testid': 'caption'},
		children: [
			'Hello {world} & friends',
			{component: 'br', importPath: null, props: {}, children: []},
		],
	});
});

test('nested copies return root references and insertion preserves relative keys under a project root', async () => {
	const original = {...makeProject(), rootDir: '/project'};
	const media = addElement({
		project: original,
		element: createElement({
			component: 'Sequence',
			importPath: 'remotion',
			props: {from: 0, durationInFrames: 60},
			children: [
				{
					component: 'Video',
					importPath: '@remotion/media',
					props: {src: 'https://example.com/video.mp4'},
				},
			],
		}),
		target: compositionTarget,
	});
	// The component file already declares `Video`, so the import is aliased.
	expect(getChangedContents(media, filePath)).toContain(
		"import {Video as Video2} from '@remotion/media';",
	);
	expect(getChangedContents(media, filePath)).toContain(
		'<Video2 src="https://example.com/video.mp4" />',
	);
	expect(media.insertedNode.filePath).toBe(filePath);
	const afterMedia = applyCodemodChanges(original, media.changes);
	expect(Object.keys(afterMedia.files)).toEqual(Object.keys(original.files));
	const copy = await duplicateJsxNodes({
		project: afterMedia,
		nodes: [media.insertedNode],
	});
	expect(copy.insertedNodes).toHaveLength(1);
	expect(
		copy.nodePathRemappings.filter((entry) => entry.oldNodePath === null),
	).toHaveLength(2);
	const afterCopy = applyCodemodChanges(afterMedia, copy.changes);
	const split = await splitSequences({
		project: afterCopy,
		splits: [{node: copy.insertedNodes[0], frame: 30}],
	});
	expect(split.insertedNodes).toHaveLength(1);
	const afterSplit = applyCodemodChanges(afterCopy, split.changes);
	const deleted = await deleteJsxNodes({
		project: afterSplit,
		nodes: split.insertedNodes,
	});
	expect(
		getJsxNodes({
			project: applyCodemodChanges(afterSplit, deleted.changes),
			filePath,
		}).filter((node) => node.tagName === 'Sequence'),
	).toHaveLength(2);
});

test('reject ambiguous registration roots and unsupported splitting or audio detachment', async () => {
	const project = makeProject();
	project.files[compositionFile] +=
		'\nconst AnotherRoot = () => <Composition id="Other" component={Video} />;';
	expect(() =>
		addComposition({
			project,
			compositionFile,
			compositionId: 'Second',
			component: {importName: 'Title', importPath: './Title'},
			metadata: {width: 100, height: 100, fps: 30, durationInFrames: 30},
		}),
	).toThrow('single JSX component');
	const node = findNode(project, 'div');
	await expect(
		splitSequences({project, splits: [{node, frame: 10}]}),
	).rejects.toThrow('Only Remotion');
	await expect(detachAudio({project, node})).rejects.toThrow('Remotion video');
});

test('node discovery and edits use original source locations with tabs and CRLF', () => {
	const project = makeProject();
	project.files[filePath] =
		'\uFEFFexport const Video = () => (\r\n\t<div style={{opacity: 1}}>Hello</div>\r\n);\r\n';
	const node = findNode(project, 'div');
	expect(node.location).toEqual({line: 2, column: 1});
	const edited = updateJsxNodeProps({
		project,
		node,
		props: {'style.opacity': 0.25},
	});
	expect(getChangedContents(edited, filePath)).toContain('opacity: 0.25');
	expect(getChangedContents(edited, filePath).startsWith('\uFEFF')).toBe(true);
	expect(getChangedContents(edited, filePath)).toContain('\r\n');
});

test('batch structured prop edits across files and preserve edit results in request order', () => {
	const project = {
		rootDir: '/',
		files: {
			'first.tsx':
				'export const First = () => <div style={{opacity: 0.5}} title="first" />;',
			'second.tsx': 'export const Second = () => <div title="second" />;',
		},
	};
	const first = getJsxNodes({project, filePath: 'first.tsx'})[0];
	const second = getJsxNodes({project, filePath: 'second.tsx'})[0];
	const result = updateMultipleJsxNodeProps({
		project,
		changes: [
			{
				node: first,
				updates: [{key: 'style.opacity', value: 1, defaultValue: 1}],
			},
			{node: second, props: {title: 'updated second'}},
			{node: first, props: {title: 'updated first'}},
		],
	});

	expect(result.changes).toHaveLength(2);
	expect(result.results[0].oldValueStrings).toEqual(['0.5']);
	expect(result.updatedNodes.map((node) => node.filePath)).toEqual([
		'first.tsx',
		'second.tsx',
		'first.tsx',
	]);
	const updated = applyCodemodChanges(project, result.changes);
	expect(
		getJsxNodeProps({
			project: updated,
			node: result.updatedNodes[0],
			keys: ['style.opacity', 'title'],
		}).props,
	).toMatchObject({
		'style.opacity': {codeValue: undefined},
		title: {codeValue: 'updated first'},
	});
	expect(
		getJsxNodeProps({
			project: updated,
			node: result.updatedNodes[1],
			keys: ['title'],
		}).props.title,
	).toMatchObject({codeValue: 'updated second'});
	expect(project.files['first.tsx']).toContain('opacity: 0.5');
});

test('set composition default props preserves serialized dates and enum assertions', () => {
	const input = `import {Composition} from 'remotion';
const untouched    = "keep this spacing";
export const Root = () => <Composition id="Comp" defaultProps={{mode: 'old'}} />;
`;
	const result = setCompositionDefaultProps({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		compositionFile: 'Root.tsx',
		compositionId: 'Comp',
		defaultProps: {
			mode: 'fast',
			date: 'remotion-date:2026-07-29T00:00:00.000Z',
		},
		enumPaths: [['mode']],
	});
	expect(result.logLine).toBe(3);
	expect(getChangedContents(result, 'Root.tsx')).toContain(
		'const untouched    = "keep this spacing";',
	);
	expect(getChangedContents(result, 'Root.tsx')).toContain(
		"mode: 'fast' as const",
	);
	expect(getChangedContents(result, 'Root.tsx')).toMatch(
		/date: new Date\(\s*'2026-07-29T00:00:00\.000Z',?\s*\)/,
	);
});

test('default prop enum serialization shares node lookup, insertion, and spread protections', () => {
	for (const [imports, tag] of [
		["import {Composition as Comp} from 'remotion';", 'Comp'],
		["import * as R from 'remotion';", 'R.Composition'],
	]) {
		for (const enumPaths of [undefined, [], [['mode']]]) {
			const input = `${imports}\nconst untouched    = 'keep spacing';\nexport const Root = () => <${tag} id={'Target'} />;\n`;
			const original = {rootDir: '/', files: {[compositionFile]: input}};
			const inserted = setCompositionDefaultProps({
				project: original,
				compositionFile,
				compositionId: 'Target',
				defaultProps: {mode: 'fast'},
				enumPaths,
			});
			const afterInsert = applyCodemodChanges(original, inserted.changes);
			const updated = setCompositionDefaultProps({
				project: afterInsert,
				compositionFile,
				compositionId: 'Target',
				defaultProps: {mode: 'slow'},
				enumPaths,
			});
			const afterUpdate = applyCodemodChanges(afterInsert, updated.changes);
			expect(
				getJsxNodeProps({
					project: afterUpdate,
					node: updated.updatedNode,
					keys: ['defaultProps'],
				}).props.defaultProps,
			).toMatchObject({status: 'static', codeValue: {mode: 'slow'}});
			expect(getChangedContents(updated, compositionFile)).toContain(
				"const untouched    = 'keep spacing';",
			);
			if (enumPaths?.length) {
				expect(getChangedContents(updated, compositionFile)).toContain(
					"mode: 'slow' as const",
				);
			}

			expect(original.files[compositionFile]).toBe(input);

			for (const attributes of [
				"defaultProps={{...defaults}} id={'Target'}",
				"{...props} id={'Target'}",
				"defaultProps={{mode: 'old'}} {...props} id={'Target'}",
			]) {
				const unsafeInput = `${imports}\nexport const Root = () => <${tag} ${attributes} />;\n`;
				const project = {rootDir: '/', files: {[compositionFile]: unsafeInput}};
				expect(() =>
					setCompositionDefaultProps({
						project,
						compositionFile,
						compositionId: 'Target',
						defaultProps: {mode: 'fast'},
						enumPaths,
					}),
				).toThrow('computed');
				expect(project.files[compositionFile]).toBe(unsafeInput);
			}
		}
	}
});
