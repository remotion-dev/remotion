import {ffmpegVolumeExpression} from '../assets/ffmpeg-volume-expression';
import {roundVolumeToAvoidStackOverflow} from '../assets/round-volume-to-avoid-stack-overflow';

test('Simple expression', () => {
	expect(ffmpegVolumeExpression(0.5, 1)).toEqual({
		eval: 'once',
		value: '0.5',
	});
});

test('Simple expression with volume multiplier', () => {
	expect(ffmpegVolumeExpression(0.5, 2)).toEqual({
		eval: 'once',
		value: '1',
	});
});

test('Complex expression with volume multiplier', () => {
	expect(ffmpegVolumeExpression([0, 1], 2)).toEqual({
		eval: 'frame',
		value: "'if(eq(n,0),0,if(eq(n,1),2,0))'",
	});
});

test('Really complex volume expression', () => {
	const expectedExpression = `
    if (
      eq(n,0),
      0,
      if (
        eq(n, 1),
        ${roundVolumeToAvoidStackOverflow(0.25)},
        if (
          eq(n, 2),
          ${roundVolumeToAvoidStackOverflow(0.5)},
          if (
            eq(n, 3)+eq(n, 4)+eq(n, 5)+eq(n, 6),
            ${roundVolumeToAvoidStackOverflow(0.99)},
            if(
							eq(n, 7)+eq(n,8)+eq(n,9)+eq(n,10)+eq(n,11),
							1,
							0
						)
          )
        )
      )
    )
  `.replace(/\s/g, '');

	expect(
		ffmpegVolumeExpression(
			[0, 0.25, 0.5, 0.99, 0.99, 0.99, 0.99, 1, 1, 1, 1, 1],
			1
		)
	).toEqual({
		eval: 'frame',
		value: `'${expectedExpression}'`,
	});
});

test('Should use 0 as else statement', () => {
	expect(ffmpegVolumeExpression([0, 0, 0, 1, 1], 1)).toEqual({
		eval: 'frame',
		value: "'if(eq(n,3)+eq(n,4),1,if(eq(n,0)+eq(n,1)+eq(n,2),0,0))'",
	});
});

test('Simple expression - should not be higher than 1', () => {
	expect(ffmpegVolumeExpression(2, 1)).toEqual({
		eval: 'once',
		value: '1',
	});
});

test('Complex expression - should not be higher than 1', () => {
	expect(ffmpegVolumeExpression([0.5, 2], 1)).toEqual({
		eval: 'frame',
		value: "'if(eq(n,1),1,if(eq(n,0),0.5,0))'",
	});
});
