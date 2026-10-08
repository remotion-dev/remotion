import {afterEach, expect, test} from 'bun:test';
import {act, cleanup, render, waitFor} from '@testing-library/react';
import React, {useContext} from 'react';
import {
	CommittedMetadataInternals,
	type CommittedCompositionSnapshot,
	type CommittedMetadata,
} from '../committed-metadata.js';
import {Composition} from '../Composition.js';
import {compositionsRef, type AnyComposition} from '../CompositionManager.js';
import type {CompositionManagerContext} from '../CompositionManagerContext.js';
import {CompositionManager} from '../CompositionManagerContext.js';
import {CompositionManagerProvider} from '../CompositionManagerProvider.js';
import {Folder, type TFolder} from '../Folder.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';

afterEach(() => {
	cleanup();
});

const AnyComp: React.FC = () => null;

test('applies committed composition and folder order', async () => {
	const previousHook = Reflect.get(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__');
	Reflect.set(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
		[CommittedMetadataInternals.installationMarker]: true,
	});
	let context: CompositionManagerContext | null = null;
	const CaptureContext: React.FC = () => {
		context = useContext(CompositionManager);
		return null;
	};

	try {
		const {container} = render(
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

		// ReactDOM has already initialized without this test's DevTools hook.
		// Deliver the committed descriptors at the observer's manager boundary.
		type Fiber = {
			readonly memoizedProps: unknown;
			readonly child: Fiber | null;
			readonly sibling: Fiber | null;
		};
		const key = Object.keys(container).find((name) =>
			name.startsWith('__reactContainer$'),
		);
		if (key === undefined) {
			throw new Error('React did not attach its root to the container.');
		}

		const fiber = Reflect.get(container, key) as {
			readonly stateNode: {readonly current: Fiber};
		};
		const pending = [fiber.stateNode.current];
		const compositions: AnyComposition[] = [];
		const folders: TFolder[] = [];
		let onCommit: ((snapshot: CommittedCompositionSnapshot) => void) | null =
			null;
		while (pending.length > 0) {
			const node = pending.pop()!;
			const metadata =
				typeof node.memoizedProps === 'object' && node.memoizedProps !== null
					? (Reflect.get(
							node.memoizedProps,
							CommittedMetadataInternals.metadataProp,
						) as CommittedMetadata | null | undefined)
					: null;
			if (metadata?.type === 'composition-manager') {
				onCommit = metadata.onCommit;
			} else if (metadata?.type === 'composition') {
				compositions.push(metadata.value);
			} else if (metadata?.type === 'folder') {
				folders.push(metadata.value);
			}

			if (node.sibling !== null) {
				pending.push(node.sibling);
			}

			if (node.child !== null) {
				pending.push(node.child);
			}
		}

		if (onCommit === null) {
			throw new Error('No committed composition registry boundary found.');
		}

		const publish = onCommit;
		await act(() => {
			publish({
				compositions,
				folders,
				orderIds: ['folder:group', 'composition:inside', 'composition:outside'],
			});
			// Renderer reads must see the snapshot before React flushes the update.
			expect(
				compositionsRef.current
					?.getCompositions()
					.map((composition) => [composition.id, composition.order]),
			).toEqual([
				['inside', 1],
				['outside', 2],
			]);
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
		cleanup();
		if (previousHook === undefined) {
			Reflect.deleteProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__');
		} else {
			Reflect.set(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', previousHook);
		}
	}
});
