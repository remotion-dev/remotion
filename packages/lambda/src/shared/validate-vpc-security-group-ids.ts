const isValidVpcSecurityGroupIdList = (vpcSecurityGroupIds: string) => {
	const securityGroupIdRegex = /^sg-[0-9a-f]{17}$/;
	vpcSecurityGroupIds.split(',').forEach((securityGroupId) => {
		if (!securityGroupIdRegex.test(securityGroupId.trim())) {
			return false;
		}
	});
	return true;
};

export const validateVpcSecurityGroupIds = (vpcSecurityGroupIds: unknown) => {
	if (
		typeof vpcSecurityGroupIds !== 'undefined' &&
		typeof vpcSecurityGroupIds !== 'string' &&
		!isValidVpcSecurityGroupIdList(vpcSecurityGroupIds as string)
	) {
		throw new TypeError(
			`parameter 'vpcSecurityGroupIds' must either be 'undefined' or a comma-separated list of VPC security group IDs string, but instead got: ${vpcSecurityGroupIds}`,
		);
	}
};
