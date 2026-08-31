import {afterEach, expect, spyOn, test} from 'bun:test';
import {act, cleanup, render, waitFor} from '@testing-library/react';
import React, {useContext} from 'react';
import {Composition} from '../Composition.js';
import type {CompositionManagerContext} from '../CompositionManagerContext.js';
import {CompositionManager} from '../CompositionManagerContext.js';
import {CompositionManagerProvider} from '../CompositionManagerProvider.js';
import {Folder} from '../Folder.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {
	COMMIT_ORDER_EVENT,
	type CommitOrderEventDetail,
} from '../sequence-order-marker.js';

afterEach(() => {
	cleanup();
});

const AnyComp: React.FC = () => null;

test('applies committed composition and folder order', async () => {
	const random = spyOn(Math, 'random').mockReturnValue(0.5);
	let context: CompositionManagerContext | null = null;
	const CaptureContext: React.FC = () => {
		context = useContext(CompositionManager);
		return null;
	};

	try {
		render(
			<RemotionEnvironmentContext.Provider
				value={{
					isClientSideRendering: false,
					isPlayer: false,
					isReadOnlyStudio: false,
					isRendering: false,
					isStudio: true,
				}}
			>
				<CompositionManagerProvider
					currentCompositionMetadata={null}
					initialCanvasContent={null}
					initialCompositions={[]}
					onlyRenderComposition={null}
				>
					<Folder name="group">
						<Composition
							component={AnyComp}
							durationInFrames={100}
							fps={30}
							height={100}
							id="inside"
							width={100}
						/>
					</Folder>
					<Composition
						component={AnyComp}
						durationInFrames={100}
						fps={30}
						height={100}
						id="outside"
						width={100}
					/>
					<CaptureContext />
				</CompositionManagerProvider>
			</RemotionEnvironmentContext.Provider>,
		);

		await waitFor(() => {
			expect(context?.compositions).toHaveLength(2);
			expect(context?.folders).toHaveLength(1);
		});

		const detail: CommitOrderEventDetail = {
			sequenceManagers: [],
			compositionManagers: [
				{
					managerId: '0.5',
					compositionAndFolderOrder: [
						{type: 'folder', id: 'group'},
						{type: 'composition', id: 'inside'},
						{type: 'composition', id: 'outside'},
					],
				},
			],
		};
		act(() => {
			window.dispatchEvent(new CustomEvent(COMMIT_ORDER_EVENT, {detail}));
		});

		await waitFor(() => {
			expect(
				context?.compositions.map((composition) => [
					composition.id,
					composition.order,
				]),
			).toEqual([
				['inside', 1],
				['outside', 2],
			]);
			expect(
				context?.folders.map((folder) => [folder.name, folder.order]),
			).toEqual([['group', 0]]);
		});
	} finally {
		random.mockRestore();
	}
});
