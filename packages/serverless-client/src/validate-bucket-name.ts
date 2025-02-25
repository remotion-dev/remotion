export const validateBucketName = ({
	bucketName,
	bucketNamePrefix,
	options,
}: {
	bucketName: unknown;
	bucketNamePrefix: string;
	options: {
		mustStartWithRemotion: boolean;
	};
}) => {
	if (typeof bucketName !== 'string') {
		throw new TypeError(
			`'bucketName' must be a string, but is ${JSON.stringify(bucketName)}`,
		);
	}

	if (
		options.mustStartWithRemotion &&
		!bucketName.startsWith(bucketNamePrefix)
	) {
		throw new Error(
			`The bucketName parameter must start with ${bucketNamePrefix}.`,
		);
	}

	if (
		!bucketName.match(
			/^(?=^.{3,63}$)(?!^(\d+\.)+\d+$)(^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$)/,
		)
	) {
		throw new Error(`The bucket ${bucketName} `);
	}
};
