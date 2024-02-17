import type {AnyRemotionOption} from './option';

export type DeleteAfter = '1-day' | '3-days' | '7-days' | '30-days';

export const deleteAfterOption = {
	name: 'Lambda render expiration',
	cliFlag: 'delete-after' as const,
	description: () => {
		return (
			<>
				Automatically delete the render after a certain period. Accepted values
				are <code>1-day</code>, <code>3-days</code>, <code>7-days</code> and{' '}
				<code>30-days</code>.<br /> For this to work, your bucket needs to have{' '}
				<a href="/docs/lambda/autodelete">lifecycles enabled</a>.
			</>
		);
	},
	ssrName: 'deleteAfter' as const,
	docLink: 'https://www.remotion.dev/docs/lambda/autodelete',
	type: '1-day' as DeleteAfter | null,
} satisfies AnyRemotionOption<DeleteAfter | null>;
