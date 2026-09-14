import type {ApiHandler} from '../api-types';
import {signalShutdown} from '../close-and-restart';

export const handleShutdownStudio: ApiHandler<{}, {}> = ({response}) => {
	// Flush the acknowledgement before closing the HTTP and live-event connections.
	response.once('finish', signalShutdown);
	return Promise.resolve({});
};
