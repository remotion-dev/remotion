import {Log} from './log';
import {
	getDisplayNameForEditor,
	guessEditor,
	isTerminalEditor,
	isVsCodeDerivative,
	launchEditor,
} from './open-in-editor';
import {findReadme} from './patch-readme';
import prompts from './prompts';

export const openInEditorFlow = async (projectRoot: string) => {
	const editors = await guessEditor();
	const [guiEditor] = editors.filter((e) => !isTerminalEditor(e.command));

	if (!guiEditor) {
		return;
	}

	const displayName = getDisplayNameForEditor(guiEditor.command);

	const {answer} = await prompts({
		message: `💻 Open in ${displayName}?`,
		initial: true,
		type: 'toggle',
		name: 'answer',
		active: 'Yes',
		inactive: 'No',
	});

	if (answer) {
		await launchEditor({
			colNumber: 1,
			editor: guiEditor,
			fileName: projectRoot,
			vsCodeNewWindow: true,
			lineNumber: 1,
		});
		const readme = findReadme(projectRoot);
		if (readme !== null && isVsCodeDerivative(guiEditor.command)) {
			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
			await launchEditor({
				colNumber: 1,
				editor: guiEditor,
				fileName: readme,
				vsCodeNewWindow: false,
				lineNumber: 1,
			});
		}
	}

	Log.info();
};
