export const deleteAfterOption = {
	name: 'Render expiry days',
	cliFlag: 'delete-after' as const,
	description: () => {
		return (
			<>
				Automatically delete the render after a certain period. Accepted values
				are <code>1-day</code>, <code>3-days</code>, <code>7-days</code> and{' '}
				<code>30-days</code>. For this to work, your bucket needs to have
				<a href="/docs/lambda/autodelete">lifecycles enabled</a>.
			</>
		);
	},
	ssrName: 'deleteAfter' as const,
	docLink: 'https://www.remotion.dev/docs/autodelete',
	type: 0 as number | null,
};
