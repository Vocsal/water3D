/**
 * @description three.js 的模板
 * @author alphardex
 * @link https://github.com/alphardex/threejs-playground/blob/main/src/scenes/base.ts
 */

import * as THREE from "three";
import ky from "node_modules/kyouka/dist/kyouka";
import { MeshObject } from "src/types/index";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import Stats from "three/examples/jsm/libs/stats.module";
// import * as dat from "dat.gui";

// 计算dom元素的宽高比例
const calcAspect = (el: HTMLElement) => el.clientWidth / el.clientHeight;

const getNormalizedMousePos = (e: MouseEvent | Touch): Record<string, number> => {
    return {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
    };
};

// three.js 基础类
export default class Base {
    debug: boolean; // 是否开启debug
    container: HTMLElement | null; // 容器
    scene!: THREE.Scene; // 场景
    camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera; // 相机 透视 | 正交
    perspectiveCameraParams!: Record<string, any>; // 透视相机参数
    orthographicCameraParams!: Record<string, any>; // 正交相机参数
    cameraPosition!: THREE.Vector3; // 相机位置
    lookAtPosition!: THREE.Vector3; // 相机朝向
    rendererParams!: Record<string, any>; // 渲染器参数
    renderer!: THREE.WebGLRenderer; // 渲染器
    controls!: OrbitControls; // 控制器
    raycaster!: THREE.Raycaster; // 光线投射
    sound!: THREE.Audio; // 声音
    stats!: Stats; // 查看渲染性能工具
    composer!: EffectComposer; // 后期处理
    shaderMaterial!: THREE.ShaderMaterial; // 着色器材质
    mousePos!: THREE.Vector2; // 鼠标位置
    mouseSpeed!: number; // 鼠标速度

    constructor(sel: string, debug = false) {
        this.debug = debug;
        this.container = document.querySelector(sel);
        this.perspectiveCameraParams = {
            fov: 75,
            near: 0.1,
            far: 100
        };
        this.orthographicCameraParams = {
            zoom: 2,
            near: -100,
            far: 1000
        };
        this.cameraPosition = new THREE.Vector3(0, 3, 10);
        this.lookAtPosition = new THREE.Vector3(0, 0, 0);
        this.rendererParams = {
            outputEncoding: THREE.LinearEncoding,
            config: {
                alpha: true, // canvas是否包含alpha(透明度)
                antialias: true // 是否执行抗锯齿
            }
        };
        this.mousePos = new THREE.Vector2(0, 0);
        this.mouseSpeed = 0;
    }

    // 初始化
    init() {
        this.createScene(); // 创建场景
        this.createPerspectiveCamera(); // 创建透视相机
        this.createRenderer(); // 创建渲染器
        this.createMesh({}); // 创建物体
        this.createLight(); // 创建光
        this.createOrbitControls(); // 创建轨道控制器
        this.addListeners(); // 添加监听器
        this.setLoop(); // 设置循环
    }

    // 创建场景
    createScene() {
        const scene = new THREE.Scene(); // 场景，一个容器，用于渲染器渲染
        if (this.debug) {
            scene.add(new THREE.AxesHelper());
            const stats = Stats();
            this.container!.appendChild(stats.dom);
            this.stats = stats;
        }
        this.scene = scene;
    }

    // 创建透视相机
    createPerspectiveCamera() {
        const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
        const { fov, near, far } = perspectiveCameraParams;
        const aspect = calcAspect(this.container!); // 计算容器的宽高比例
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    }

    // 创建正交相机
    createOrthographicCamera() {
        const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
        const { left, right, top, bottom, near, far } = orthographicCameraParams;
        const camera = new THREE.OrthographicCamera(
            left,
            right,
            top,
            bottom,
            near,
            far
        );
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    }

    // 更新正交相机参数
    updateOrthographicCameraParams() {
        // 在容器变化的时候
        const { container } = this;
        const { zoom, near, far } = this.orthographicCameraParams;
        const aspect = calcAspect(container!);
        this.orthographicCameraParams = {
            left: -zoom * aspect,
            right: zoom * aspect,
            top: zoom,
            bottom: -zoom,
            near,
            far,
            zoom
        };
    }

    // 创建渲染器
    createRenderer(useWebGL1 = false) {
        const { rendererParams } = this;
        const { outputEncoding, config } = rendererParams;
        const renderer = !useWebGL1
            ? new THREE.WebGLRenderer(config)
            : new THREE.WebGL1Renderer(config);
        renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
        renderer.outputEncoding = outputEncoding;
        this.resizeRendererToDisplaySize();
        this.container?.appendChild(renderer.domElement);
        this.renderer = renderer;
        this.renderer.setClearColor(0x000000, 0);
    }

    // 允许投影
    enableShadow() {
        this.renderer.shadowMap.enabled = true;
    }
    
    // 调整渲染器尺寸
    resizeRendererToDisplaySize(): Boolean {
        const { renderer } = this;
        if (!renderer) {
            return;
        }
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const { clientWidth, clientHeight } = canvas;
        const width = (clientWidth * pixelRatio) | 0;
        const height = (clientHeight * pixelRatio) | 0;
        const isResizeNeeded = canvas.width !== width || canvas.height !== height;
        if (isResizeNeeded) {
            renderer.setSize(width, height, false);
        }
        return isResizeNeeded;
    }

