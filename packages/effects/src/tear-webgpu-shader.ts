export const TEAR_WEBGPU_SHADER = /* wgsl */ `
struct Params {resolution: vec2f, angle: f32, progress: f32, rotation: f32, jaggedness: f32, contentRect: vec4f,}
struct VertexOutput {@builtin(position) position: vec4f, @location(0) uv: vec2f,}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@vertex fn vertex(@builtin(vertex_index) index: u32, @builtin(instance_index) instance: u32) -> VertexOutput {
 let aPos=vec2f(f32(index%2u),(f32(index/2u)-1.0)/192.0);
 let padded=any(params.contentRect.zw!=params.resolution);
 let side=select(-1.0,1.0,select(instance!=0u,instance>=2u,padded));
 let paddingStrip=padded && instance%2u==0u;
 let direction=radians(params.angle);let dc=cos(direction);let ds=sin(direction);
 let toCanvas=mat2x2f(vec2f(dc,-ds),vec2f(ds,dc));
 let projectedSize=mat2x2f(vec2f(abs(dc),abs(ds)),vec2f(abs(ds),abs(dc)));
 let extent=projectedSize*params.contentRect.zw;
 let center=params.contentRect.xy+params.contentRect.zw*0.5;
 let textureExtent=projectedSize*params.resolution;
 let textureMid=extent*0.5+transpose(toCanvas)*(params.resolution*0.5-center);
 let low=textureMid-textureExtent*0.5;
 let high=textureMid+textureExtent*0.5;
 let row=select(select(aPos.y,high.y/extent.y,aPos.y>1.0),low.y/extent.y,aPos.y<0.0);
 let elementEdge=select(0.0,extent.x,side>=0.0);
 let textureEdge=select(low.x,high.x,side>=0.0);
 let outerEdge=select(elementEdge,textureEdge,paddingStrip);
 let zigzag=1.0-4.0*abs(fract(row*6.0+0.25)-0.5);
 let seam=extent.x*0.5+zigzag*min(params.jaggedness,extent.x*0.45);
 let source=vec2f(mix(outerEdge,select(seam,elementEdge,paddingStrip),aPos.x),row*extent.y);
 let sourceCanvas=toCanvas*(source-extent*0.5)+center;
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
 position=toCanvas*(position-extent*0.5)+center;
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
