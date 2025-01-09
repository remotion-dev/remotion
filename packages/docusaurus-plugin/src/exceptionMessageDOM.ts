/* eslint-disable no-console */
import {TwoslashError} from '@typescript/twoslash';
import type {Node} from './unist-types';

export function escapeHtml(html: string) {
	return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const setupNodeForTwoslashException = (
	code: string,
	node: Node,
	error: Error,
) => {
	const css = `<style>
@import url('http://fonts.cdnfonts.com/css/caslon-os'); 

.twoslash-fixed-error-note { 
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    padding: .25rem .75rem;
    color: black;
    background-color: #FCF3D9;
    background-clip: padding-box;
    border-bottom: 1px solid rgba(0,0,0,.05);
    border-radius: .25rem;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
 } 

 #__docusaurus .twoslash-fixed-error-note {
    top: 80px;
 }

 .twoslash-fixed-error-note:hover {
    border-bottom: 1px solid rgba(226, 61, 30, 0.8);
 }

 .twoslash-error-color {
    background-color: #E23D1E;
    width: 18px;
    height: 18px;
    border-radius: 9px;
    margin-right:  10px;
    color: black;
 }

.twoslash-exception-message { 
    font-family: 'Caslon OS', sans-serif; 
    background-color: #FCF3D9;
    font-size: 1.1rem;
    padding: 2rem;
    border-left: 2px solid #E23D1E;
}

.twoslash-exception-message p {
    margin-top: 1rem;
    margin-bottom: 0.6rem;
}

.twoslash-exception-message h3 { 
    margin-top: 0.6rem;
    margin-bottom: 0.3rem;
    font-size: 1.8rem;
}

.twoslash-exception-message code {
     white-space: pre-wrap;
     font-family: "JetBrains Mono", Menlo, Monaco, Consolas, Courier New, monospace;
     margin-bottom: 20px;
     background-color: #FCF3D9;
     color: black;
     border: none;
     padding-left: 0;
 }

 .twoslash-exception-message > code {
     display: block;
     margin-bottom: 1.5rem;
     margin-top: 3rem;
 }

.twoslash-exception-code {
    border-left: 2px solid #E5A604;
    padding-left: 20px;
    background-color: #FCF3D9;
    color: black;
}
</style>`;

	const bodyFromTwoslashError = (err: TwoslashError) => {
		return `
<h3>${escapeHtml(err.title)}</h3>
<p>${escapeHtml(err.description).replace(/(?:\r\n|\r|\n)/g, '<br>')}</p>
<code>${escapeHtml(err.recommendation).replace(
			/(?:\r\n|\r|\n)/g,
			'<br>',
		)}</code>
`;
	};

	const bodyFromError = (err: Error) => {
		return `<pre><code>${err.message.split('## Code')[0]}</code></pre>`;
	};

	const isWebWorker =
		typeof self !== 'undefined' &&
		// @ts-expect-error
		typeof self.WorkerGlobalScope !== 'undefined';
	const isBrowser =
		isWebWorker ||
		(typeof window !== 'undefined' &&
			typeof window.document !== 'undefined' &&
			typeof fetch !== 'undefined');

	// @ts-expect-error
	const isJest = typeof jest !== 'undefined';

	const eLog = !isBrowser && !isJest ? console.error : () => {};

	let body = `<pre><code>${error}</code></pre>`;
	if (typeof error !== 'object') {
		body = String(error);
		eLog(`### Unexpected error:`);
		eLog(error);
	} else if (error instanceof TwoslashError) {
		body = bodyFromTwoslashError(error);
		eLog(`### Twoslash error: ${error.title}`);
		eLog(error.description);
		eLog(error.recommendation);
		eLog('\n### Code Sample');
		eLog(code);
	} else if (error instanceof Error) {
		body = bodyFromError(error);
		eLog(`### Unexpected error:`);
		eLog(error);
	}

	const codeSample = `<p>Raising Code:</p><pre class='twoslash-exception-code'><code>${escapeHtml(
		code,
	)}</code></pre>`;

	const html = `
    <a href='#twoslash-error'><div class='twoslash-fixed-error-note'><span class='twoslash-error-color'></span>Twoslash failure</div></a>
    <div class='twoslash-exception-message'>${body}${codeSample}</div>`;

	node.type = 'html';
	node.value = "<div id='twoslash-error'>" + css + html + '</div>';
	node.children = [];
};
