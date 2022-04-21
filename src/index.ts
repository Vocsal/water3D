console.log("%cTypescript is currently in use.", 'color: white; background-color: orange; padding: 2px 5px; border-radius: 2px')

import 'src/css/common.scss';
import 'src/css/index.scss';

// 采用光线步进实现 水滴滴落
import RayMarching from 'src/js/RayMarching';
const rayMarching = new RayMarching("body", true);
rayMarching.init();

// glsl语言 学习
// import GlslLearn from "src/js/GlslLearn";
// const glslLearn = new GlslLearn("body", true);
// glslLearn.init();