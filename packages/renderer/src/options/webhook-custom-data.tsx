import type {AnyRemotionOption} from './option';

const cliFlag = 'webhook-custom-data' as const;

export const webhookCustomDataOption = {
	name: 'Webhook custom data',
	cliFlag,
	description: (type) => (
		<>
			Pass up to 1,024 bytes of a JSON-serializable object to the webhook. This
			data will be included in the webhook payload.{' '}
			{type === 'cli'
				? 'Alternatively, pass a file path pointing to a JSON file'
				: null}
		</>
	),
	ssrName: 'customData' as const,
	docLink: 'https://www.remotion.dev/docs/lambda/webhooks',
	type: {} as Record<string, unknown> | null,
	getValue: () => {
		throw new Error('Option resolution not implemented');
	},
	setConfig: () => {
		throw new Error('Not implemented');
	},
} satisfies AnyRemotionOption<Record<string, unknown> | null>;
