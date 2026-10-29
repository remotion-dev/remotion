export const SHATTER_WEBGPU_SHADER = /* wgsl */ `
struct Params {resolution: vec2f,}
struct VertexOutput {
 @builtin(position) position: vec4f,
 @location(0) uv: vec2f,
 @location(1) shade: f32,
 @location(2) side: f32,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var<storage, read> vertices: array<f32>;
@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput {
 let offset=index*7u;
 let point=vec3f(vertices[offset],vertices[offset+1u],vertices[offset+2u]);
 let distance=max(params.resolution.x,params.resolution.y)*2.0;
 let near=distance*0.05;
 let w=distance+point.z;
 let position=vec2f((point.x-params.resolution.x*0.5)*2.0/params.resolution.x,(params.resolution.y*0.5-point.y)*2.0/params.resolution.y);
 var output: VertexOutput;
 // WebGPU's clip depth is [0,w], corresponding to WebGL's [-w,w].
 output.position=vec4f(position*vec2f(1,-1)*distance,w-near,w);
 output.uv=vec2f(vertices[offset+3u],vertices[offset+4u]);
 output.shade=vertices[offset+5u];output.side=vertices[offset+6u];
 return output;
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let color=textureSample(source,sourceSampler,input.uv);
 return vec4f(mix(color.rgb,vec3f(color.a),input.side)*input.shade,color.a);
}
`;
