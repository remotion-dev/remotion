import {getIsCli} from '../cli/is-cli';
import {DOCS_URL} from './docs-url';
import {truthy} from './truthy';

const messageForVariable = (variable: string) => {
	return [
		`You have tried to call a Remotion Lambda function, but have not set the environment variable ${variable}.`,
		getIsCli()
			? null
			: `- Environment variables from a '.env' file are not automatically read if you are calling the Node.JS APIs, in that case you need to load the file yourself or set the environment variables manually.`,
		`- Please refer to the Remotion Lambda docs (${DOCS_URL}/docs/lambda/setup) to see how to generate the credentials for your AWS account and then set the environment variables.`,
		`- For more reasons see the troubleshooting page: ${DOCS_URL}/docs/lambda/troubleshooting/permissions`,
	]
		.filter(truthy)
		.join('\n');
};

export const checkCredentials = () => {
	if (
		!process.env.AWS_ACCESS_KEY_ID &&
		!process.env.REMOTION_AWS_ACCESS_KEY_ID
	) {
		throw new Error(
			messageForVariable('AWS_ACCESS_KEY_ID or REMOTION_AWS_ACCESS_KEY_ID')
		);
	}

	if (
		!process.env.AWS_SECRET_ACCESS_KEY &&
		!process.env.REMOTION_AWS_SECRET_ACCESS_KEY
	) {
		throw new Error(
			messageForVariable(
				'AWS_SECRET_ACCESS_KEY or REMOTION_AWS_SECRET_ACCESS_KEY'
			)
		);
	}
};
