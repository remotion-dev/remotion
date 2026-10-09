import type {ArrayExpression, CallExpression} from '@babel/types';

const getCalleeName = (call: CallExpression): string | null => {
	const {callee} = call;
	if (callee.type === 'Identifier') {
		return callee.name;
	}

	if (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier'
	) {
		return callee.property.name;
	}

	return null;
};

export type EffectArrayElement =
	| {kind: 'call'; callee: string; node: CallExpression}
	| {kind: 'unsupported'; reason: 'not-call-expression' | 'spread'};

export const enumerateEffectArrayElements = (
	arr: ArrayExpression,
): EffectArrayElement[] => {
	const out: EffectArrayElement[] = [];
	for (const el of arr.elements) {
		if (el === null) {
			out.push({kind: 'unsupported', reason: 'not-call-expression'});
			continue;
		}

		if (el.type === 'SpreadElement') {
			out.push({kind: 'unsupported', reason: 'spread'});
			continue;
		}

		if (el.type !== 'CallExpression') {
			out.push({kind: 'unsupported', reason: 'not-call-expression'});
			continue;
		}

		const call = el as CallExpression;
		const callee = getCalleeName(call);
		if (callee === null) {
			out.push({kind: 'unsupported', reason: 'not-call-expression'});
			continue;
		}

		out.push({kind: 'call', callee, node: call});
	}

	return out;
};
