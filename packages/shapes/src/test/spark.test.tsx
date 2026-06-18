import {expect, test} from 'bun:test';
import {Spark} from '../components/spark';
import {render} from './test-utils';

test('Should be able to make a spark svg', () => {
	const {container} = render(
		<Spark width={200} height={120} edgeRoundness={1} cornerRadius={0} />,
	);

	expect(container.querySelector('path')?.getAttribute('d')).toContain(
		'C 100 33.137084989847615',
	);
});
