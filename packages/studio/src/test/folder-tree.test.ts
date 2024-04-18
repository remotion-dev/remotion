import {expect, test} from 'bun:test';
import type {ComponentType} from 'react';
import React from 'react';
import {getZodIfPossible} from '../components/get-zod-if-possible';
import {createFolderTree} from '../helpers/create-folder-tree';

const SampleComp: React.FC<{}> = () => null;
const component = React.lazy(() =>
	Promise.resolve({default: SampleComp as ComponentType<unknown>}),
);

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
				nonce: 0,
				width: 1080,
				parentFolderName: null,
				calculateMetadata: null,
				schema: obj,
			},
			{
				component,
				defaultProps: {},
				durationInFrames: 200,
				folderName: null,
				fps: 30,
				height: 1080,
				id: 'second-comp',
				nonce: 0,
				width: 1080,
				parentFolderName: null,
				calculateMetadata: null,
				schema: obj,
			},
		],
		[
			{
				name: 'my-folder',
				parent: null,
			},
		],
		{},
	);

	expect(tree).toEqual([
		{
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
						nonce: 0,
						width: 1080,
						schema: obj,
						calculateMetadata: null,
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
				nonce: 0,
				width: 1080,
				schema: obj,
				calculateMetadata: null,
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
				nonce: 0,
				width: 1080,
				parentFolderName: 'my-third-folder/my-second-folder',
				calculateMetadata: null,
				schema: obj,
			},
		],
		[
			{
				name: 'my-second-folder',
				parent: 'my-third-folder',
			},
			{
				name: 'my-third-folder',
				parent: null,
			},
			{
				name: 'my-folder',
				parent: 'my-third-folder/my-second-folder',
			},
		],
		{},
	);

	expect(tree).toEqual([
		{
			folderName: 'my-third-folder',
			expanded: false,
			key: 'my-third-folder',
			parentName: null,
			items: [
				{
					type: 'folder',
					expanded: false,
					key: 'my-second-folder',
					folderName: 'my-second-folder',
					parentName: 'my-third-folder',
					items: [
						{
							type: 'folder',
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
										nonce: 0,
										width: 1080,
										schema: obj,
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

test('Should throw if two folders with the same name', () => {
	expect(() =>
		createFolderTree(
			[],
			[
				{
					name: 'my-folder',
					parent: null,
				},
				{
					name: 'my-folder',
					parent: null,
				},
			],
			{},
		),
	).toThrow(
		/Multiple folders with the name my-folder exist. Folder names must be unique./,
	);
});
