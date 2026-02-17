import {Button} from '@remotion/design';
import React, {useCallback, useState} from 'react';
import {ReplayIcon} from './ReplayIcon';

export const ReplayButton: React.FC<{
	readonly onReplay: () => void;
}> = ({onReplay}) => {
	const [rotation, setRotation] = useState(0);

	const handleClick = useCallback(() => {
		setRotation((prev) => prev + 360);
		onReplay();
	}, [onReplay]);

	return (
		<Button
			type="button"
			depth={0.7}
			onClick={handleClick}
			className="rounded-full w-10 h-10"
		>
			<div
				style={{
					transform: `rotate(${rotation}deg)`,
					transition: 'transform 0.3s ease-out',
				}}
			>
				<ReplayIcon />
			</div>
		</Button>
	);
};
