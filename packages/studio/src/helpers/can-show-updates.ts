import type {PreviewServerConnectionState} from './preview-server-events';

export const canShowUpdates = ({
	connectionStatus,
	isBrowserStudio,
	readOnlyStudio,
}: {
	readonly connectionStatus: PreviewServerConnectionState['type'];
	readonly isBrowserStudio: boolean;
	readonly readOnlyStudio: boolean;
}) => {
	return (
		connectionStatus === 'connected' && !isBrowserStudio && !readOnlyStudio
	);
};
