export const checkBucketListing = async ({
	bucketName,
	region,
}: {
	bucketName: string;
	region: string;
}) => {
	try {
		const res = await fetch(
			`https://${bucketName}.s3.${region}.amazonaws.com/`,
		);
		if (res.status === 200) {
			// eslint-disable-next-line no-console
			console.warn(
				`Warning: Your bucket ${bucketName} allows public listing of its contents. See https://remotion.dev/docs/lambda/bucket-security for how to fix this.`,
			);
		}
	} catch {
		// Ignore - best effort check, may fail for non-AWS providers
	}
};
