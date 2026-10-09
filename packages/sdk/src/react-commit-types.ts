import type {ComponentProps} from 'react';
import {Internals} from 'remotion';
export type Fiber = {
	readonly child: Fiber | null;
	readonly memoizedProps: unknown;
	readonly sibling: Fiber | null;
	readonly tag: number | null;
	readonly stateNode: unknown;
	readonly memoizedState: unknown;
};

export type FiberRoot = {
	readonly current: Fiber;
};

type DevToolsHook = {
	readonly supportsFiber?: boolean;
	onCommitFiberRoot?: (
		this: DevToolsHook,
		rendererId: number,
		root: FiberRoot,
		priorityLevel: unknown,
		didError: boolean,
	) => unknown;
	[key: symbol]: unknown;
};

export type HookTarget = Window &
	typeof globalThis & {
		__REACT_DEVTOOLS_GLOBAL_HOOK__?: DevToolsHook;
	};

const {metadataProp} = Internals.CommittedMetadataInternals;

export type CommittedMetadata = NonNullable<
	ComponentProps<
		typeof Internals.CommittedMetadataProvider
	>[typeof metadataProp]
>;

export const getCommittedMetadata = (
	props: unknown,
): CommittedMetadata | null => {
	if (typeof props !== 'object' || props === null) {
		return null;
	}

	const metadata: unknown = Reflect.get(props, metadataProp);
	return typeof metadata === 'object' && metadata !== null
		? (metadata as CommittedMetadata)
		: null;
};
