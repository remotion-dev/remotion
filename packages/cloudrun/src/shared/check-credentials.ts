import {isInCloudTask} from '../functions/helpers/is-in-cloud-task';
import {DOCS_URL} from './docs-url';
import {getIsCli} from './is-cli';

export const checkCredentials = () => {
	if (isInCloudTask()) {
		return;
	}

	for (const variable of [
		'REMOTION_GCP_PROJECT_ID',
		'REMOTION_GCP_CLIENT_EMAIL',
		'REMOTION_GCP_PRIVATE_KEY',
	]) {
		if (!process.env[variable]) {
			throw new Error(
				[
					`You have tried to call a Remotion Cloud Run function, but have not set the environment variable ${variable}.`,
					getIsCli()
						? null
						: `- Environment variables from a '.env' file are not automatically read if you are calling the Node.JS APIs, in that case you need to load the file yourself or set the environment variables manually.`,
					`- Please refer to the Remotion Cloud Run docs (${DOCS_URL}/docs/cloudrun/setup) to see how to generate the credentials for your GCP account and then set the environment variables.`,
					`- To generate a new '.env' file, see: ${DOCS_URL}/docs/cloudrun/generate-env`,
				]
					.filter(Boolean)
					.join('\n'),
			);
		}
	}
};
