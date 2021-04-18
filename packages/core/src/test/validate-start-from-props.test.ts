import {renderHook} from '@testing-library/react-hooks';
import {validateStartFromProps} from '../validate-start-from-props';

test('It should throw if startFrom prop is negative', () => {
	const {result} = renderHook(() => validateStartFromProps(-40, 1));
	expect(result.error).toEqual(
		TypeError('startFrom must be greater than equal to 0 instead got -40.')
	);
});

test('It should throw if endAt prop is negative', () => {
	const {result} = renderHook(() => validateStartFromProps(0, -40));
	expect(result.error).toEqual(
		TypeError('endAt must be a positive number, instead got -40.')
	);
});

test('It should throw if endAt is less than startFrom', () => {
	const {result} = renderHook(() => validateStartFromProps(10, 1));
	expect(result.error).toEqual(
		TypeError('endAt prop must be greater than startFrom prop.')
	);
});

test('It should throw if endAt is not a number', () => {
	//@ts-expect-error
	const {result} = renderHook(() => validateStartFromProps(10, '20'));
	expect(result.error).toEqual(
		TypeError('type of endAt prop must be a number, instead got type string.')
	);
});

test('It should throw if startFrom is not a number', () => {
	//@ts-expect-error
	const {result} = renderHook(() => validateStartFromProps('10', 20));
	expect(result.error).toEqual(
		TypeError(
			'type of startFrom prop must be a number, instead got type string.'
		)
	);
});

test('It should throw if endAt is NaN', () => {
	const {result} = renderHook(() => validateStartFromProps(10, NaN));
	expect(result.error).toEqual(TypeError('endAt prop can not be NaN.'));
});

test('It should throw if startFrom is NaN or Infinity', () => {
	const {result} = renderHook(() => validateStartFromProps(NaN, 20));
	expect(result.error).toEqual(
		TypeError('startFrom prop can not be NaN or Infinity.')
	);
	const {result: result2} = renderHook(() =>
		validateStartFromProps(Infinity, 20)
	);
	expect(result2.error).toEqual(
		TypeError('startFrom prop can not be NaN or Infinity.')
	);
});
