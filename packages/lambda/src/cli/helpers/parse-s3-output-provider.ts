import type {CustomCredentials, OutNameInput} from '@remotion/serverless';
import type {AwsProvider} from '../../client';

const validateString = ({
	value,
	field,
	required,
}: {
	value: unknown;
	field: string;
	required: boolean;
}) => {
	if (typeof value === 'string') {
		return value;
	}

	if (!required && (value === null || typeof value === 'undefined')) {
		return null;
	}

	throw new TypeError(
		`Expected --s3-output-provider.${field} to be a string, but got ${typeof value}.`,
	);
};

const validateBoolean = ({value, field}: {value: unknown; field: string}) => {
	if (typeof value === 'undefined') {
		return undefined;
	}

	if (typeof value === 'boolean') {
		return value;
	}

	throw new TypeError(
		`Expected --s3-output-provider.${field} to be a boolean, but got ${typeof value}.`,
	);
};

export const parseS3OutputProvider = (
	value: string | undefined,
): CustomCredentials<AwsProvider> | null => {
	if (typeof value === 'undefined') {
		return null;
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(value);
	} catch (err) {
		throw new Error(
			`Could not parse --s3-output-provider as JSON: ${(err as Error).message}`,
		);
	}

	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		throw new TypeError('Expected --s3-output-provider to be a JSON object.');
	}

	const provider = parsed as Record<string, unknown>;
	const endpoint = validateString({
		value: provider.endpoint,
		field: 'endpoint',
		required: true,
	});
	if (endpoint === null) {
		throw new TypeError(
			'Expected --s3-output-provider.endpoint to be a string, but got object.',
		);
	}

	const accessKeyId = validateString({
		value: provider.accessKeyId,
		field: 'accessKeyId',
		required: false,
	});
	const secretAccessKey = validateString({
		value: provider.secretAccessKey,
		field: 'secretAccessKey',
		required: false,
	});
	const region = validateString({
		value: provider.region,
		field: 'region',
		required: false,
	});
	const forcePathStyle = validateBoolean({
		value: provider.forcePathStyle,
		field: 'forcePathStyle',
	});

	return {
		endpoint,
		accessKeyId,
		secretAccessKey,
		region: region ?? undefined,
		forcePathStyle,
	};
};

export const makeOutNameWithCustomCredentials = ({
	bucketName,
	key,
	s3OutputProvider,
}: {
	bucketName: string | undefined;
	key: string | undefined;
	s3OutputProvider: CustomCredentials<AwsProvider> | null;
}): OutNameInput<AwsProvider> | null => {
	if (!s3OutputProvider) {
		return key ?? null;
	}

	if (!bucketName) {
		throw new Error(
			'Pass --force-bucket-name when using --s3-output-provider.',
		);
	}

	if (!key) {
		throw new Error('Pass --out-name when using --s3-output-provider.');
	}

	return {
		bucketName,
		key,
		s3OutputProvider,
	};
};
