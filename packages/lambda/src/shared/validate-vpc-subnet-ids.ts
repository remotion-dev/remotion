const isValidVpcSubnetIdList = (vpcSubnetIds: string) => {
	const subnetIdRegex = /^subnet-[0-9a-f]{17}$/;
	vpcSubnetIds.split(',').forEach((subnetId) => {
		if (!subnetIdRegex.test(subnetId.trim())) {
			return false;
		}
	});
	return true;
};

export const validateVpcSubnetIds = (vpcSubnetIds: unknown) => {
	if (
		typeof vpcSubnetIds !== 'undefined' &&
		typeof vpcSubnetIds !== 'string' &&
		!isValidVpcSubnetIdList(vpcSubnetIds as string)
	) {
		throw new TypeError(
			`parameter 'vpcSubnetIds' must either be 'undefined' or a comma-separated list of VPC subnet IDs string, but instead got: ${vpcSubnetIds}`,
		);
	}
};
