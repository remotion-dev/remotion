import type {DoubleClickAction} from '@remotion/renderer';
import type {GetDefaultCodingAgentInfoResponse} from '@remotion/studio-shared';
import {copyContextForAgents} from '../helpers/copy-text';
import {openInCodingAgent} from '../helpers/open-in-editor';
import {showNotification} from './Notifications/NotificationCenter';
import {getPreferredCodingAgent} from './use-default-editor-info';

export const getSourceDoubleClickHandler = ({
	codingAgentInfo,
	doubleClickAction,
	getContextForAgents,
	openSource,
}: {
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly doubleClickAction: DoubleClickAction | null;
	readonly getContextForAgents: () => string | null | Promise<string | null>;
	readonly openSource: (() => void | Promise<void>) | null;
}): (() => void) | null => {
	const action = doubleClickAction ?? 'open-in-editor';
	if (
		(action === 'open-in-editor' && openSource === null) ||
		(action === 'open-in-agent' && codingAgentInfo === null)
	) {
		return null;
	}

	return async () => {
		try {
			if (action === 'open-in-editor') {
				await openSource?.();
				return;
			}

			if (action === 'copy-context') {
				await copyContextForAgents(getContextForAgents());
				showNotification('Copied context for agents', 2000);
				return;
			}

			const agent = getPreferredCodingAgent(codingAgentInfo);
			if (!agent) {
				throw new Error(
					'No installed coding agent found. Check Settings → Apps.',
				);
			}

			const prompt =
				agent.id === 'copilot' ? null : await getContextForAgents();
			const response = await openInCodingAgent(agent.id, prompt);
			if (!response.success) {
				throw new Error(`Could not open ${agent.nameWithType}`);
			}
		} catch (err) {
			showNotification((err as Error).message, 2000);
		}
	};
};
