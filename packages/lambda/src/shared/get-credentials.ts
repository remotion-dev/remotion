import {fromIni} from '@aws-sdk/credential-providers';
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

	if (process.env.REMOTION_AWS_PROFILE) {
		return fromIni({
			profile: process.env.REMOTION_AWS_PROFILE,
		});
	}

	if (
		process.env.REMOTION_AWS_ACCESS_KEY_ID &&
		process.env.REMOTION_AWS_SECRET_ACCESS_KEY &&
		process.env.REMOTION_AWS_SESSION_TOKEN
	) {
		return {
			accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY,
			sessionToken: process.env.REMOTION_AWS_SESSION_TOKEN,
		};
	}

	if (
		process.env.REMOTION_AWS_ACCESS_KEY_ID &&
		process.env.REMOTION_AWS_SECRET_ACCESS_KEY
	) {
		return {
			accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY,
		};
	}

	if (process.env.AWS_PROFILE) {
		return fromIni({
			profile: process.env.AWS_PROFILE,
		});
	}

	if (
		process.env.AWS_ACCESS_KEY_ID &&
		process.env.AWS_SECRET_ACCESS_KEY &&
		process.env.AWS_SESSION_TOKEN
	) {
		return {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
			sessionToken: process.env.AWS_SESSION_TOKEN as string,
		};
	}

	if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
		return {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
		};
	}

	return undefined;
};
