import type {AnyRemotionOption} from './option';

export const enableLambdaInsights = {
	name: 'Enable Lambda Insights',
	cliFlag: 'enable-lambda-insights' as const,
	description: () => (
		<>
			Enable{' '}
			<a href="https://remotion.dev/docs/lambda/insights">
				Lambda Insights in AWS CloudWatch
			</a>
			. For this to work, you may have to update your role permission.
		</>
	),
	ssrName: 'enableLambdaInsights',
	docLink: 'https://www.remotion.dev/docs/lambda/insights',
	type: false as boolean,
} satisfies AnyRemotionOption;
