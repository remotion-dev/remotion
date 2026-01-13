import type {EasingType, TimingComponent} from './types';

export const HARDCODED_FPS = 60;

const framesToFpsExpr = (frames: number): string => {
	const seconds = frames / HARDCODED_FPS;
	const rounded = Number(seconds.toFixed(2));
	return `${rounded} * fps`;
};

const getEasingCode = (easing: EasingType): string => {
	switch (easing) {
		case 'linear':
			return 'Easing.linear';
		case 'ease':
			return 'Easing.ease';
		case 'ease-in-quad':
			return 'Easing.in(Easing.quad)';
		case 'ease-out-quad':
			return 'Easing.out(Easing.quad)';
		case 'ease-in-out-quad':
			return 'Easing.inOut(Easing.quad)';
		case 'ease-in-cubic':
			return 'Easing.in(Easing.cubic)';
		case 'ease-out-cubic':
			return 'Easing.out(Easing.cubic)';
		case 'ease-in-out-cubic':
			return 'Easing.inOut(Easing.cubic)';
		case 'ease-in-sin':
			return 'Easing.in(Easing.sin)';
		case 'ease-out-sin':
			return 'Easing.out(Easing.sin)';
		case 'ease-in-out-sin':
			return 'Easing.inOut(Easing.sin)';
		case 'ease-in-exp':
			return 'Easing.in(Easing.exp)';
		case 'ease-out-exp':
			return 'Easing.out(Easing.exp)';
		case 'ease-in-out-exp':
			return 'Easing.inOut(Easing.exp)';
		case 'ease-in-circle':
			return 'Easing.in(Easing.circle)';
		case 'ease-out-circle':
			return 'Easing.out(Easing.circle)';
		case 'ease-in-out-circle':
			return 'Easing.inOut(Easing.circle)';
		case 'ease-in-bounce':
			return 'Easing.in(Easing.bounce)';
		case 'ease-out-bounce':
			return 'Easing.out(Easing.bounce)';
		case 'ease-in-out-bounce':
			return 'Easing.inOut(Easing.bounce)';
		default:
			return 'Easing.linear';
	}
};

const generateSpringCode = (
	component: TimingComponent,
	varName: string,
): string => {
	if (component.config.type !== 'spring') {
		throw new Error('Expected spring config');
	}

	const {springConfig, reverse, durationInFrames, delay} = component.config;
	const {damping, mass, stiffness, overshootClamping} = springConfig;

	const configLines: string[] = [];

	if (mass !== 1) {
		configLines.push(`    mass: ${mass},`);
	}

	if (damping !== 10) {
		configLines.push(`    damping: ${damping},`);
	}

	if (stiffness !== 100) {
		configLines.push(`    stiffness: ${stiffness},`);
	}

	if (overshootClamping) {
		configLines.push(`    overshootClamping: true,`);
	}

	const lines: string[] = [`const ${varName} = spring({`, '  frame,', '  fps,'];

	if (configLines.length > 0) {
		lines.push('  config: {');
		lines.push(...configLines);
		lines.push('  },');
	}

	if (durationInFrames !== null) {
		lines.push(`  durationInFrames: ${framesToFpsExpr(durationInFrames)},`);
	}

	if (delay > 0) {
		lines.push(`  delay: ${framesToFpsExpr(delay)},`);
	}

	if (reverse) {
		lines.push('  reverse: true,');
	}

	lines.push('});');

	return lines.join('\n');
};

const generateInterpolateCode = (
	component: TimingComponent,
	varName: string,
): string => {
	if (component.config.type !== 'interpolate') {
		throw new Error('Expected interpolate config');
	}

	const {easing, durationInFrames, delay} = component.config;
	const easingCode = getEasingCode(easing);

	const frameExpr = delay > 0 ? `frame - ${framesToFpsExpr(delay)}` : 'frame';

	const lines: string[] = [
		`const ${varName} = interpolate(`,
		`  ${frameExpr},`,
		`  [0, ${framesToFpsExpr(durationInFrames)}],`,
		'  [0, 1],',
		'  {',
		`    easing: ${easingCode},`,
		"    extrapolateLeft: 'clamp',",
		"    extrapolateRight: 'clamp',",
		'  }',
		');',
	];

	return lines.join('\n');
};

const generateSineCode = (
	component: TimingComponent,
	varName: string,
): string => {
	if (component.config.type !== 'sine') {
		throw new Error('Expected sine config');
	}

	const {durationInFrames, amplitude, frequency, frameOffset} =
		component.config;

	const frameExpr =
		frameOffset !== 0 ? `(frame + ${framesToFpsExpr(frameOffset)})` : 'frame';
	const amplitudeStr = amplitude !== 1 ? `${amplitude} * ` : '';

	return `const ${varName} = ${amplitudeStr}Math.sin((2 * Math.PI * ${frequency} * ${frameExpr}) / ${framesToFpsExpr(durationInFrames)});`;
};

export type GeneratedCode = {
	imports: string;
	code: string;
};

export const generateCode = (components: TimingComponent[]): GeneratedCode => {
	if (components.length === 0) {
		return {
			imports: '',
			code: '// No timing components configured',
		};
	}

	const hasSpring = components.some((c) => c.config.type === 'spring');
	const hasInterpolate = components.some(
		(c) => c.config.type === 'interpolate',
	);
	const needsEasing =
		hasInterpolate &&
		components.some(
			(c) => c.config.type === 'interpolate' && c.config.easing !== 'linear',
		);

	// Generate imports
	const importsList: string[] = [];
	if (hasSpring) {
		importsList.push('spring');
	}

	if (hasInterpolate) {
		importsList.push('interpolate');
	}

	if (needsEasing) {
		importsList.push('Easing');
	}

	const imports =
		importsList.length > 0
			? `import {${importsList.join(', ')}} from 'remotion';`
			: '';

	// Generate variable declarations
	const varDeclarations: string[] = [];
	const varNames: string[] = [];

	components.forEach((component, index) => {
		const varName = `value${index + 1}`;
		varNames.push(varName);

		if (component.config.type === 'spring') {
			varDeclarations.push(generateSpringCode(component, varName));
		} else if (component.config.type === 'interpolate') {
			varDeclarations.push(generateInterpolateCode(component, varName));
		} else {
			varDeclarations.push(generateSineCode(component, varName));
		}
	});

	// Generate total line with mixing modes
	let totalExpr = varNames[0];
	for (let i = 1; i < components.length; i++) {
		const {mixingMode} = components[i];
		const operator = mixingMode === 'subtractive' ? '-' : '+';
		totalExpr += ` ${operator} ${varNames[i]}`;
	}

	const totalLine =
		components.length > 1 ? `\nconst total = ${totalExpr};` : '';

	// Combine code parts
	const codeParts: string[] = [...varDeclarations];
	if (totalLine) {
		codeParts.push(totalLine);
	}

	return {
		imports,
		code: codeParts.join('\n'),
	};
};
