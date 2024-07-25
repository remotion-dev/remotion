// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isClass(func: any) {
	// Class constructor is also a function
	if (!(func && func.constructor === Function) || func.prototype === undefined)
		return false;

	// This is a class that extends other class
	if (Function.prototype !== Object.getPrototypeOf(func)) return true;

	// Usually a function will only have 'constructor' in the prototype
	return Object.getOwnPropertyNames(func.prototype).length > 1;
}

export const ClassSerialization: React.FC = (props) => {
	// @ts-expect-error no types
	console.log(props.calculated);
	// @ts-expect-error no types
	if (isClass(props.calculated)) {
		throw new Error('should not result in a class');
	}

	return (
		<div>
			<h1>Class Deserialization</h1>
			<p>
				Is not supported in Remotion and will result in objects - even in the
				studio
			</p>
		</div>
	);
};
