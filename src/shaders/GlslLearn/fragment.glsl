// 片元着色器

varying vec2 vUv;
varying vec3 vPosition;

vec3 background(vec2 uv) {
    vec3 bg = vec3(uv.r, uv.r, uv.r);
    return bg;
}

void main() {
    vec3 bg = background(vUv);
    vec3 color = bg;
    // vec3 color = vPosition;
    gl_FragColor = vec4(color, 1.);
}