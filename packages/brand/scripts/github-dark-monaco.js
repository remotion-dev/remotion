window.installGitHubDark = (monaco, tokens) => {
	monaco.languages.register({id: 'remotion-github-dark'});
	monaco.languages.setTokensProvider('remotion-github-dark', {
		getInitialState: () => ({
			line: 0,
			clone() {
				return this;
			},
			equals(other) {
				return this.line === other.line;
			},
		}),
		tokenize(_line, state) {
			return {
				tokens: tokens[state.line] ?? [],
				endState: {...state, line: state.line + 1},
			};
		},
	});
	const scopes = [
		...new Set(tokens.flatMap((line) => line.map((token) => token.scopes))),
	];
	monaco.editor.defineTheme('remotion-github-dark', {
		base: 'vs-dark',
		inherit: true,
		rules: scopes.map((token) => ({token, foreground: token.slice(5)})),
		colors: {
			'editor.background': '#24292E',
			'editorGutter.background': '#24292E',
			'editor.foreground': '#E1E4E8',
			'editorLineNumber.foreground': '#959DA5',
			'editorLineNumber.activeForeground': '#E1E4E8',
			'editorCursor.foreground': '#E1E4E8',
			'editor.selectionBackground': '#3392FF44',
			'editor.inactiveSelectionBackground': '#3392FF44',
		},
	});
};