    // 创建网格
    createMesh(
        meshObject: MeshObject,
        container: THREE.Scene | THREE.Mesh = this.scene
    ): THREE.Mesh {
        const {
            geometry = new THREE.BoxGeometry(1, 1, 1),
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color("#d9dfc8")
            }),
            position = new THREE.Vector3(0, 0, 0)
        } = meshObject;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        container.add(mesh);
        return mesh;
    }

    // 创建光源
    createLight() {
        const dirLight = new THREE.DirectionalLight(
            new THREE.Color("#ffffff"),
            0.5
        );
        dirLight.position.set(0, 50, 0);
        this.scene.add(dirLight);
        const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
        this.scene.add(ambiLight);
    }

    // 创建轨道控制
    createOrbitControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        const { lookAtPosition } = this;
        controls.target.copy(lookAtPosition);
        controls.update();
        this.controls = controls;
    }

    // 监听事件
    addListeners() {
        this.onResize();
    }

    // 监听画面缩放
    onResize() {
        window.addEventListener("resize", (e) => {
            if (this.shaderMaterial) {
                this.shaderMaterial.uniforms.uResolution.value.x = window.innerWidth;
                this.shaderMaterial.uniforms.uResolution.value.y = window.innerHeight;
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            } else {
                if (this.camera instanceof THREE.PerspectiveCamera) {
                    const aspect = calcAspect(this.container!);
                    const camera = this.camera as THREE.PerspectiveCamera;
                    camera.aspect = aspect;
                    camera.updateProjectionMatrix(); // 相机属性改变后，调用此方法对属性的更改生效
                } else if (this.camera instanceof THREE.OrthographicCamera) {
                    this.updateOrthographicCameraParams();
                    const camera = this.camera as THREE.OrthographicCamera;
                    const {
                        left,
                        right,
                        top,
                        bottom,
                        near,
                        far
                    } = this.orthographicCameraParams;
                    camera.left = left;
                    camera.right = right;
                    camera.top = top;
                    camera.bottom = bottom;
                    camera.near = near;
                    camera.far = far;
                    camera.updateProjectionMatrix();
                }
                this.renderer.setSize(
                    this.container!.clientWidth,
                    this.container!.clientHeight
                );
            }
        });
    }

    // 动画
    update() {
        // 继承类复写此方法
        console.log("animation");
    }

    // 渲染
    setLoop() {
        this.renderer.setAnimationLoop(() => {
            // 选一个渲染帧的回调函数
            this.resizeRendererToDisplaySize();
            this.update();
            if (this.controls) {
                this.controls.update();
            }
            if (this.stats) {
                this.stats.update();
            }
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        });
    }

    // 创建文本
    createText(
        text = "",
        config: THREE.TextGeometryParameters,
        material: THREE.Material = new THREE.MeshStandardMaterial({
            color: "#ffffff"
        })
    ) {
        const geo = new THREE.TextGeometry(text, config);
        const mesh = new THREE.Mesh(geo, material);
        return mesh;
    }

    // 创建音效源
    createAudioSource() {
        const listener = new THREE.AudioListener();
        this.camera.add(listener);
        const sound = new THREE.Audio(listener);
        this.sound = sound;
    }

    // 加载音效
    loadAudio(url: string): Promise<AudioBuffer> {
        const loader = new THREE.AudioLoader();
        return new Promise((resolve) => {
            loader.load(url, (buffer) => {
                this.sound.setBuffer(buffer);
                resolve(buffer);
            });
        });
    }

    // 加载模型
    loadModel(url: string): Promise<THREE.Object3D> {
        const loader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    console.log(model);
                    resolve(model);
                },
                undefined,
                (err) => {
                    console.log(err);
                    reject();
                }
            );
        });
    }

    // 加载FBX模型
    loadFBXModel(url: string): Promise<THREE.Object3D> {
        const loader = new FBXLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (obj) => {
                    resolve(obj);
                },
                undefined,
                (err) => {
                    console.log(err);
                    reject();
                }
            );
        });
    }

    // 加载字体
    loadFont(url: string): Promise<THREE.Font> {
        const loader = new THREE.FontLoader();
        return new Promise((resolve) => {
            loader.load(url, (font) => {
                resolve(font);
            });
        });
    }

    // 创建点选模型
    createRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.trackMousePos();
    }

    // 追踪鼠标位置
    trackMousePos() {
        window.addEventListener("mousemove", (e) => {
            this.setMousePos(e);
        });
        window.addEventListener(
            "touchstart",
            (e: TouchEvent) => {
                this.setMousePos(e.touches[0]);
            },
            { passive: false }
        );
        window.addEventListener("touchmove", (e: TouchEvent) => {
            this.setMousePos(e.touches[0]);
        });
    }

    // 设置鼠标位置
    setMousePos(e: MouseEvent | Touch) {
        const { x, y } = getNormalizedMousePos(e);
        this.mousePos.x = x;
        this.mousePos.y = y;
    }

    // 获取点击物
    getInterSects(container = this.scene): THREE.Intersection[] {
        this.raycaster.setFromCamera(this.mousePos, this.camera);
        const intersects = this.raycaster.intersectObjects(
            container.children,
            true
        );
        return intersects;
    }

    // 选中点击物时
    onChooseIntersect(target: THREE.Object3D, container = this.scene) {
        const intersects = this.getInterSects(container);
        const intersect = intersects[0];
        if (!intersect || !intersect.face) {
            return null;
        }
        const { object } = intersect;
        return target === object ? intersect : null;
    }
    
    // 获取跟屏幕同像素的fov角度
    getScreenFov() {
        return ky.rad2deg(
            2 * Math.atan(window.innerHeight / 2 / this.cameraPosition.z)
        );
    }

    // 获取重心坐标系
    getBaryCoord(bufferGeometry: THREE.BufferGeometry) {
        // https://gist.github.com/mattdesl/e399418558b2b52b58f5edeafea3c16c
        const length = bufferGeometry.attributes.position.array.length;
        const count = length / 3;
        const bary = [];
        for (let i = 0; i < count; i++) {
            bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
        }
        const aCenter = new Float32Array(bary);
        bufferGeometry.setAttribute(
            "aCenter",
            new THREE.BufferAttribute(aCenter, 3)
        );
    }

    // 追踪鼠标速度
    trackMouseSpeed() {
        // https://stackoverflow.com/questions/6417036/track-mouse-speed-with-js
        let lastMouseX = -1;
        let lastMouseY = -1;
        let mouseSpeed = 0;
        window.addEventListener("mousemove", (e) => {
            const mousex = e.pageX;
            const mousey = e.pageY;
            if (lastMouseX > -1) {
                mouseSpeed = Math.max(
                    Math.abs(mousex - lastMouseX),
                    Math.abs(mousey - lastMouseY)
                );
                this.mouseSpeed = mouseSpeed / 100;
            }
            lastMouseX = mousex;
            lastMouseY = mousey;
        });
        document.addEventListener("mouseleave", () => {
            this.mouseSpeed = 0;
        });
    }

    // 使用PCFSoft阴影
    usePCFSoftShadowMap() {
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // 使用VSM阴影
    useVSMShadowMap() {
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
    }
    
    // 将相机的方向设为z轴
    setCameraUpZ() {
        this.camera.up.set(0, 0, 1);
    }
}



