import path from 'node:path';
import {Log} from './log';
import {
	getDisplayNameForEditor,
	guessEditor,
	isTerminalEditor,
	isVsCodeDerivative,
	launchEditor,
} from './open-in-editor';
import prompts from './prompts';

export const openInEditorFlow = async (projectRoot: string) => {
	const editors = await guessEditor();
	const [guiEditor] = editors.filter((e) => !isTerminalEditor(e.command));

	if (!guiEditor) {
		return;
	}

	const displayName = getDisplayNameForEditor(guiEditor.command);

	const should = await prompts({
		message: `💻 Open in ${displayName}?`,
		initial: true,
		type: 'toggle',
		name: 'answer',
		active: 'Yes',
		inactive: 'No',
	});

	if (should) {
		await launchEditor({
			colNumber: 1,
			editor: guiEditor,
			fileName: projectRoot,
			vsCodeNewWindow: true,
			lineNumber: 1,
		});
		if (isVsCodeDerivative(guiEditor.command)) {
			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
			await launchEditor({
				colNumber: 1,
				editor: guiEditor,
				fileName: path.join(projectRoot, 'README.md'),
				vsCodeNewWindow: false,
				lineNumber: 1,
			});
		}
	}

	Log.info();
};
