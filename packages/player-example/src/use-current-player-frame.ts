import {CallbackListener, PlayerRef} from '@remotion/player';
import React, {useSyncExternalStore} from 'react';

export const useCurrentPlayerFrame = (ref: React.RefObject<PlayerRef>) => {
	const {current} = ref;

	const data = useSyncExternalStore<number>(
		(onStoreChange: (newVal: number) => void) => {
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
		() => ref.current?.getCurrentFrame() ?? 0,
		() => 0
	);

	return data;
};