// // 顶点着色器模板
// const templateVertexShader = `
// varying vec2 vUv;
// varying vec3 vPosition;

// void main(){
//     vec4 modelPosition=modelMatrix*vec4(position,1.);
//     vec4 viewPosition=viewMatrix*modelPosition;
//     vec4 projectedPosition=projectionMatrix*viewPosition;
//     gl_Position=projectedPosition;
    
//     vUv=uv;
//     vPosition=position;
// }
// `;

// // 片元着色器模板
// const templateFragmentShader = `
// uniform float uTime;
// uniform vec2 uMouse;
// uniform vec2 uResolution;

// varying vec2 vUv;
// varying vec3 vPosition;

// void main(){
//     vec3 color=vec3(vUv.x,vUv.y,1.);
//     gl_FragColor=vec4(color,1.);
// }
// `;

// class Template extends Base {
//     clock!: THREE.Clock;
//     templateMaterial!: THREE.ShaderMaterial;
//     constructor(sel: string, debug: boolean) {
//         super(sel, debug);
//         this.clock = new THREE.Clock();
//         this.cameraPosition = new THREE.Vector3(0, 0, 1);
//     }
//     // 初始化
//     init() {
//         this.createScene();
//         this.createPerspectiveCamera();
//         this.createRenderer();
//         this.createTemplateMaterial();
//         this.createPlane();
//         this.createLight();
//         this.trackMousePos();
//         this.createOrbitControls();
//         this.addListeners();
//         this.setLoop();
//     }
//     // 创建材质
//     createTemplateMaterial() {
//         const templateMaterial = new THREE.ShaderMaterial({
//             vertexShader: templateVertexShader,
//             fragmentShader: templateFragmentShader,
//             side: THREE.DoubleSide,
//             uniforms: {
//                 uTime: {
//                     value: 0
//                 },
//                 uMouse: {
//                     value: new THREE.Vector2(0, 0)
//                 },
//                 uResolution: {
//                     value: new THREE.Vector2(window.innerWidth, window.innerHeight)
//                 }
//             }
//         });
//         this.templateMaterial = templateMaterial;
//     }
//     // 创建平面
//     createPlane() {
//         const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
//         const material = this.templateMaterial;
//         this.createMesh({
//             geometry,
//             material
//         });
//     }
//     // 动画
//     update() {
//         const elapsedTime = this.clock.getElapsedTime();
//         const mousePos = this.mousePos;
//         if (this.templateMaterial) {
//             this.templateMaterial.uniforms.uTime.value = elapsedTime;
//             this.templateMaterial.uniforms.uMouse.value = mousePos;
//         }
//     }
// }

// const start = () => {
//     const template = new Template(".template", false);
//     template.init();
// };

// start();