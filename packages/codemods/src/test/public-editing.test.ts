import {expect, test} from 'bun:test';
import {
	addComponent,
	addComposition,
	addEffect,
	addFolder,
	addMedia,
	addSolid,
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
	unwrapFolder,
	updateCompositionMetadata,
	updateEffectKeyframes,
	updateEffectProps,
	updateJsxNodeKeyframes,
	updateJsxNodeProps,
	updateMultipleJsxNodeProps,
	type CodemodProject,
} from '../index';

const compositionFile = 'src/Root.tsx';
const filePath = 'src/Video.tsx';
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
	expect(changed.project.entryPoint).toBe(project.entryPoint);
	expect(project.files[filePath]).toContain('Hello');
	expect(changed.project.files[filePath]).toContain('Goodbye');
	expect(changed.project.files[filePath]).toContain(
		'const unrelated  =  {value:"keep"};',
	);
	const animated = await updateJsxNodeKeyframes({
		project: changed.project,
		node: changed.updatedNode,
		updates: [
			{key: 'style.opacity', operation: {type: 'add', frame: 0, value: 0}},
			{key: 'style.opacity', operation: {type: 'add', frame: 30, value: 1}},
		],
	});
	expect(animated.project.files[filePath]).toContain('useCurrentFrame');
	expect(
		animated.nodePathRemappings.some(
			(entry) =>
				JSON.stringify(entry.oldNodePath) === JSON.stringify(node.nodePath),
		),
	).toBe(true);
	expect(
		getJsxNodeProps({
			project: animated.project,
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
		project: animated.project,
		node: animated.updatedNode,
		props: {title: undefined},
	});
	expect(withoutTitle.project.files[filePath]).not.toContain('title=');
	const deleted = await deleteJsxNodes({
		project: withoutTitle.project,
		nodes: [withoutTitle.updatedNode],
	});
	expect(
		getJsxNodes({project: deleted.project, filePath}).map(
			(entry) => entry.tagName,
		),
	).toEqual(['AbsoluteFill']);
	expect(
		deleted.nodePathRemappings.some((entry) => entry.newNodePath === null),
	).toBe(true);
});

