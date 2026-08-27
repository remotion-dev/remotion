import {expect, test} from 'bun:test';
import type {ComponentType} from 'react';
import React from 'react';
import {getZodIfPossible} from '../components/get-zod-if-possible';
import {
	createFolderTree,
	getKeysToExpand,
	sortFolderTreeAlphabetically,
} from '../helpers/create-folder-tree';

const SampleComp: React.FC<{}> = () => null;
const component = React.lazy(() =>
	Promise.resolve({default: SampleComp as ComponentType<unknown>}),
);
const testFolder = (name: string, parent: string | null, nonce = 0) => ({
	name,
	parent,
	nonce: [[0, nonce]] as [[number, number]],
	stack: null,
});

const getZ = async () => {
	const z = await getZodIfPossible();
	if (!z) {
		throw new Error('Zod not found');
	}

	return z;
};

test('Should create a good folder tree with 1 item inside and 1 item outside', async () => {
	const z = await getZ();

	const obj = z.object({});
	const tree = createFolderTree(
		[
			{
				component,
				defaultProps: {},
				durationInFrames: 200,
				folderName: 'my-folder',
				fps: 30,
				height: 1080,
				id: 'my-comp',
				nonce: [[0, 0]],
				width: 1080,
				parentFolderName: null,
				calculateMetadata: null,
				schema: obj,
				stack: null,
			},
			{
				component,
				defaultProps: {},
				durationInFrames: 200,
				folderName: null,
				fps: 30,
				height: 1080,
				id: 'second-comp',
				nonce: [[0, 0]],
				width: 1080,
				parentFolderName: null,
				calculateMetadata: null,
				schema: obj,
				stack: null,
			},
		],
		[testFolder('my-folder', null)],
		{},
	);

	expect(tree).toEqual([
		{
			folder: testFolder('my-folder', null),
			folderName: 'my-folder',
			items: [
				{
					composition: {
						component,
						defaultProps: {},
						durationInFrames: 200,
						folderName: 'my-folder',
						parentFolderName: null,
						fps: 30,
						height: 1080,
						id: 'my-comp',
						nonce: [[0, 0]],
						width: 1080,
						schema: obj,
						calculateMetadata: null,
						stack: null,
					},
					key: 'my-comp',
					type: 'composition',
				},
			],
			expanded: false,
			key: 'my-folder',
			type: 'folder',
			parentName: null,
		},
		{
			composition: {
				component,
				defaultProps: {},
				durationInFrames: 200,
				folderName: null,
				parentFolderName: null,
				fps: 30,
				height: 1080,
				id: 'second-comp',
				nonce: [[0, 0]],
				width: 1080,
				schema: obj,
				calculateMetadata: null,
				stack: null,
			},
			key: 'second-comp',
			type: 'composition',
		},
	]);
});

test('Should handle nested folders well', async () => {
	const z = await getZ();
	const obj = z.object({});

	const tree = createFolderTree(
		[
			{
				component,
				defaultProps: {},
				durationInFrames: 200,
				folderName: 'my-folder',
				fps: 30,
				height: 1080,
				id: 'my-comp',
				nonce: [[0, 0]],
				width: 1080,
				parentFolderName: 'my-third-folder/my-second-folder',
				calculateMetadata: null,
				schema: obj,
				stack: null,
			},
		],
		[
			testFolder('my-second-folder', 'my-third-folder'),
			testFolder('my-third-folder', null),
			testFolder('my-folder', 'my-third-folder/my-second-folder'),
		],
		{},
	);

	expect(tree).toEqual([
		{
			folder: testFolder('my-third-folder', null),
			folderName: 'my-third-folder',
			expanded: false,
			key: 'my-third-folder',
			parentName: null,
			items: [
				{
					type: 'folder',
					folder: testFolder('my-second-folder', 'my-third-folder'),
					expanded: false,
					key: 'my-second-folder',
					folderName: 'my-second-folder',
					parentName: 'my-third-folder',
					items: [
						{
							type: 'folder',
							folder: testFolder(
								'my-folder',
								'my-third-folder/my-second-folder',
							),
							key: 'my-folder',
							folderName: 'my-folder',
							parentName: 'my-third-folder/my-second-folder',
							expanded: false,
							items: [
								{
									composition: {
										calculateMetadata: null,
										component,
										defaultProps: {},
										durationInFrames: 200,
										folderName: 'my-folder',
										parentFolderName: 'my-third-folder/my-second-folder',
										fps: 30,
										height: 1080,
										id: 'my-comp',
										nonce: [[0, 0]],
										width: 1080,
										schema: obj,
										stack: null,
									},
									key: 'my-comp',
									type: 'composition',
								},
							],
						},
					],
				},
			],
			type: 'folder',
		},
	]);
});

