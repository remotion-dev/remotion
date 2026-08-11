import React from 'react';

const FALLBACK_VERSION = '4.0.1';

export const Prerelease: React.FC<{
	readonly packageName: string;
}> = ({packageName = '@remotion/lambda'}) => {
	const version =
		typeof URLSearchParams === 'undefined'
			? FALLBACK_VERSION
			: typeof window === 'undefined'
				? FALLBACK_VERSION
				: (new URLSearchParams(window.location.search).get('version') ??
					FALLBACK_VERSION);
	return (
		<div>
			<pre className="code-container">
				{[
					'@remotion/bundler',
					'@remotion/renderer',
					packageName,
					'remotion',
				].map((r) => {
					return (
						<div key={r}>
							<span style={{color: '#e13238'}}>
								- &quot;{r}&quot;: &quot;{'4.0.0'}&quot;
							</span>
							{'\n'}
							<span style={{color: '#009400'}}>
								+ &quot;{r}&quot;: &quot;{version}&quot;
							</span>
							{'\n'}
						</div>
					);
				})}
			</pre>
		</div>
	);
};
