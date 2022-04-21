/**
 * @description glsl 学习
 * @link https://geek-docs.com/vulkan/glsl/glsl-vector.html
 */
//

import * as THREE from "three";
import Base from './Base'; 

// @ts-ignore
import vertexShader from "src/shaders/GlslLearn/vertex.glsl";
// @ts-ignore
import fragmentShader from "src/shaders/GlslLearn/fragment.glsl";


export default class GlslLearn extends Base {
    constructor(sel: string, debug: boolean = false) {
        super(sel, debug);
        this.cameraPosition = new THREE.Vector3(0, 0, 0);
    }

    init() {
        this.createScene();
        this.createOrthographicCamera();
        this.createRenderer();
        this.createShaderMaterial();
        this.createPlane();
        this.setLoop();
    }

    createShaderMaterial() {
        this.shaderMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
        })
    }

    createPlane() {
        const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
        const material = this.shaderMaterial;
        this.createMesh({
            geometry,
            material,
        })
    }

    update() {}
}