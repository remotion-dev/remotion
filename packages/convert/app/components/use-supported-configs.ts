import {TracksField} from '@remotion/media-parser';
import {ConvertMediaContainer} from '@remotion/webcodecs';
import {useEffect, useState} from 'react';
import {RouteAction} from '~/seo';
import {getSupportedConfigs, SupportedConfigs} from './get-supported-configs';

export const useSupportedConfigs = ({
	container,
	tracks,
	action,
	userRotation,
}: {
	container: ConvertMediaContainer;
	tracks: TracksField | null;
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
			action,
			userRotation,
		}).then((supportedConfigs) => {
			setState((prev) => ({
				...prev,
				[container]: supportedConfigs,
			}));
		});
	}, [action, container, tracks, userRotation]);

	return state[container];
};