test('insert media and components, reorder copies, and delete nodes across files', async () => {
	const project = makeProject();
	const media = await addMedia({
		project,
		compositionFile,
		compositionId: 'Demo',
		type: 'image',
		src: 'photo.png',
		srcType: 'static',
		from: 10,
		durationInFrames: 30,
		dimensions: {width: 100, height: 100},
	});
	expect(media.project.files[filePath]).toMatch(
		/staticFile\(["']photo\.png["']\)/,
	);
	expect(
		getJsxNodeProps({
			project: media.project,
			node: media.insertedNode,
			keys: ['from'],
		}).props.from,
	).toMatchObject({codeValue: 10});
	const added = await addComponent({
		project: media.project,
		compositionFile,
		compositionId: 'Demo',
		importName: 'Title',
		importPath: './Title',
		props: {text: 'A title'},
	});
	expect(added.project.files[filePath]).toContain("from './Title'");
	const duplicated = await duplicateJsxNodes({
		project: added.project,
		nodes: [
			added.insertedNode,
			findNode(added.project, 'div', 'src/Title.tsx'),
		],
	});
	expect(duplicated.insertedNodes).toHaveLength(2);
	expect(duplicated.changes.map((change) => change.filePath)).toEqual([
		filePath,
		'src/Title.tsx',
	]);
	const copiedTitle = duplicated.insertedNodes.find(
		(node) => node.filePath === filePath,
	)!;
	const reordered = await reorderJsxNode({
		project: duplicated.project,
		node: copiedTitle,
		target: added.insertedNode,
		position: 'before',
	});
	const updatedCopy = updateJsxNodeProps({
		project: reordered.project,
		node: reordered.updatedNode,
		props: {text: 'Copied title'},
	});
	expect(
		updatedCopy.project.files[filePath].indexOf('Copied title'),
	).toBeLessThan(updatedCopy.project.files[filePath].indexOf('A title'));
	const deleted = await deleteJsxNodes({
		project: updatedCopy.project,
		nodes: [
			updatedCopy.updatedNode,
			duplicated.insertedNodes.find(
				(node) => node.filePath === 'src/Title.tsx',
			)!,
		],
	});
	expect(
		getJsxNodes({project: deleted.project, filePath}).filter(
			(node) => node.tagName === 'Title',
		),
	).toHaveLength(1);
	expect(deleted.project.files['src/Title.tsx']).toContain('{text}');
	expect(Object.keys(deleted.project.files)).toEqual(
		Object.keys(project.files),
	);
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
	expect(
		getJsxNodeProps({
			project: split.project,
			node: secondVideo,
			keys: ['from', 'durationInFrames', 'trimBefore'],
		}).props,
	).toMatchObject({
		from: {codeValue: 40},
		durationInFrames: {codeValue: 50},
		trimBefore: {codeValue: 35},
	});
	const detached = await detachAudio({
		project: split.project,
		node: secondVideo,
	});
	expect(
		getJsxNodeProps({
			project: detached.project,
			node: detached.updatedNode,
			keys: ['muted'],
		}).props.muted,
	).toMatchObject({codeValue: true});
	expect(
		getJsxNodeProps({
			project: detached.project,
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
	let {project} = addComposition({
		project: original,
		compositionFile,
		compositionId: 'Second',
		component: {importName: 'Title', importPath: './Title'},
		metadata: {width: 1920, height: 1080, fps: 30, durationInFrames: 60},
	});
	expect(project.files[compositionFile]).toContain(helper);
	project = setCompositionDefaultProps({
		project,
		compositionFile,
		compositionId: 'Second',
		defaultProps: {text: 'Title'},
	}).project;
	project = duplicateComposition({
		project,
		compositionFile,
		compositionId: 'Second',
		newId: 'Portrait',
		metadata: {width: 1080, height: 1920},
	}).project;
	project = renameComposition({
		project,
		compositionFile,
		compositionId: 'Portrait',
		newId: 'Vertical',
	}).project;
	project = updateCompositionMetadata({
		project,
		compositionFile,
		compositionId: 'Vertical',
		metadata: {fps: 60, durationInFrames: 120},
	}).project;
	project = addFolder({
		project,
		compositionFile,
		folder: {name: 'Social', parentName: null},
	}).project;
	project = addFolder({
		project,
		compositionFile,
		folder: {name: 'Archive', parentName: 'Social'},
	}).project;
	project = moveComposition({
		project,
		compositionFile,
		compositionId: 'Vertical',
		destination: {
			type: 'folder',
			folder: {name: 'Archive', parentName: 'Social'},
		},
	}).project;
	project = renameFolder({
		project,
		compositionFile,
		folder: {name: 'Archive', parentName: 'Social'},
		newName: 'Published',
	}).project;
	project = moveFolder({
		project,
		compositionFile,
		folder: {name: 'Published', parentName: 'Social'},
		destination: {type: 'root'},
	}).project;
	project = moveFolder({
		project,
		compositionFile,
		folder: {name: 'Published', parentName: null},
		destination: {type: 'folder', folder: {name: 'Social', parentName: null}},
	}).project;
	project = unwrapFolder({
		project,
		compositionFile,
		folder: {name: 'Social', parentName: null},
	}).project;
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
	project = deleteComposition({
		project,
		compositionFile,
		compositionId: 'Second',
	}).project;
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
	const second = await addEffect({
		project: first.project,
		node: first.insertedEffect,
		importName: 'brightness',
		importPath: '@remotion/effects/brightness',
		props: {amount: 1},
	});
	const duplicate = await duplicateEffects({
		project: second.project,
		effects: [first.insertedEffect, second.insertedEffect],
	});
	expect(duplicate.insertedEffects.map((effect) => effect.effectIndex)).toEqual(
		[1, 3],
	);
	const reordered = await reorderEffect({
		project: duplicate.project,
		effect: duplicate.insertedEffects[1],
		toIndex: 0,
	});
	const edited = await updateEffectProps({
		project: reordered.project,
		effect: reordered.updatedEffect,
		props: {amount: 2},
	});
	const animated = await updateEffectKeyframes({
		project: edited.project,
		effect: edited.updatedEffect,
		updates: [
			{key: 'amount', operation: {type: 'add', frame: 0, value: 1}},
			{key: 'amount', operation: {type: 'add', frame: 30, value: 2}},
		],
	});
	const status = getJsxNodeProps({
		project: animated.project,
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
		project: animated.project,
		effects: [
			animated.updatedEffect,
			{...animated.updatedEffect, effectIndex: 3},
		],
	});
	expect(
		getJsxNodeProps({
			project: deleted.project,
			node: animated.updatedEffect,
			keys: [],
			effectKeys: [['radius'], ['radius']],
		}).effects.map((effect) => (effect.canUpdate ? effect.callee : null)),
	).toEqual(['blur', 'blur']);
	expect(deleted.project.files[filePath]).toContain(
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

test('existing addSolid returns remappings usable by public discovery', () => {
	const project = makeProject();
	const inserted = addSolid({
		project,
		compositionFile,
		compositionId: 'Demo',
		width: 100,
		height: 100,
		from: 15,
	});
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
			project: inserted.project,
			node: inserted.insertedNode,
			keys: ['from'],
		}).props.from,
	).toMatchObject({status: 'static', codeValue: 15});
});

test('nested copies return root references and insertion preserves relative keys under a project root', async () => {
	const original = {...makeProject(), rootDir: '/project'};
	const media = await addMedia({
		project: original,
		compositionFile,
		compositionId: 'Demo',
		type: 'video',
		src: 'https://example.com/video.mp4',
		srcType: 'remote',
		from: 0,
		durationInFrames: 60,
	});
	expect(media.insertedNode.filePath).toBe(filePath);
	expect(Object.keys(media.project.files)).toEqual(Object.keys(original.files));
	const copy = await duplicateJsxNodes({
		project: media.project,
		nodes: [media.insertedNode],
	});
	expect(copy.insertedNodes).toHaveLength(1);
	expect(
		copy.nodePathRemappings.filter((entry) => entry.oldNodePath === null),
	).toHaveLength(2);
	const split = await splitSequences({
		project: copy.project,
		splits: [{node: copy.insertedNodes[0], frame: 30}],
	});
	expect(split.insertedNodes).toHaveLength(1);
	const deleted = await deleteJsxNodes({
		project: split.project,
		nodes: split.insertedNodes,
	});
	expect(
		getJsxNodes({project: deleted.project, filePath}).filter(
			(node) => node.tagName === 'Sequence',
		),
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
	expect(edited.project.files[filePath]).toContain('opacity: 0.25');
	expect(edited.project.files[filePath].startsWith('\uFEFF')).toBe(true);
	expect(edited.project.files[filePath]).toContain('\r\n');
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
	expect(
		getJsxNodeProps({
			project: result.project,
			node: result.updatedNodes[0],
			keys: ['style.opacity', 'title'],
		}).props,
	).toMatchObject({
		'style.opacity': {codeValue: undefined},
		title: {codeValue: 'updated first'},
	});
	expect(
		getJsxNodeProps({
			project: result.project,
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
	expect(result.project.files['Root.tsx']).toContain(
		'const untouched    = "keep this spacing";',
	);
	expect(result.project.files['Root.tsx']).toContain("mode: 'fast' as const");
	expect(result.project.files['Root.tsx']).toMatch(
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
			const updated = setCompositionDefaultProps({
				project: inserted.project,
				compositionFile,
				compositionId: 'Target',
				defaultProps: {mode: 'slow'},
				enumPaths,
			});
			expect(
				getJsxNodeProps({
					project: updated.project,
					node: updated.updatedNode,
					keys: ['defaultProps'],
				}).props.defaultProps,
			).toMatchObject({status: 'static', codeValue: {mode: 'slow'}});
			expect(updated.project.files[compositionFile]).toContain(
				"const untouched    = 'keep spacing';",
			);
			if (enumPaths?.length) {
				expect(updated.project.files[compositionFile]).toContain(
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
