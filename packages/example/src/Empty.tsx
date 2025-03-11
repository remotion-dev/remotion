import {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	useCurrentFrame,
} from 'remotion';

export const Empty = () => {
	const frame = useCurrentFrame();
	const [handle] = useState(() => delayRender('Test Delay Render'));

	useEffect(() => {
		setTimeout(() => {
			continueRender(handle);
		}, 3000);
	}, [handle]);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'black',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				color: 'white',
				fontSize: '72px',
				fontWeight: 'bold',
			}}
		>
			{frame}
		</AbsoluteFill>
	);
};
