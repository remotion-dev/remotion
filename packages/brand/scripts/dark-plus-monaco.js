window.installDarkPlus = (monaco, tokens) => {
	monaco.languages.register({id: 'remotion-dark-plus'});
	monaco.languages.setTokensProvider('remotion-dark-plus', {
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
	monaco.editor.defineTheme('remotion-dark-plus', {
		base: 'vs-dark',
		inherit: true,
		rules: scopes.map((token) => ({token, foreground: token.slice(5)})),
		colors: {
			'editor.background': '#131414',
			'editorGutter.background': '#131414',
			'editor.foreground': '#D4D4D4',
			'editorLineNumber.foreground': '#858585',
			'editorLineNumber.activeForeground': '#858585',
			'editorCursor.foreground': '#D4D4D4',
			'editor.selectionBackground': '#264F78',
			'editor.inactiveSelectionBackground': '#264F78',
		},
	});
};
