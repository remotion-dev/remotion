import { ShaderMaterial, ShaderMaterialParameters, Texture } from 'three';
import { extend, MaterialNode } from '@react-three/fiber';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            texturedShaderMaterial: MaterialNode<TexturedShaderMaterial, [TexturedShaderMaterialParameters]>;
        }
    }
}

export interface TexturedShaderMaterialParameters extends ShaderMaterialParameters {
    map?: Texture;
}

export default class TexturedShaderMaterial extends ShaderMaterial {

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
