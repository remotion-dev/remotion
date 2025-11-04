import {Switch} from '@remotion/design';
import React, {useCallback} from 'react';

export const ConvertUiSection: React.FC<{
	readonly children: React.ReactNode;
	readonly active: boolean;
	readonly setActive: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({children, active, setActive}) => {
	const onToggle = useCallback(() => {
		setActive((e) => !e);
	}, [setActive]);

	return (
		<div className="flex flex-row items-center">
			<Switch active={active} onToggle={onToggle} />
			<div className="w-2" />
			<div className="font-semibold tracking-tight text-ellipsis font-brand overflow-x-hidden text-xl">
				{children}
			</div>
		</div>
	);
};
