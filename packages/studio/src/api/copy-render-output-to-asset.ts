import {callApi} from '../components/call-api';

export const copyRenderOutputToAsset = ({
	outputPath,
	assetPath,
}: {
	outputPath: string;
	assetPath: string;
}) => {
	return callApi('/api/copy-render-output-to-asset', {
		outputPath,
		assetPath,
	});
};
