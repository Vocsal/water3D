/**
 * @link https://alphardex.github.io/gateofbabylon/posts/9615/
 */
//

import * as THREE from "three";
import * as dat from "dat.gui";
import Base from './Base';

// @ts-ignore
import rayMarchingVertexShader from "../shaders/RayMarching/vertex.glsl";
// @ts-ignore
import rayMarchingFragmentShader from "../shaders/RayMarching/fragment.glsl";

const matcapTextureUrl = "https://i.loli.net/2021/02/27/7zhBySIYxEqUFW3.png";

export default class RayMarching extends Base {

    clock!: THREE.Clock;
    rayMarchingMaterial: THREE.ShaderMaterial;

    constructor(sel: string, debug: boolean) {
        super(sel, debug);

        this.clock = new THREE.Clock();
        this.cameraPosition = new THREE.Vector3(0, 0, 0);
    }

    init() {
        this.createScene();
        this.createOrthographicCamera(); // 创建正交摄像机
        this.createRenderer();
        this.createRayMarchingMaterial();
        this.createPlane();
        // this.createLight();
        // this.trackMousePos();
        this.addListeners();
        this.setLoop();
        this.debug && this.createDebugPanel();
    }

    // 创建光线追踪材质
    createRayMarchingMaterial() {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(matcapTextureUrl);
        const rayMarchingMaterial = new THREE.ShaderMaterial({
            vertexShader: rayMarchingVertexShader,
            fragmentShader: rayMarchingFragmentShader,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: {
                    value: 0,
                },
                // uMouse: {
                //     value: new THREE.Vector2(0, 0),
                // },
                uResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
                },
                uTexture: {
                    value: texture,
                },
                uProgress: {
                    value: 1,
                },
                uVelocityBox: {
                    value: 0.25,
                },
                uVelocitySphere: {
                    value: 0.5,
                },
                uAngle: {
                    value: 1.5,
                },
                uDistance: {
                    value: 1.2,
                }
            }
        });
        this.rayMarchingMaterial = rayMarchingMaterial;
        this.shaderMaterial = rayMarchingMaterial;
    }

    // 创建平面
    createPlane() {
        const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
        const material = this.rayMarchingMaterial;
        this.createMesh({
            geometry,
            material
        })
    }

    // 动画
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        // const mousePos = this.mousePos;
        if (this.rayMarchingMaterial) {
            this.rayMarchingMaterial.uniforms.uTime.value = elapsedTime;
            // this.rayMarchingMaterial.uniforms.uMouse.value = mousePos;
        }
    }

    // 创建调试面板
    createDebugPanel() {
        const { rayMarchingMaterial } = this;
        const gui = new dat.GUI({ width: 300 });
        gui
            .add(rayMarchingMaterial.uniforms.uProgress, "value")
            .min(0)
            .max(1)
            .step(0.01)
            .name("progress");
        gui
            .add(rayMarchingMaterial.uniforms.uVelocityBox, "value")
            .min(0)
            .max(1)
            .step(0.01)
            .name("velocityBox");
        gui
            .add(rayMarchingMaterial.uniforms.uVelocitySphere, "value")
            .min(0)
            .max(1)
            .step(0.01)
            .name("velocitySphere");
        gui
            .add(rayMarchingMaterial.uniforms.uAngle, "value")
            .min(0)
            .max(2)
            .step(0.01)
            .name("angle");
        gui
            .add(rayMarchingMaterial.uniforms.uDistance, "value")
            .min(0)
            .max(2)
            .step(0.01)
            .name("distance");
    }
}