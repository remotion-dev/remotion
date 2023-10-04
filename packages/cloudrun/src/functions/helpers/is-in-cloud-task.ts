export const isInCloudTask = () => {
	return (
		process.env.K_CONFIGURATION &&
		process.env.GCLOUD_PROJECT &&
		!process.env.REMOTION_GCP_PROJECT_ID
	);
};

export const getProjectId = (): string | undefined => {
	return isInCloudTask()
		? process.env.GCLOUD_PROJECT
		: process.env.REMOTION_GCP_PROJECT_ID;
};
