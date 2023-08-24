import {AnyRemotionOption} from './option';

export const webhookCustomDataOption = {
	name: 'Webhook custom data',
	cliFlag: 'webhook-custom-data' as const,
	description: (
		<>
			Pass up to 1,024 bytes of a JSON-serializable object to the webhook. This
			data will be included in the webhook payload.
		</>
	),
	ssrName: 'customData' as const,
	docLink: 'https://www.remotion.dev/docs/lambda/webhooks',
	type: {} as Record<string, unknown> | null,
} satisfies AnyRemotionOption;
