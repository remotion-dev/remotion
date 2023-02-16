import { getCloudRunClient } from './get-cloud-run-client';

/**
 * @description Allow unauthenticated access to the Cloud Run service.
 * @link https://remotion.dev/docs/lambda/deployfunction
 * @param options.serviceName The name of the Cloud Run service.
 * @returns {Promise<Boolean>} True if operation was successful. False if not.
 */
export const allowUnauthenticatedAccess = async (
	serviceName: string
): Promise<Boolean> => {
	const cloudRunClient = getCloudRunClient()
	try {
		await cloudRunClient.setIamPolicy({
			resource: serviceName,
			policy: {
				bindings: [
					{
						role: 'roles/run.invoker',
						members: ['allUsers']
					}
				]
			}
		});
		
		return true
	} catch (e) {
		throw e;
	}
}
