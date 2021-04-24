import { extend } from '@react-three/fiber';
import { ShaderMaterial, ShaderMaterialParameters, Texture } from 'three';

export interface TexturedShaderMaterialParameters
	extends ShaderMaterialParameters {
	map?: Texture;
}

export class TexturedShaderMaterial extends ShaderMaterial {
	constructor(params?: TexturedShaderMaterialParameters) {
		super(params);
	}

	public get map(): Texture | null {
		return this.uniforms.map.value;
	}

	public set map(value: Texture | null) {
		this.uniforms.map.value = value;
	}
}

extend({ TexturedShaderMaterial });
