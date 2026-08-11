import type {OutputFormat} from 'mediabunny';
import {type InputFormat, type InputTrack} from 'mediabunny';
import {useEffect, useMemo, useState} from 'react';
import type {MediabunnyResize} from '~/lib/mediabunny-calculate-resize-option';
import {getMediabunnyOutput} from '~/lib/output-container';
import type {OutputContainer, RouteAction} from '~/seo';
import type {SupportedConfigs} from './get-supported-configs';
import {getSupportedConfigs} from './get-supported-configs';

export const useSupportedConfigs = ({
	outputContainer,
	tracks,
	action,
	userRotation,
	inputContainer,
	resizeOperation,
	sampleRate,
	disableVideoCopy,
}: {
	outputContainer: OutputContainer;
	tracks: InputTrack[] | null;
	action: RouteAction;
	userRotation: number;
	resizeOperation: MediabunnyResize | null;
	inputContainer: InputFormat | null;
	sampleRate: number | null;
	disableVideoCopy: boolean;
}) => {
	const [state, setState] = useState<
		Record<OutputFormat['mimeType'], SupportedConfigs | null | undefined>
	>({});

	const outputFormat = useMemo(() => {
		return getMediabunnyOutput(outputContainer);
	}, [outputContainer]);

	useEffect(() => {
		if (!tracks || !inputContainer) {
			return;
		}

		getSupportedConfigs({
			tracks,
			container: outputFormat,
			action,
			userRotation,
			resizeOperation,
			sampleRate,
			disableVideoCopy,
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
		outputFormat,
		resizeOperation,
		tracks,
		userRotation,
		sampleRate,
		disableVideoCopy,
	]);

	const cachedSupportedConfigs = state[outputContainer] ?? null;

	return useMemo(() => {
		if (!disableVideoCopy || cachedSupportedConfigs === null) {
			return cachedSupportedConfigs;
		}

		return {
			...cachedSupportedConfigs,
			videoTrackOptions: cachedSupportedConfigs.videoTrackOptions.map(
				(track) => {
					return {
						...track,
						operations: track.operations.filter((operation) => {
							return operation.type !== 'copy';
						}),
					};
				},
			),
		};
	}, [cachedSupportedConfigs, disableVideoCopy]);
};
