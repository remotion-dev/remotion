import {ParseMediaContainer, TracksField} from '@remotion/media-parser';
import {ConvertMediaContainer} from '@remotion/webcodecs';
import {useEffect, useState} from 'react';
import {RouteAction} from '~/seo';
import {getSupportedConfigs, SupportedConfigs} from './get-supported-configs';

export const useSupportedConfigs = ({
	outputContainer,
	tracks,
	action,
	userRotation,
	inputContainer,
}: {
	outputContainer: ConvertMediaContainer;
	tracks: TracksField | null;
	action: RouteAction;
	userRotation: number;
	inputContainer: ParseMediaContainer | null;
}) => {
	const [state, setState] = useState<
		Record<ConvertMediaContainer, SupportedConfigs | null>
	>({mp4: null, webm: null, wav: null});

	useEffect(() => {
		if (!tracks || !inputContainer) {
			return;
		}

		getSupportedConfigs({
			tracks,
			container: outputContainer,
			bitrate: 128000,
			action,
			userRotation,
			inputContainer,
		}).then((supportedConfigs) => {
			setState((prev) => ({
				...prev,
				[outputContainer]: supportedConfigs,
			}));
		});
	}, [action, inputContainer, outputContainer, tracks, userRotation]);

	return state[outputContainer];
};
