import {CallbackListener, PlayerRef} from '@remotion/player';
import {useCallback, useSyncExternalStore} from 'react';

export const useCurrentPlayerFrame = (
	ref: React.RefObject<PlayerRef | null>,
) => {
	const subscribe = useCallback(
		(onStoreChange: (newVal: number) => void) => {
			const {current} = ref;
			if (!current) {
				return () => undefined;
			}
			const updater: CallbackListener<'frameupdate'> = ({detail}) => {
				onStoreChange(detail.frame);
			};
			current.addEventListener('frameupdate', updater);
			return () => {
				current.removeEventListener('frameupdate', updater);
			};
		},
		[ref],
	);

	const data = useSyncExternalStore<number>(
		subscribe,
		() => ref.current?.getCurrentFrame() ?? 0,
		() => 0,
	);

	return data;
};
