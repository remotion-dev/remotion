import {LogLevel, TracksField} from '@remotion/media-parser';
import {ConvertMediaContainer} from '@remotion/webcodecs';
import {useEffect, useState} from 'react';
import {RouteAction} from '~/seo';
import {getSupportedConfigs, SupportedConfigs} from './get-supported-configs';

export const useSupportedConfigs = ({
	container,
	tracks,
	logLevel,
	action,
	userRotation,
}: {
	container: ConvertMediaContainer;
	tracks: TracksField | null;
	logLevel: LogLevel;
	action: RouteAction;
	userRotation: number;
}) => {
	const [state, setState] = useState<
		Record<ConvertMediaContainer, SupportedConfigs | null>
	>({mp4: null, webm: null, wav: null});

	useEffect(() => {
		if (!tracks) {
			return;
		}

		getSupportedConfigs({
			tracks,
			container,
			bitrate: 128000,
			logLevel,
			action,
			userRotation,
		}).then((supportedConfigs) => {
			setState((prev) => ({
				...prev,
				[container]: supportedConfigs,
			}));
		});
	}, [action, container, logLevel, tracks, userRotation]);

	return state[container];
};
