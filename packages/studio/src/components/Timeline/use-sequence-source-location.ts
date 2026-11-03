import {useCallback, useContext, useMemo, useSyncExternalStore} from 'react';
import {
	Internals,
	type SequencePropsSubscriptionKey,
	type TSequence,
} from 'remotion';
import {normalizeSourceFileName} from '../../helpers/rebase-source-request';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';

const getNoStack = () => null;

export const useSequenceSourceLocation = (
	sequence: TSequence | null,
	nodePath: SequencePropsSubscriptionKey | null,
) => {
	const {resolvedLocation, stack} = useResolveStackAndReactToChange(
		sequence?.getStack ?? getNoStack,
		sequence?.controls?.overrideId ?? sequence?.id ?? 'no-selection',
	);
	const store = useContext(Internals.VisualModePropStatusesSubscriptionContext);
	const source = resolvedLocation?.source ?? null;
	const key = useMemo(() => {
		if (!source || !nodePath || window.remotion_isReadOnlyStudio) return null;
		const root = window.remotion_cwd ?? '';
		return normalizeSourceFileName(source, root) ===
			normalizeSourceFileName(nodePath.absolutePath, root)
			? Internals.makeSequencePropsSubscriptionKey(nodePath)
			: null;
	}, [source, nodePath]);
	const subscribe = useCallback(
		(listener: () => void) => store.subscribe(key, listener),
		[key, store],
	);
	const snapshot = useCallback(() => {
		const status = store.getSnapshot(key);
		return status?.canUpdate ? (status.sourceLocation ?? null) : null;
	}, [key, store]);
	const authored = useSyncExternalStore(subscribe, snapshot, snapshot);
	const line = authored?.line;
	const column = authored?.column;
	const location = useMemo(() => {
		if (!source || line === undefined || column === undefined) {
			return resolvedLocation;
		}

		return {source, line, column};
	}, [resolvedLocation, source, line, column]);

	return {location, stack};
};
