export const TEAR_WEBGPU_SHADER = /* wgsl */ `
struct Params {resolution: vec2f, angle: f32, progress: f32, rotation: f32, jaggedness: f32,}
struct VertexOutput {@builtin(position) position: vec4f, @location(0) uv: vec2f,}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@vertex fn vertex(@builtin(vertex_index) index: u32, @builtin(instance_index) instance: u32) -> VertexOutput {
 let aPos=vec2f(f32(index%2u),f32(index/2u)/192.0);
 let side=select(-1.0,1.0,instance!=0u);
 let direction=radians(params.angle);let dc=cos(direction);let ds=sin(direction);
 let toCanvas=mat2x2f(vec2f(dc,-ds),vec2f(ds,dc));
 let extent=vec2f(abs(dc)*params.resolution.x+abs(ds)*params.resolution.y,abs(ds)*params.resolution.x+abs(dc)*params.resolution.y);
 let outerEdge=select(0.0,extent.x,side>=0.0);
 let zigzag=1.0-4.0*abs(fract(aPos.y*6.0+0.25)-0.5);
 let seam=extent.x*0.5+zigzag*min(params.jaggedness,extent.x*0.45);
 let source=vec2f(mix(outerEdge,seam,aPos.x),aPos.y*extent.y);
 let sourceCanvas=toCanvas*(source-extent*0.5)+params.resolution*0.5;
 let tearProgress=min(params.progress,1.0);
 let tipY=tearProgress*extent.y;
 let pivot=vec2f(extent.x*0.5,tipY);
 let fullAngle=radians(params.rotation)*tearProgress;
 let bendHeight=max(extent.y*0.15,fullAngle*extent.x*1.5);
 let bend=smoothstep(0.0,bendHeight,tipY-source.y);
 let angle=side*fullAngle*bend;let c=cos(angle);let s=sin(angle);
 let delta=source-pivot;
 var position=pivot+vec2f(c*delta.x-s*delta.y,s*delta.x+c*delta.y);
 position.x+=side*max(params.progress-1.0,0.0)*extent.x*0.5;
 position=toCanvas*(position-extent*0.5)+params.resolution*0.5;
 var output: VertexOutput;
 // Mesh runtime restores orientation after resolving WebGL-compatible samples.
 output.position=vec4f(position.x/params.resolution.x*2.0-1.0,position.y/params.resolution.y*2.0-1.0,0,1);
 output.uv=sourceCanvas/params.resolution;
 return output;
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 if (any(input.uv<vec2f(0)) || any(input.uv>vec2f(1))) {discard;}
 return textureSample(sourceTexture,sourceSampler,input.uv);
}
`;
