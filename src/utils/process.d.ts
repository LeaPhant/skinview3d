import { TextureCanvas, TextureSource, ModelType } from "./types.js";
export declare function loadSkinToCanvas(canvas: TextureCanvas, image: TextureSource): void;
export declare function loadCapeToCanvas(canvas: TextureCanvas, image: TextureSource): void;
export declare function inferModelType(canvas: TextureCanvas): ModelType;
