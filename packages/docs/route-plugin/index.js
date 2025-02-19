const path = require('path');
const fs = require('fs');

module.exports = function () {
	return {
		name: 'slug-plugin',
		loadContent() {
			const experts = fs.readFileSync(
				path.join(__dirname, '../src/data/experts.tsx'),
				'utf-8',
			);
			const templates = fs.readFileSync(
				path.join(__dirname, '../../../packages/create-video/src/templates.ts'),
				'utf-8',
			);
			const expertSlugs = experts
				.split('\n')
				.map((a) => {
					return a.match(/slug:\s'(.*)'/)?.[1];
				})
				.filter(Boolean);

			const templateSlugs = templates
				.split('\n')
				.map((a) => {
					return a.match(/cliId:\s'(.*)'/)?.[1];
				})
				.filter(Boolean);

			if (templateSlugs.length === 0) {
				throw new Error('expected templates');
			}

			if (expertSlugs.length === 0) {
				throw new Error('expected experts');
			}

			return {expertSlugs, templateSlugs};
		},
		contentLoaded({content: {expertSlugs, templateSlugs}, actions}) {
			expertSlugs.forEach((c) => {
				actions.addRoute({
					path: '/experts/' + c,
					component: '@site/src/components/ExpertPage.tsx',
					modules: {},
					exact: true,
				});
			});
			templateSlugs.forEach((c) => {
				actions.addRoute({
					path: '/templates/' + c,
					component: '@site/src/components/TemplatePage.tsx',
					modules: {},
					exact: true,
				});
			});
		},
	};
};
