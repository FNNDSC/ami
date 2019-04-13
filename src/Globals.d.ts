import * as _three from "three";

declare global {
    const THREE: typeof _three;
}
export {};

// declare module '*.glsl' {
//     const content: string;
//     export = content;
// }
// declare module '*.vert' {
//     const content: string;
//     export = content;
// }
// declare module '*.frag' {
//     const content: string;
//     export = content;
// }

// declare module 'raw-loader!*' {
//     const contents: string
//     export = contents
// }

// declare module 'glslify-loader!*' {
//     const contents: string
//     export = contents
// }