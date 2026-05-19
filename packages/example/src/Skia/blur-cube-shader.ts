import {glsl} from './skia-shader-utils';

export const cube: string = glsl`
// GL Transitions format
uniform float strength;

// Constants
const float PI = 3.141592653589793;

// Easing functions
float Linear_ease(in float begin, in float change, in float duration, in float time) {
    return change * time / duration + begin;
}

float Exponential_easeInOut(in float begin, in float change, in float duration, in float time) {
    if (time == 0.0)
        return begin;
    else if (time == duration)
        return begin + change;
    time /= (duration / 2.0);
    if (time < 1.0)
        return change / 2.0 * pow(2.0, 10.0 * (time - 1.0)) + begin;
    return change / 2.0 * (-pow(2.0, -10.0 * (time - 1.0)) + 2.0) + begin;
}

float Sinusoidal_easeInOut(in float begin, in float change, in float duration, in float time) {
    return -change / 2.0 * (cos(PI * time / duration) - 1.0) + begin;
}

// Random function
float random(vec3 xyz, in vec3 scale, in float seed) {
    return fract(sin(dot(xyz + seed, scale)) * 43758.5453 + seed);
}

// Mix textures with progress
vec4 transition(vec2 uv) {
    float p = progress * 0.7; // Adjusted progress
    vec2 center = vec2(Linear_ease(0.5, 0.0, 1.0, p), 0.5);
    float dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, p);


    float currentStrength = Sinusoidal_easeInOut(0.0, strength, 0.5, p);

    vec3 color = vec3(0.0);
    float total = 0.0;
    vec2 toCenter = center - uv;

    float offset = random(vec3(uv.xy, 0), vec3(12.9898, 78.233, 151.7182), 0.0) * 0.5;

    for (float t = 0.0; t <= 20.0; t++) {
        float percent = (t + offset) / 20.0;
        float weight = 1.0 * (percent - percent * percent);
        vec2 samplePoint = uv + toCenter * percent * currentStrength;
        color += mix(getFromColor(samplePoint).rgb, getToColor(samplePoint).rgb, dissolve) * weight;
        total += weight;
    }

    return vec4(color / total, 1.0);
}
`;
