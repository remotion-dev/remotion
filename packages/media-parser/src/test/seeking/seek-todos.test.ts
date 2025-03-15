import {test} from 'bun:test';

test.todo('should not count samples twice');
test.todo(
	'should not calculate slow fps, slow duration, slow keyframes etc. if there was seeking inbetween',
);
test.todo('may not use skip to skip over metadata that is requested');
test.todo('may not skip to a section that is outside the video section');
