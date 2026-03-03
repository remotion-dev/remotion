import {experimental_loadComponentFromUrl, Player} from '@remotion/player';
import React, {useMemo} from 'react';

const remoteModuleCode = `
export default function RemoteTemplate(props) {
  return "Loaded from URL: " + props.label;
}
`;

const remoteModuleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(
	remoteModuleCode,
)}`;

export const RemoteUrlPlayerExample: React.FC = () => {
	const lazyComponent = useMemo(() => {
		return experimental_loadComponentFromUrl<{label: string}>({
			url: remoteModuleUrl,
		});
	}, []);

	return (
		<Player
			lazyComponent={lazyComponent}
			compositionWidth={1280}
			compositionHeight={720}
			durationInFrames={120}
			fps={30}
			acknowledgeRemotionLicense
			controls
			inputProps={{
				label: 'Hello from remote module',
			}}
			style={{
				width: 500,
			}}
		/>
	);
};
