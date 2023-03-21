import {getCloudRunClient} from './helpers/get-cloud-run-client';

/**
 * @description Allow unauthenticated access to the Cloud Run service.
 * @link https://remotion.dev/docs/lambda/deployfunction
 * @param options.serviceName The name of the Cloud Run service.
 * @returns {Promise<Boolean>} True if operation was successful. False if not.
 */
export const allowUnauthenticatedAccess = async (
	serviceName: string,
	allow: boolean
): Promise<Boolean> => {
	const cloudRunClient = getCloudRunClient();

	// ToDo: once this is finalised, need to test out the testCall code - is it able to invoke the Cloud Run service using the stored json credentials, where as the got() call should fail.

	const existingPolicy = await cloudRunClient.getIamPolicy({
		resource: serviceName,
	});

	const existingBindings = existingPolicy[0].bindings || [];

	const invokerBindings = existingPolicy[0].bindings?.filter(
		(binding) => binding.role === 'roles/run.invoker'
	);
	if (allow) {
		/* allow allUsers to invoke cloud run */

		let finalMembers: string[] = [];

		if (invokerBindings?.[0]) {
			if (invokerBindings?.[0].members?.indexOf('allUsers') === -1) {
				// allUsers not present for roles/run.invoker
				finalMembers = invokerBindings[0].members.concat(['allUsers']);
			} else {
				// allUsers already present for roles/run.invoker
				return true;
			}
		} else {
			// no existing bindings found for roles/run.invoker
			finalMembers = ['allUsers'];
		}

		await cloudRunClient.setIamPolicy({
			resource: serviceName,
			policy: {
				bindings: [
					...existingBindings,
					{
						role: 'roles/run.invoker',
						members: finalMembers,
					},
				],
			},
		});
	} else {
		/* Ensure allUsers is not on permitted to invoke cloud run */

		if (!existingBindings.length) {
			// there are no bindings on this service
			return true;
		}

		if (invokerBindings?.[0]) {
			if (invokerBindings[0].members?.indexOf('allUsers') === -1) {
				// allUsers not present for roles/run.invoker
				return true;
			}

			invokerBindings[0].members?.splice(
				invokerBindings[0].members.indexOf('allUsers'),
				1
			);
		} else {
			// no existing bindings found for roles/run.invoker
			return true;
		}

		await cloudRunClient.setIamPolicy({
			resource: serviceName,
			policy: {
				bindings: [
					...existingBindings,
					{
						role: 'roles/run.invoker',
						members: invokerBindings[0].members,
					},
				],
			},
		});
	}

	return true;
};
