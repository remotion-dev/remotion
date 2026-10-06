import React from 'react';

// Keep the generated pages usable as plain Markdown as well as MDX.
export const optionDescriptionToMarkdown = (
	node: React.ReactNode,
	inCode = false,
): string => {
	if (node === null || node === undefined || typeof node === 'boolean') {
		return '';
	}

	if (typeof node === 'string' || typeof node === 'number') {
		const text = String(node);
		return inCode
			? text
			: text
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/\{/g, '&#123;')
					.replace(/\}/g, '&#125;')
					.replace(/([\\`*_[\]])/g, '\\$1');
	}

	if (Array.isArray(node)) {
		return node
			.map((child, index) => {
				const markdown = optionDescriptionToMarkdown(child, inCode);
				const previous = node[index - 1];
				return !inCode &&
					React.isValidElement(previous) &&
					previous.type === 'code' &&
					React.isValidElement(child) &&
					child.type === 'code'
					? ` ${markdown}`
					: markdown;
			})
			.join('');
	}

	if (
		!React.isValidElement<{children: React.ReactNode; href: string | null}>(
			node,
		)
	) {
		throw new Error('Unsupported option description node');
	}

	const {props} = node;
	if (node.type === React.Fragment) {
		return optionDescriptionToMarkdown(props.children, inCode);
	}

	if (typeof node.type === 'function') {
		const component = node.type as (
			componentProps: typeof props,
		) => React.ReactNode;
		return optionDescriptionToMarkdown(component(props), inCode);
	}

	const children = optionDescriptionToMarkdown(
		node.props.children,
		inCode || node.type === 'code',
	);

	switch (node.type) {
		case 'code': {
			const fence = '`'.repeat(
				Math.max(
					0,
					...Array.from(children.matchAll(/`+/g), (m) => m[0].length),
				) + 1,
			);
			const padding =
				children.startsWith('`') || children.endsWith('`') ? ' ' : '';
			return `${fence}${padding}${children}${padding}${fence}`;
		}

		case 'a': {
			if (!node.props.href) {
				throw new Error('An option description link is missing its URL');
			}

			const href = node.props.href.replace(
				/^https:\/\/(www\.)?remotion\.dev(?=\/)/,
				'',
			);
			return `[${children}](${href})`;
		}

		case 'p':
			return `\n\n${children}\n\n`;
		case 'br':
			return '<br />';
		case 'em':
			return `_${children}_`;
		case 'ul':
			return `\n\n${children.trim()}\n\n`;
		case 'li':
			return `- ${children.trim()}\n`;
		case 'details':
			return `\n\n<details>\n\n${children.trim()}\n\n</details>\n\n`;
		case 'summary':
			return `<summary>${children}</summary>\n\n`;
		default:
			throw new Error(
				`Unsupported option description element: ${String(node.type)}`,
			);
	}
};
