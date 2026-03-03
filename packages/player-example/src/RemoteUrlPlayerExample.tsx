import {
	experimental_loadComponentFromUrl,
	Player,
	type ErrorFallback,
} from '@remotion/player';
import React, {useEffect, useMemo, useState} from 'react';

export const RemoteUrlPlayerExample: React.FC = () => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const lazyComponent = useMemo(() => {
		return experimental_loadComponentFromUrl<{label: string}>({
			url: '/remote-component.js',
		});
	}, []);

	if (!isMounted) {
		return <div>Loading remote player...</div>;
	}

	const errorFallback: ErrorFallback = ({error}) => {
		return (
			<div
				style={{
					padding: 16,
					backgroundColor: '#fee',
					color: '#700',
					fontFamily: 'sans-serif',
				}}
			>
				Remote URL player failed: {error.message}
			</div>
		);
	};

	return (
		<Player
			lazyComponent={lazyComponent}
			compositionWidth={160}
			compositionHeight={90}
			durationInFrames={1}
			fps={30}
			acknowledgeRemotionLicense
			errorFallback={errorFallback}
			renderLoading={() => <div>Loading remote URL module...</div>}
			inputProps={{
				label: 'Hello from remote module',
			}}
			style={{
				width: 640,
				height: 360,
				border: '1px solid #ccc',
			}}
		/>
	);
};
