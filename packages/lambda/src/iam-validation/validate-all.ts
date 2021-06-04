import {
	GetGroupPolicyCommand,
	GetUserCommand,
	ListAttachedUserPoliciesCommand,
	ListGroupPoliciesCommand,
	ListGroupsForUserCommand,
	ListUserPoliciesCommand,
} from '@aws-sdk/client-iam';
import {iamClient} from '../aws-clients';
import {Log} from '../cli/log';

export const validateAll = async () => {
	const user = await iamClient.send(new GetUserCommand({}));

	const policies = await iamClient.send(
		new ListUserPoliciesCommand({
			UserName: user.User?.UserName as string,
		})
	);
	const attachedPolicies = await iamClient.send(
		new ListAttachedUserPoliciesCommand({
			UserName: user.User?.UserName as string,
		})
	);
	const groups = await iamClient.send(
		new ListGroupsForUserCommand({
			UserName: user.User?.UserName as string,
		})
	);
	const policiesForGroups = await Promise.all(
		(groups.Groups ?? []).map(async (group) => {
			const response = await iamClient.send(
				new ListGroupPoliciesCommand({
					GroupName: group.GroupName,
				})
			);
			return (response.PolicyNames ?? []).map((policy) => {
				return {
					policyName: policy,
					groupName: group.GroupName,
				};
			});
		})
	);
	const groupPolicies = await Promise.all(
		policiesForGroups.flat(1).map(({groupName, policyName}) => {
			return iamClient.send(
				new GetGroupPolicyCommand({
					GroupName: groupName,
					PolicyName: policyName,
				})
			);
		})
	);
	Log.info(policies);
	Log.info(attachedPolicies);
	Log.info(groups);
	Log.info(
		groupPolicies
			.map((p) => {
				return decodeURIComponent(p.PolicyDocument as string);
			})
			.join('\n')
	);
};
