import {BlendFunction, Effect} from 'postprocessing';
import React, {forwardRef, useMemo} from 'react';
import {Uniform, Vector2} from 'three';

const fragmentShader = `
uniform vec2 offset;
uniform float radius;
uniform float angle;

void mainUv(inout vec2 uv) {
    vec2 cUV = uv * resolution - resolution / 2. - offset;
    float dist = length(cUV);
    if (dist < radius)
    {
        float percent = (radius - dist) / radius;
        float theta = percent * percent * angle * 8.0;
        float s = sin(theta);
        float c = cos(theta);
        cUV = vec2(dot(cUV, vec2(c, -s)), dot(cUV, vec2(s, c)));
    }
    uv = (cUV + offset + resolution / 2.) / resolution;
}
`;

export interface SwirlEffectOptions {
	offset?: Vector2 | [number, number];
	angle?: number;
	radius?: number;
}

/** Creates a swirl effect on the screen */
export class SwirlEffectImpl extends Effect {
	constructor(private readonly options: SwirlEffectOptions = {}) {
		super('SwirlEffect', fragmentShader, {
			blendFunction: BlendFunction.NORMAL,
			uniforms: new Map<keyof SwirlEffectOptions, Uniform>([
				['offset', new Uniform(new Vector2())],
				['angle', new Uniform(0)],
				['radius', new Uniform(0)],
			]),
		});
	}

	public update(): void {
		(this.uniforms.get('offset') as Uniform).value =
			this.options.offset || new Vector2();
		(this.uniforms.get('angle') as Uniform).value = this.options.angle || 0;
		(this.uniforms.get('radius') as Uniform).value = this.options.radius ?? 100;
	}
}

export const SwirlEffect = forwardRef(
	(
		{offset, angle, radius}: SwirlEffectOptions,
		ref: React.ForwardedRef<'primitive'>
	) => {
		const effect = useMemo(() => new SwirlEffectImpl({offset, angle, radius}), [
			offset,
			angle,
			radius,
		]);
		return <primitive ref={ref} object={effect} dispose={null} />;
	}
);
