import type {MediaParserContainer, TracksField} from '@remotion/media-parser';
import type {ConvertMediaContainer, ResizeOperation} from '@remotion/webcodecs';
import {useEffect, useState} from 'react';
import type {RouteAction} from '~/seo';
import type {SupportedConfigs} from './get-supported-configs';
import {getSupportedConfigs} from './get-supported-configs';

export const useSupportedConfigs = ({
	outputContainer,
	tracks,
	action,
	userRotation,
	inputContainer,
	resizeOperation,
}: {
	outputContainer: ConvertMediaContainer;
	tracks: TracksField | null;
	action: RouteAction;
	userRotation: number;
	resizeOperation: ResizeOperation | null;
	inputContainer: MediaParserContainer | null;
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
			resizeOperation,
		}).then((supportedConfigs) => {
			setState((prev) => ({
				...prev,
				[outputContainer]: supportedConfigs,
			}));
		});
	}, [
		action,
		inputContainer,
		outputContainer,
		tracks,
		userRotation,
		resizeOperation,
	]);

	return state[outputContainer];
};
