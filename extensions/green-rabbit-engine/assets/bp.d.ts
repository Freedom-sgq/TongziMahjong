/**
 * @description creator.d.ts 扩展
 */
declare namespace cc {
	/**
	 * cc.v4
	 */
	function v4(x?: number | any, y?: number, z?: number, w?: number): Vec4;

	/**
	 * cc.SpriteFrame
	 */
	interface SpriteFrame {
		uv: Array<float>;
	}

	/**
	 * cc.Node
	 */
	interface Node {
		getWorldScale(out: cc.Vec3): void;
	}

	interface Label {
		_frame: any;
	}

	/**
	 * RenderTexutre
	 */
	interface RenderTexture {
		drawTextureAt: (texture: Texture2D, x: number, y: number) => void;
	}

	/**
	 * 
	 */
	namespace Texture2D {
		enum PixelFormat {
			RGBA_ASTC_4x4 = 0,
			RGBA_ASTC_5x4 = 0,
			RGBA_ASTC_5x5 = 0,
			RGBA_ASTC_6x5 = 0,
			RGBA_ASTC_6x6 = 0,
			RGBA_ASTC_8x5 = 0,
			RGBA_ASTC_8x6 = 0,
			RGBA_ASTC_8x8 = 0,
			RGBA_ASTC_10x5 = 0,
			RGBA_ASTC_10x6 = 0,
			RGBA_ASTC_10x8 = 0,
			RGBA_ASTC_10x10 = 0,
			RGBA_ASTC_12x10 = 0,
			RGBA_ASTC_12x12 = 0,
		}
	}

	/**
	 * cc.Assembler 定义
	 */
	class Assembler {
		static register(renderCompCtor, assembler);
		static init(comp: cc.RenderComponent);

		public _renderComp: cc.RenderComponent;
		public _renderData: cc.RenderData;
		public floatsPerVert: number;
		public colorOffset: number;
		public init(comp: cc.RenderComponent);
		public getVfmt();

		public updateRenderData(comp: cc.RenderComponent);
		public fillBuffers(comp: cc.RenderComponent, renderer);
	}

	/**
	 * cc.RenderData 定义
	 */
	class RenderData {
		init(assembler: cc.Assembler);
		createQuadData(index, verticesFloats, indicesCount);
		createFlexData(index, verticesFloats, indicesCount, vfmt): cc.FlexBuffer;
		initQuadIndices(idata);

		vDatas;
		uintVDatas;
		iDatas;
		meshCount: number;
		_infos;
		_flexBuffer;
	}


	/**
	 * cc.RenderComponent
	 */
	interface RenderComponent {
		setVertsDirty(): void;

		disableRender(): void;

		markForRender(shouldRender: boolean): void;

		_activateMaterial(force: boolean = true): void;

		_vertsDirty: boolean;

		_assembler: cc.Assembler;

		_resetAssembler(): void;
	}

	/**
	 * 
	 */
	interface Tween {
		setTimeScale(timeScale: number): void;
		clear(): void;
	}


	export function color(r?: number | string | Object, g?: number, b?: number, a?: number): Color;
}

declare const CC_NATIVERENDERER: boolean;