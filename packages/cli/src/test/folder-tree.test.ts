import React, {ComponentType} from 'react';
import {createFolderTree} from '../editor/helpers/create-folder-tree';

const SampleComp: React.FC<{}> = () => null;
const component = React.lazy(() =>
	Promise.resolve({default: SampleComp as ComponentType<unknown>})
);

test('Should create a good folder tree with 1 item inside and 1 item outside', () => {
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
			},
		],
		[
			{
				name: 'my-folder',
				parent: null,
			},
		],
		{}
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
						fps: 30,
						height: 1080,
						id: 'my-comp',
						nonce: 0,
						width: 1080,
					},
					key: 'my-comp',
					type: 'composition',
				},
			],
			expanded: false,

			key: 'my-folder',
			type: 'folder',
		},
		{
			composition: {
				component,
				defaultProps: {},
				durationInFrames: 200,
				folderName: null,
				fps: 30,
				height: 1080,
				id: 'second-comp',
				nonce: 0,
				width: 1080,
			},
			key: 'second-comp',
			type: 'composition',
		},
	]);
});

test('Should handle nested folders well', () => {
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
				parent: 'my-second-folder',
			},
		],
		{}
	);

	expect(tree).toEqual([
		{
			folderName: 'my-third-folder',
			expanded: false,
			key: 'my-third-folder',
			items: [
				{
					type: 'folder',
					expanded: false,
					key: 'my-second-folder',
					folderName: 'my-second-folder',
					items: [
						{
							type: 'folder',
							key: 'my-folder',
							folderName: 'my-folder',
							expanded: false,
							items: [
								{
									composition: {
										component,
										defaultProps: {},
										durationInFrames: 200,
										folderName: 'my-folder',
										fps: 30,
										height: 1080,
										id: 'my-comp',
										nonce: 0,
										width: 1080,
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
