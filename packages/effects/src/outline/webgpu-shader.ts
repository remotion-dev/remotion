import {WEBGPU_MULTIPASS_BINDINGS} from '../webgpu-multipass-runtime.js';

export const OUTLINE_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_MULTIPASS_BINDINGS}
struct Params {color: vec4f, width: f32, opacity: f32, outlineOnly: f32, polygon: f32,}
const MIN_ALPHA=0.5/255.0;
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let color=textureSampleLevel(source,sourceSampler,input.uv,0);
 let only=params.outlineOnly!=0.0;
 if (params.opacity<=0.0 || params.color.a<=0.0) {return select(color,vec4f(0),only);}
 if (params.width<=0.0 && !only) {return color;}
 var mask=0.0;
 if (params.polygon!=0.0) {
  mask=step(MIN_ALPHA,textureSampleLevel(secondary,sourceSampler,input.uv,0).a);
 } else if (params.width>0.0) {
  let size=vec2i(textureDimensions(source));
  let position=clamp(vec2i(input.uv*vec2f(size)),vec2i(0),size-1);
  for (var ring=1;ring<=3;ring++) {
   let distance=params.width*f32(ring)/3.0;
   for (var direction=0;direction<32;direction++) {
    let angle=6.283185307179586*f32(direction)/32.0;
    let offset=vec2i(round(vec2f(cos(angle),-sin(angle))*distance));
    let samplePosition=clamp(position+offset,vec2i(0),size-1);
    mask=max(mask,step(MIN_ALPHA,textureLoad(source,samplePosition,0).a));
   }
  }
 }
 if (only) {
  let alpha=select(max(step(MIN_ALPHA,color.a),mask),mask,params.polygon!=0.0)*params.color.a*params.opacity;
  return vec4f(params.color.rgb*alpha,alpha);
 }
 let alpha=mask*params.color.a*params.opacity*(1.0-color.a);
 return vec4f(color.rgb+params.color.rgb*alpha,color.a+alpha);
}
`;
