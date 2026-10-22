import {
	PRISM_BACKGROUND,
	PRISM_CLASS_NAME_COLOR,
	PRISM_COMMENT_COLOR,
	PRISM_CONTROL_FLOW_COLOR,
	PRISM_FUNCTION_COLOR,
	PRISM_INLINE_COLOR,
	PRISM_KEYWORD_COLOR,
	PRISM_LINE_HIGHLIGHT_BACKGROUND,
	PRISM_LINE_HIGHLIGHT_BORDER_COLOR,
	PRISM_NUMBER_COLOR,
	PRISM_REGEX_COLOR,
	PRISM_SELECTION_BACKGROUND,
	PRISM_SELECTOR_COLOR,
	PRISM_STRING_COLOR,
	PRISM_TEXT_COLOR,
	PRISM_VARIABLE_COLOR,
	RULER_COLOR,
} from './colors';

// Adapted from prism-themes@1.9.0/themes/prism-vsc-dark-plus.css to use the
// Studio palette. Stored as a string for CSS injection (including Browser
// Studio, which has no CSS loader).
/*
The MIT License (MIT)

Copyright (c) 2015 PrismJS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
export const prismVscDarkPlus = `pre[class*="language-"],
code[class*="language-"] {
	color: ${PRISM_TEXT_COLOR};
	font-size: 13px;
	text-shadow: none;
	font-family: Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace;
	direction: ltr;
	text-align: left;
	white-space: pre;
	word-spacing: normal;
	word-break: normal;
	line-height: 1.5;
	-moz-tab-size: 4;
	-o-tab-size: 4;
	tab-size: 4;
	-webkit-hyphens: none;
	-moz-hyphens: none;
	-ms-hyphens: none;
	hyphens: none;
}

pre[class*="language-"]::selection,
code[class*="language-"]::selection,
pre[class*="language-"] *::selection,
code[class*="language-"] *::selection {
	text-shadow: none;
	background: ${PRISM_SELECTION_BACKGROUND};
}

@media print {
	pre[class*="language-"],
	code[class*="language-"] {
		text-shadow: none;
	}
}

pre[class*="language-"] {
	padding: 1em;
	margin: .5em 0;
	overflow: auto;
	background: ${PRISM_BACKGROUND};
}

:not(pre) > code[class*="language-"] {
	padding: .1em .3em;
	border-radius: .3em;
	color: ${PRISM_INLINE_COLOR};
	background: ${PRISM_BACKGROUND};
}
/*********************************************************
* Tokens
*/
.namespace {
	opacity: .7;
}

.token.doctype .token.doctype-tag {
	color: ${PRISM_KEYWORD_COLOR};
}

.token.doctype .token.name {
	color: ${PRISM_VARIABLE_COLOR};
}

.token.comment,
.token.prolog {
	color: ${PRISM_COMMENT_COLOR};
}

.token.punctuation,
.language-html .language-css .token.punctuation,
.language-html .language-javascript .token.punctuation {
	color: ${PRISM_TEXT_COLOR};
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.inserted,
.token.unit {
	color: ${PRISM_NUMBER_COLOR};
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.deleted {
	color: ${PRISM_STRING_COLOR};
}

.language-css .token.string.url {
	text-decoration: underline;
}

.token.operator,
.token.entity {
	color: ${PRISM_TEXT_COLOR};
}

.token.operator.arrow {
	color: ${PRISM_KEYWORD_COLOR};
}

.token.atrule {
	color: ${PRISM_STRING_COLOR};
}

.token.atrule .token.rule {
	color: ${PRISM_CONTROL_FLOW_COLOR};
}

.token.atrule .token.url {
	color: ${PRISM_VARIABLE_COLOR};
}

.token.atrule .token.url .token.function {
	color: ${PRISM_FUNCTION_COLOR};
}

.token.atrule .token.url .token.punctuation {
	color: ${PRISM_TEXT_COLOR};
}

.token.keyword {
	color: ${PRISM_KEYWORD_COLOR};
}

.token.keyword.module,
.token.keyword.control-flow {
	color: ${PRISM_CONTROL_FLOW_COLOR};
}

.token.function,
.token.function .token.maybe-class-name {
	color: ${PRISM_FUNCTION_COLOR};
}

.token.regex {
	color: ${PRISM_REGEX_COLOR};
}

.token.important {
	color: ${PRISM_KEYWORD_COLOR};
}

.token.italic {
	font-style: italic;
}

.token.constant {
	color: ${PRISM_VARIABLE_COLOR};
}

.token.class-name,
.token.maybe-class-name {
	color: ${PRISM_CLASS_NAME_COLOR};
}

.token.console {
	color: ${PRISM_VARIABLE_COLOR};
}

.token.parameter {
	color: ${PRISM_VARIABLE_COLOR};
}

.token.interpolation {
	color: ${PRISM_VARIABLE_COLOR};
}

.token.punctuation.interpolation-punctuation {
	color: ${PRISM_KEYWORD_COLOR};
}

.token.boolean {
	color: ${PRISM_KEYWORD_COLOR};
}

.token.property,
.token.variable,
.token.imports .token.maybe-class-name,
.token.exports .token.maybe-class-name {
	color: ${PRISM_VARIABLE_COLOR};
}

.token.selector {
	color: ${PRISM_SELECTOR_COLOR};
}

.token.escape {
	color: ${PRISM_SELECTOR_COLOR};
}

.token.tag {
	color: ${PRISM_KEYWORD_COLOR};
}

.token.tag .token.punctuation {
	color: ${RULER_COLOR};
}

.token.cdata {
	color: ${RULER_COLOR};
}

.token.attr-name {
	color: ${PRISM_VARIABLE_COLOR};
}

.token.attr-value,
.token.attr-value .token.punctuation {
	color: ${PRISM_STRING_COLOR};
}

.token.attr-value .token.punctuation.attr-equals {
	color: ${PRISM_TEXT_COLOR};
}

.token.entity {
	color: ${PRISM_KEYWORD_COLOR};
}

.token.namespace {
	color: ${PRISM_CLASS_NAME_COLOR};
}
/*********************************************************
* Language Specific
*/

pre[class*="language-javascript"],
code[class*="language-javascript"],
pre[class*="language-jsx"],
code[class*="language-jsx"],
pre[class*="language-typescript"],
code[class*="language-typescript"],
pre[class*="language-tsx"],
code[class*="language-tsx"] {
	color: ${PRISM_VARIABLE_COLOR};
}

pre[class*="language-css"],
code[class*="language-css"] {
	color: ${PRISM_STRING_COLOR};
}

pre[class*="language-html"],
code[class*="language-html"] {
	color: ${PRISM_TEXT_COLOR};
}

.language-regex .token.anchor {
	color: ${PRISM_FUNCTION_COLOR};
}

.language-html .token.punctuation {
	color: ${RULER_COLOR};
}
/*********************************************************
* Line highlighting
*/
pre[class*="language-"] > code[class*="language-"] {
	position: relative;
	z-index: 1;
}

.line-highlight.line-highlight {
	background: ${PRISM_LINE_HIGHLIGHT_BACKGROUND};
	box-shadow: inset 5px 0 0 ${PRISM_LINE_HIGHLIGHT_BORDER_COLOR};
	z-index: 0;
}
`;