test('Should interleave folders and compositions in render order', async () => {
	const z = await getZ();
	const obj = z.object({});
	const composition = {
		component,
		defaultProps: {},
		durationInFrames: 200,
		fps: 30,
		height: 1080,
		width: 1080,
		calculateMetadata: null,
		schema: obj,
		stack: null,
	};

	const tree = createFolderTree(
		[
			{
				...composition,
				id: 'root-before',
				folderName: null,
				parentFolderName: null,
				nonce: [[0, 0]],
			},
			{
				...composition,
				id: 'inside-before',
				folderName: 'group',
				parentFolderName: null,
				nonce: [[0, 2]],
			},
			{
				...composition,
				id: 'inside-nested',
				folderName: 'nested',
				parentFolderName: 'group',
				nonce: [[0, 4]],
			},
			{
				...composition,
				id: 'inside-after',
				folderName: 'group',
				parentFolderName: null,
				nonce: [[0, 5]],
			},
			{
				...composition,
				id: 'root-after',
				folderName: null,
				parentFolderName: null,
				nonce: [[0, 6]],
			},
		],
		[testFolder('group', null, 1), testFolder('nested', 'group', 3)],
		{},
	);

	expect(tree.map((item) => item.key)).toEqual([
		'root-before',
		'group',
		'root-after',
	]);
	const group = tree[1];
	if (group.type !== 'folder') {
		throw new Error('Expected group to be a folder');
	}

	expect(group.items.map((item) => item.key)).toEqual([
		'inside-before',
		'nested',
		'inside-after',
	]);
});

test('getKeysToExpand lists nested folder keys from leaf to root', () => {
	expect(
		getKeysToExpand('my-folder', 'my-third-folder/my-second-folder'),
	).toEqual([
		'my-third-folder/my-second-folder/my-folder',
		'my-third-folder/my-second-folder',
		'no-parent/my-third-folder',
	]);
});

test('getKeysToExpand lists direct child folder and root folder', () => {
	expect(getKeysToExpand('html-in-canvas', 'video-tests')).toEqual([
		'video-tests/html-in-canvas',
		'no-parent/video-tests',
	]);
});

test('Should throw if two folders with the same name', () => {
	expect(() =>
		createFolderTree(
			[],
			[testFolder('my-folder', null), testFolder('my-folder', null)],
			{},
		),
	).toThrow(
		/Multiple folders with the name my-folder exist. Folder names must be unique./,
	);
});

test('sortFolderTreeAlphabetically sorts every level and keeps folders on top', async () => {
	const z = await getZ();
	const obj = z.object({});

	const testComp = (id: string, folderName: string | null) => ({
		component,
		defaultProps: {},
		durationInFrames: 200,
		folderName,
		parentFolderName: null,
		fps: 30,
		height: 1080,
		id,
		nonce: [[0, 0]] as [[number, number]],
		width: 1080,
		calculateMetadata: null,
		schema: obj,
		stack: null,
	});

	const tree = createFolderTree(
		[
			testComp('Zebra', null),
			testComp('Scene10', 'zoo'),
			testComp('Scene2', 'zoo'),
			testComp('Apple', null),
		],
		[testFolder('zoo', null), testFolder('animals', null)],
		{},
	);

	const sorted = sortFolderTreeAlphabetically(tree);

	expect(
		sorted.map((item) =>
			item.type === 'folder' ? item.folderName : item.composition.id,
		),
	).toEqual(['animals', 'zoo', 'Apple', 'Zebra']);

	const zoo = sorted[1];
	if (zoo.type !== 'folder') {
		throw new Error('expected a folder');
	}

	expect(
		zoo.items.map((item) =>
			item.type === 'folder' ? item.folderName : item.composition.id,
		),
	).toEqual(['Scene2', 'Scene10']);
});
