import {fromIni} from '@aws-sdk/credential-providers';
import {getEnvVariable} from './get-env-variable';
import {isInsideLambda} from './is-in-lambda';

type CredentialPair = {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
};
type AwsCredentialIdentityProvider = ReturnType<typeof fromIni>;

export const getCredentials = ():
	| CredentialPair
	| AwsCredentialIdentityProvider
	| undefined => {
	if (isInsideLambda()) {
		return undefined;
	}

	if (getEnvVariable('REMOTION_AWS_PROFILE')) {
		return fromIni({
			profile: getEnvVariable('REMOTION_AWS_PROFILE'),
		});
	}

	if (
		getEnvVariable('REMOTION_AWS_ACCESS_KEY_ID') &&
		getEnvVariable('REMOTION_AWS_SECRET_ACCESS_KEY') &&
		getEnvVariable('REMOTION_AWS_SESSION_TOKEN')
	) {
		return {
			accessKeyId: getEnvVariable('REMOTION_AWS_ACCESS_KEY_ID') as string,
			secretAccessKey: getEnvVariable(
				'REMOTION_AWS_SECRET_ACCESS_KEY',
			) as string,
			sessionToken: getEnvVariable('REMOTION_AWS_SESSION_TOKEN') as string,
		};
	}

	if (
		getEnvVariable('REMOTION_AWS_ACCESS_KEY_ID') &&
		getEnvVariable('REMOTION_AWS_SECRET_ACCESS_KEY')
	) {
		return {
			accessKeyId: getEnvVariable('REMOTION_AWS_ACCESS_KEY_ID') as string,
			secretAccessKey: getEnvVariable(
				'REMOTION_AWS_SECRET_ACCESS_KEY',
			) as string,
		};
	}

	if (getEnvVariable('AWS_PROFILE')) {
		return fromIni({
			profile: getEnvVariable('AWS_PROFILE'),
		});
	}

	if (
		getEnvVariable('AWS_ACCESS_KEY_ID') &&
		getEnvVariable('AWS_SECRET_ACCESS_KEY') &&
		getEnvVariable('AWS_SESSION_TOKEN')
	) {
		return {
			accessKeyId: getEnvVariable('AWS_ACCESS_KEY_ID') as string,
			secretAccessKey: getEnvVariable('AWS_SECRET_ACCESS_KEY') as string,
			sessionToken: getEnvVariable('AWS_SESSION_TOKEN') as string,
		};
	}

	if (
		getEnvVariable('AWS_ACCESS_KEY_ID') &&
		getEnvVariable('AWS_SECRET_ACCESS_KEY')
	) {
		return {
			accessKeyId: getEnvVariable('AWS_ACCESS_KEY_ID') as string,
			secretAccessKey: getEnvVariable('AWS_SECRET_ACCESS_KEY') as string,
		};
	}

	return undefined;
};
