import path from 'node:path';
import {getRemotionElementSourceMap} from '../../../plugins/element-source-utils.js';

export default function elementSourcesLoader() {
	const elementsRoot = path.resolve(
		path.dirname(this.resourcePath),
		'../../../elements',
	);
	this.addContextDependency(elementsRoot);
	return `export default ${JSON.stringify(getRemotionElementSourceMap({elementsRoot}))};`;
}
