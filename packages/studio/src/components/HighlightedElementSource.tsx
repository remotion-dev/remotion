import Prism from 'prismjs';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-tsx.js';
import 'prismjs/themes/prism-tomorrow.css';
import React, {useMemo} from 'react';

// React owns this DOM. Prism's automatic highlighting would replace its nodes.
Prism.manual = true;

const tokenStyle: React.CSSProperties = {
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const renderTokens = (
	tokens: string | Prism.Token | (string | Prism.Token)[],
): React.ReactNode => {
	if (typeof tokens === 'string') {
		return tokens;
	}

	if (Array.isArray(tokens)) {
		let offset = 0;
		return tokens.map((token) => {
			const key = offset;
			offset += token.length;
			return <React.Fragment key={key}>{renderTokens(token)}</React.Fragment>;
		});
	}

	return (
		<span
			className={[
				'token',
				tokens.type,
				...(typeof tokens.alias === 'string'
					? [tokens.alias]
					: (tokens.alias ?? [])),
			].join(' ')}
			style={tokenStyle}
		>
			{renderTokens(tokens.content)}
		</span>
	);
};

const HighlightedElementSource: React.FC<{readonly source: string}> = ({
	source,
}) => {
	const tokens = useMemo(
		() => Prism.tokenize(source, Prism.languages.tsx),
		[source],
	);
	return (
		<span style={{...tokenStyle, color: 'inherit'}}>
			{renderTokens(tokens)}
		</span>
	);
};

export default HighlightedElementSource;
