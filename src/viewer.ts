import { applyMixins, CapeContainer, ModelType, SkinContainer } from "skinview-utils";
import { NearestFilter, PerspectiveCamera, Scene, Texture, Vector2, WebGLRenderer } from "three";
import { RootAnimation } from "./animation.js";
import { PlayerObject } from "./model.js";

export type LoadOptions = {
	makeVisible?: boolean;
};

function toMakeVisible(options?: LoadOptions): boolean {
	if (options && options.makeVisible === false) {
		return false;
	}
	return true;
}

class SkinViewer {

	readonly scene: Scene;
	readonly camera: PerspectiveCamera;
	readonly renderer: WebGLRenderer;
	readonly playerObject: PlayerObject;
	readonly animations: RootAnimation = new RootAnimation();

	protected readonly skinCanvas: HTMLCanvasElement;
	protected readonly capeCanvas: HTMLCanvasElement;
	private readonly skinTexture: Texture;
	private readonly capeTexture: Texture;

	private _disposed: boolean = false;
	private _renderPaused: boolean = false;

	constructor(readonly domElement: Node) {
		// texture
		this.skinCanvas = document.createElement("canvas");
		this.skinTexture = new Texture(this.skinCanvas);
		this.skinTexture.magFilter = NearestFilter;
		this.skinTexture.minFilter = NearestFilter;

		this.capeCanvas = document.createElement("canvas");
		this.capeTexture = new Texture(this.capeCanvas);
		this.capeTexture.magFilter = NearestFilter;
		this.capeTexture.minFilter = NearestFilter;

		// scene
		this.scene = new Scene();

		// Use smaller fov to avoid distortion
		this.camera = new PerspectiveCamera(40);
		this.camera.position.y = -12;
		this.camera.position.z = 60;

		this.renderer = new WebGLRenderer({ alpha: true });
		this.domElement.appendChild(this.renderer.domElement);

		this.playerObject = new PlayerObject(this.skinTexture, this.capeTexture);
		this.playerObject.name = "player";
		this.playerObject.skin.visible = false;
		this.playerObject.cape.visible = false;
		this.scene.add(this.playerObject);

		window.requestAnimationFrame(() => this.draw());
	}

	protected skinLoaded(model: ModelType, options?: LoadOptions): void {
		this.skinTexture.needsUpdate = true;
		this.playerObject.skin.modelType = model;
		if (toMakeVisible(options)) {
			this.playerObject.skin.visible = true;
		}
	}

	protected capeLoaded(options?: LoadOptions): void {
		this.capeTexture.needsUpdate = true;
		if (toMakeVisible(options)) {
			this.playerObject.cape.visible = true;
		}
	}

	private draw(): void {
		if (this.disposed || this._renderPaused) {
			return;
		}
		this.animations.runAnimationLoop(this.playerObject);
		this.doRender();
		window.requestAnimationFrame(() => this.draw());
	}

	protected doRender(): void {
		this.renderer.render(this.scene, this.camera);
	}

	setSize(width: number, height: number): void {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	dispose(): void {
		this._disposed = true;
		this.domElement.removeChild(this.renderer.domElement);
		this.renderer.dispose();
		this.skinTexture.dispose();
		this.capeTexture.dispose();
	}

	get disposed(): boolean {
		return this._disposed;
	}

	get renderPaused(): boolean {
		return this._renderPaused;
	}

	set renderPaused(value: boolean) {
		const toResume = !this.disposed && !value && this._renderPaused;
		this._renderPaused = value;
		if (toResume) {
			window.requestAnimationFrame(() => this.draw());
		}
	}

	get width(): number {
		return this.renderer.getSize(new Vector2()).width;
	}

	set width(newWidth: number) {
		this.setSize(newWidth, this.height);
	}

	get height(): number {
		return this.renderer.getSize(new Vector2()).height;
	}

	set height(newHeight: number) {
		this.setSize(this.width, newHeight);
	}
}
interface SkinViewer extends SkinContainer<LoadOptions>, CapeContainer<LoadOptions> { }
applyMixins(SkinViewer, [SkinContainer, CapeContainer]);
export { SkinViewer };
