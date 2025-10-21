export default function remarkExportRaw() {
	return (tree, file) => {
		const raw = String(file.value ?? '');
		const escaped = JSON.stringify(raw);

		tree.children.unshift({
			type: 'mdxJsxFlowElement',
			name: 'RawMarkdownCarrier',
			attributes: [
				{
					type: 'mdxJsxAttribute',
					name: 'raw',
					value: {
						type: 'mdxJsxAttributeValueExpression',
						value: escaped,
						data: {
							estree: {
								type: 'Program',
								body: [
									{
										type: 'ExpressionStatement',
										expression: {
											type: 'Literal',
											value: raw,
											raw: escaped,
										},
									},
								],
								sourceType: 'module',
							},
						},
					},
				},
			],
			children: [],
		});
	};
}
