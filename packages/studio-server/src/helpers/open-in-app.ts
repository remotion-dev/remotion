import path from 'node:path';
import {
	defaultEditorIds,
	type BuiltInEditor,
	type DefaultEditor,
	type LogLevel,
} from '@remotion/renderer';
import type {
	OpenInCodingAgentRequest,
	OpenInCodingAgentResponse,
	OpenInEditorRequest,
	OpenInEditorResponse,
} from '@remotion/studio-shared';
import {
	getAvailableCodingAgents,
	launchCodingAgent,
} from './coding-agent-registry';
import {launchCustomEditor} from './custom-editor';
import {launchEditor} from './open-in-editor';
import {resolveEditor} from './resolve-editor';

export const openInEditor = async ({
	input,
	remotionRoot,
	logLevel,
	getDefaultEditor,
}: {
	input: OpenInEditorRequest;
	remotionRoot: string;
	logLevel: LogLevel;
	getDefaultEditor: () => DefaultEditor | null;
}): Promise<OpenInEditorResponse> => {
	try {
		if (!('stack' in input)) {
			throw new TypeError('Need to pass stack');
		}

		const {stack} = input;
		if (
			input.editorId !== null &&
			input.editorId !== 'custom' &&
			!defaultEditorIds.includes(input.editorId as BuiltInEditor)
		) {
			return {success: false};
		}

		const editor = await resolveEditor({
			defaultEditor: getDefaultEditor(),
			logLevel,
			preferredEditor: input.editorId,
		});
		if (!editor) {
			return {success: false};
		}

		const fileName = path.resolve(
			remotionRoot,
			stack.originalFileName as string,
		);
		const didOpen =
			editor.type === 'custom'
				? await launchCustomEditor({
						editor: editor.editor,
						resolvedExecutable: editor,
						targetPath: fileName,
						lineNumber: stack.originalLineNumber as number,
						columnNumber: stack.originalColumnNumber as number,
						logLevel,
						spawnProcess: null,
					})
				: await launchEditor(
						{
							colNumber: stack.originalColumnNumber as number,
							editor,
							fileName,
							lineNumber: stack.originalLineNumber as number,
							vsCodeNewWindow: false,
							logLevel,
						},
						remotionRoot,
					);

		return {success: didOpen};
	} catch {
		return {success: false};
	}
};

export const openInCodingAgent = async ({
	input,
	logLevel,
	remotionRoot,
}: {
	input: OpenInCodingAgentRequest;
	logLevel: LogLevel;
	remotionRoot: string;
}): Promise<OpenInCodingAgentResponse> => {
	const codingAgent = (await getAvailableCodingAgents()).find(
		(agent) => agent.id === input.codingAgentId,
	);
	if (!codingAgent) {
		return {success: false};
	}

	return {
		success: await launchCodingAgent({
			codingAgent,
			projectPath: remotionRoot,
			logLevel,
			prompt: input.prompt,
		}),
	};
};
