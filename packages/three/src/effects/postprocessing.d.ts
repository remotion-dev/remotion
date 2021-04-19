declare module 'postprocessing' {
    import {
        Vector2,
        WebGLRenderer,
        Camera,
        PerspectiveCamera,
        Texture,
        Material,
        WebGLRenderTarget,
        Scene,
        DepthTexture,
        Uniform,
        Object3D,
        Vector3,
        ShaderMaterial,
        DataTexture,
        Mesh,
        Points,
        LoadingManager,
        TextureDataType,
        Loader,
    } from 'three';

    /**
     * A color channel enumeration.
     * @property RED - Red.
     * @property GREEN - Green.
     * @property BLUE - Blue.
     * @property ALPHA - Alpha.
     */
    export const ColorChannel: {
        RED: number;
        GREEN: number;
        BLUE: number;
        ALPHA: number;
    };

    /**
     * The Disposable contract.
    
    Implemented by objects that can free internal resources.
     */
    export interface Disposable {
        /**
         * Frees internal resources.
         */
        dispose(): void;
    }

    /**
     * The initializable contract.
    
    Implemented by objects that can be initialized.
     */
    export interface Initializable {
        /**
         * Performs initialization tasks.
         * @param renderer - A renderer.
         * @param alpha - Whether the renderer uses the alpha channel.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
    }

    /**
     * Constructs a new adaptive luminance material.
     */
    export class AdaptiveLuminanceMaterial { }

    /**
     * Constructs a new bokeh material.
     * @param [fill = false] - Enables or disables the bokeh highlight fill mode.
     * @param [foreground = false] - Determines whether this material will be applied to foreground colors.
     */
    export class BokehMaterial {
        constructor(fill?: boolean = false, foreground?: boolean = false);
        /**
         * Sets the texel size.
         * @param x - The texel width.
         * @param y - The texel height.
         */
        setTexelSize(x: number, y: number): void;
    }

    /**
     * Constructs a new CoC material.
     * @param camera - A camera.
     */
    export class CircleOfConfusionMaterial {
        constructor(camera: Camera);
        /**
         * The current depth packing.
         */
        depthPacking: number;
        /**
         * Adopts the settings of the given camera.
         * @param [camera = null] - A camera.
         */
        adoptCameraSettings(camera?: Camera = null): void;
    }

    /**
     * Constructs a new color edges material.
     * @param [texelSize] - The absolute screen texel size.
     */
    export class ColorEdgesMaterial {
        constructor(texelSize?: Vector2);
        /**
           * Sets the local contrast adaptation factor.
          
          If there is a neighbor edge that has _factor_ times bigger contrast than
          the current edge, the edge will be discarded.
          
          This allows to eliminate spurious crossing edges and is based on the fact
          that if there is too much contrast in a direction, the perceptual contrast
          in the other neighbors will be hidden.
           * @param factor - The local contrast adaptation factor. Default is 2.0.
           */
        setLocalContrastAdaptationFactor(factor: number): void;
        /**
           * Sets the edge detection sensitivity.
          
          A lower value results in more edges being detected at the expense of
          performance.
          
          0.1 is a reasonable value, and allows to catch most visible edges.
          0.05 is a rather overkill value, that allows to catch 'em all.
          
          If temporal supersampling is used, 0.2 could be a reasonable value, as low
          contrast edges are properly filtered by just 2x.
           * @param threshold - The edge detection sensitivity. Range: [0.05, 0.5].
           */
        setEdgeDetectionThreshold(threshold: number): void;
    }

    /**
     * Constructs a new convolution material.
     * @param [texelSize] - The absolute screen texel size.
     */
    export class ConvolutionMaterial {
        constructor(texelSize?: Vector2);
        /**
         * The current kernel size.
         */
        kernelSize: KernelSize;
        /**
         * Returns the kernel.
         * @returns The kernel.
         */
        getKernel(): Float32Array;
        /**
         * Sets the texel size.
         * @param x - The texel width.
         * @param y - The texel height.
         */
        setTexelSize(x: number, y: number): void;
    }

    /**
     * A kernel size enumeration.
     * @property VERY_SMALL - A very small kernel that matches a 7x7 Gauss blur kernel.
     * @property SMALL - A small kernel that matches a 15x15 Gauss blur kernel.
     * @property MEDIUM - A medium sized kernel that matches a 23x23 Gauss blur kernel.
     * @property LARGE - A large kernel that matches a 35x35 Gauss blur kernel.
     * @property VERY_LARGE - A very large kernel that matches a 63x63 Gauss blur kernel.
     * @property HUGE - A huge kernel that matches a 127x127 Gauss blur kernel.
     */
    export const KernelSize: {
        VERY_SMALL: number;
        SMALL: number;
        MEDIUM: number;
        LARGE: number;
        VERY_LARGE: number;
        HUGE: number;
    };

    /**
     * Constructs a new copy material.
     */
    export class CopyMaterial { }

    /**
     * Constructs a new depth comparison material.
     * @param [depthTexture = null] - A depth texture.
     * @param [camera] - A camera.
     */
    export class DepthComparisonMaterial {
        constructor(depthTexture?: Texture, camera?: PerspectiveCamera);
        /**
         * Adopts the settings of the given camera.
         * @param [camera = null] - A camera.
         */
        adoptCameraSettings(camera?: Camera): void;
    }

    /**
     * Constructs a new depth mask material.
     */
    export class DepthMaskMaterial { }

    /**
     * Constructs a new edge detection material.
     * @param [texelSize] - The screen texel size.
     * @param [mode = EdgeDetectionMode.COLOR] - The edge detection mode.
     */
    export class EdgeDetectionMaterial {
        constructor(texelSize?: Vector2, mode?: EdgeDetectionMode);
        /**
         * The current depth packing.
         */
        depthPacking: number;
        /**
           * Sets the edge detection mode.
          
          Warning: If you intend to change the edge detection mode at runtime, make
          sure that {@link EffectPass.needsDepthTexture} is set to `true` _before_
          the EffectPass is added to the composer.
           * @param mode - The edge detection mode.
           */
        setEdgeDetectionMode(mode: EdgeDetectionMode): void;
        /**
           * Sets the local contrast adaptation factor. Has no effect if the edge
          detection mode is set to DEPTH.
          
          If there is a neighbor edge that has _factor_ times bigger contrast than
          the current edge, the edge will be discarded.
          
          This allows to eliminate spurious crossing edges and is based on the fact
          that if there is too much contrast in a direction, the perceptual contrast
          in the other neighbors will be hidden.
           * @param factor - The local contrast adaptation factor. Default is 2.0.
           */
        setLocalContrastAdaptationFactor(factor: number): void;
        /**
           * Sets the edge detection sensitivity.
          
          A lower value results in more edges being detected at the expense of
          performance.
          
          0.1 is a reasonable value, and allows to catch most visible edges.
          0.05 is a rather overkill value, that allows to catch 'em all.
          
          If temporal supersampling is used, 0.2 could be a reasonable value, as low
          contrast edges are properly filtered by just 2x.
           * @param threshold - The edge detection sensitivity. Range: [0.05, 0.5].
           */
        setEdgeDetectionThreshold(threshold: number): void;
    }

    /**
     * An enumeration of edge detection modes.
     * @property DEPTH - Depth-based edge detection.
     * @property LUMA - Luminance-based edge detection.
     * @property COLOR - Chroma-based edge detection.
     */
    export const EdgeDetectionMode: {
        DEPTH: number;
        LUMA: number;
        COLOR: number;
    };

    /**
     * Constructs a new effect material.
     * @param [shaderParts = null] - A collection of shader snippets. See {@link Section}.
     * @param [defines = null] - A collection of preprocessor macro definitions.
     * @param [uniforms = null] - A collection of uniforms.
     * @param [camera = null] - A camera.
     * @param [dithering = false] - Whether dithering should be enabled.
     */
    export class EffectMaterial implements Resizable {
        constructor(
            shaderParts?: Map<string, string>,
            defines?: Map<string, string>,
            uniforms?: Map<string, Uniform>,
            camera?: Camera,
            dithering?: boolean
        );
        /**
         * The current depth packing.
         */
        depthPacking: number;
        /**
         * Sets the shader parts.
         * @param shaderParts - A collection of shader snippets. See {@link Section}.
         * @returns This material.
         */
        setShaderParts(shaderParts: Map<string, string>): EffectMaterial;
        /**
         * Sets the shader macros.
         * @param defines - A collection of preprocessor macro definitions.
         * @returns This material.
         */
        setDefines(defines: Map<string, string>): EffectMaterial;
        /**
         * Sets the shader uniforms.
         * @param uniforms - A collection of uniforms.
         * @returns This material.
         */
        setUniforms(uniforms: Map<string, Uniform>): EffectMaterial;
        /**
         * Adopts the settings of the given camera.
         * @param [camera = null] - A camera.
         */
        adoptCameraSettings(camera?: Camera): void;
        /**
         * Sets the resolution.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
    }

    /**
     * An enumeration of shader code placeholders used by the {@link EffectPass}.
     * @property FRAGMENT_HEAD - A placeholder for function and variable declarations inside the fragment shader.
     * @property FRAGMENT_MAIN_UV - A placeholder for UV transformations inside the fragment shader.
     * @property FRAGMENT_MAIN_IMAGE - A placeholder for color calculations inside the fragment shader.
     * @property VERTEX_HEAD - A placeholder for function and variable declarations inside the vertex shader.
     * @property VERTEX_MAIN_SUPPORT - A placeholder for supporting calculations inside the vertex shader.
     */
    export const Section: {
        FRAGMENT_HEAD: string;
        FRAGMENT_MAIN_UV: string;
        FRAGMENT_MAIN_IMAGE: string;
        VERTEX_HEAD: string;
        VERTEX_MAIN_SUPPORT: string;
    };

    /**
     * Constructs a new god rays material.
     * @param lightPosition - The light position in screen space.
     */
    export class GodRaysMaterial {
        constructor(lightPosition: Vector2);
        /**
         * The amount of samples per pixel.
         */
        samples: number;
    }

    /**
     * Constructs a new luminance material.
     * @param [colorOutput = false] - Defines whether the shader should output colors scaled with their luminance value.
     * @param [luminanceRange = null] - If provided, the shader will mask out texels that aren't in the specified luminance range.
     */
    export class LuminanceMaterial {
        constructor(colorOutput?: boolean, luminanceRange?: Vector2);
        /**
         * The luminance threshold.
         */
        threshold: number;
        /**
         * The luminance threshold smoothing.
         */
        smoothing: number;
        /**
         * Indicates whether the luminance threshold is enabled.
         */
        useThreshold: boolean;

        /**
         * Indicates whether color output is enabled.
         */
        colorOutput: boolean;
        /**
         * Enables or disables color output.
         * @param enabled - Whether color output should be enabled.
         */
        setColorOutputEnabled(enabled: boolean): void;
        /**
         * Indicates whether luminance masking is enabled.
         */
        useRange: boolean;
        /**
         * Indicates whether luminance masking is enabled.
         */
        luminanceRange: boolean;
        /**
         * Enables or disables the luminance mask.
         * @param enabled - Whether the luminance mask should be enabled.
         */
        setLuminanceRangeEnabled(enabled: boolean): void;
    }

    /**
     * Constructs a new mask material.
     * @param [maskTexture = null] - The mask texture.
     */
    export class MaskMaterial {
        constructor(maskTexture?: Texture);
        /**
         * Sets the mask texture.
         */
        maskTexture: Texture;
        /**
           * Sets the color channel to use for masking.
          
          The default channel is `RED`.
           */
        colorChannel: ColorChannel;
        /**
           * Sets the masking technique.
          
          The default function is `DISCARD`.
           */
        maskFunction: MaskFunction;

        /**
         * Indicates whether the masking is inverted.
         */
        inverted: boolean;
        /**
           * The current mask strength.
          
          Individual mask values will be clamped to [0.0, 1.0].
           */
        strength: number;
    }

    /**
     * A mask function enumeration.
     * @property DISCARD - Discards elements when the respective mask value is zero.
     * @property MULTIPLY - Multiplies the input buffer with the mask texture.
     * @property MULTIPLY_RGB_SET_ALPHA - Multiplies the input RGB values with the mask and sets alpha to the mask value.
     */
    export const MaskFunction: {
        DISCARD: number;
        MULTIPLY: number;
        MULTIPLY_RGB_SET_ALPHA: number;
    };

    /**
     * Constructs a new outline material.
     * @param [texelSize] - The screen texel size.
     */
    export class OutlineMaterial {
        constructor(texelSize?: Vector2);
        /**
         * Sets the texel size.
         * @param x - The texel width.
         * @param y - The texel height.
         */
        setTexelSize(x: number, y: number): void;
    }

    /**
     * An outline shader material.
     */
    export type OutlineEdgesMaterial = any;

    /**
     * Constructs a new SMAA weights material.
     * @param [texelSize] - The absolute screen texel size.
     * @param [resolution] - The resolution.
     */
    export class SMAAWeightsMaterial {
        constructor(texelSize?: Vector2, resolution?: Vector2);
        /**
           * Sets the maximum amount of steps performed in the horizontal/vertical
          pattern searches, at each side of the pixel.
          
          In number of pixels, it's actually the double. So the maximum line length
          perfectly handled by, for example 16, is 64 (perfectly means that longer
          lines won't look as good, but are still antialiased).
           * @param steps - The search steps. Range: [0, 112].
           */
        setOrthogonalSearchSteps(steps: number): void;
        /**
           * Specifies the maximum steps performed in the diagonal pattern searches, at
          each side of the pixel. This search jumps one pixel at time.
          
          On high-end machines this search is cheap (between 0.8x and 0.9x slower for
          16 steps), but it can have a significant impact on older machines.
           * @param steps - The search steps. Range: [0, 20].
           */
        setDiagonalSearchSteps(steps: number): void;
        /**
         * Specifies how much sharp corners will be rounded.
         * @param rounding - The corner rounding amount. Range: [0, 100].
         */
        setCornerRounding(rounding: number): void;
        /**
         * Indicates whether diagonal pattern detection is enabled.
         */
        diagonalDetection: boolean;
        /**
         * Indicates whether corner rounding is enabled.
         */
        cornerRounding: boolean;
    }

    /**
     * Constructs a new resizer.
     * @param resizeable - A resizable object.
     * @param [width = Resizer.AUTO_SIZE] - The width.
     * @param [height = Resizer.AUTO_SIZE] - The height.
     */
    export class Resizer {
        constructor(resizeable: Resizable, width?: number, height?: number);
        /**
         * A resizable object.
         */
        resizable: Resizable;
        /**
           * The base size.
          
          This size will be passed to the resizable object every time the width or
          height is changed.
           */
        base: Vector2;
        /**
           * A scale.
          
          If both the width and the height are set to {@link Resizer.AUTO_SIZE},
          they will be scaled uniformly using this scalar.
           */
        scale: number;
        /**
           * The calculated width.
          
          If both the width and the height are set to {@link Resizer.AUTO_SIZE}, the
          base width will be returned.
           */
        width: number;
        /**
           * The calculated height.
          
          If both the width and the height are set to {@link Resizer.AUTO_SIZE}, the
          base height will be returned.
           */
        height: number;
        /**
           * An auto sizing constant.
          
          Can be used to automatically calculate the width or height based on the
          original aspect ratio.
           */
        static AUTO_SIZE: number;
    }

    export interface Pass extends Initializable, Resizable, Disposable { }

    /**
     * Constructs a new pass.
     * @param [name = Pass] - The name of this pass. Does not have to be unique.
     * @param [scene] - The scene to render. The default scene contains a single mesh that fills the screen.
     * @param [camera] - A camera. Fullscreen effect passes don't require a camera.
     */
    export class Pass implements Initializable, Resizable, Disposable {
        constructor(name?: string, scene?: Scene, camera?: Camera);
        /**
         * The name of this pass.
         */
        name: string;
        /**
         * The scene to render.
         */
        protected scene: Scene;
        /**
         * The camera.
         */
        protected camera: Camera;
        /**
           * Only relevant for subclassing.
          
          Indicates whether the {@link EffectComposer} should swap the frame
          buffers after this pass has finished rendering.
          
          Set this to `false` if this pass doesn't render to the output buffer or
          the screen. Otherwise, the contents of the input buffer will be lost.
           */
        needsSwap: boolean;
        /**
           * Indicates whether the {@link EffectComposer} should prepare a depth
          texture for this pass.
          
          Set this to `true` if this pass relies on depth information from a
          preceding {@link RenderPass}.
           */
        needsDepthTexture: boolean;
        /**
         * Indicates whether this pass should be executed.
         */
        enabled: boolean;
        /**
         * Indicates whether this pass should render to screen.
         */
        renderToScreen: boolean;
        /**
         * Returns the current fullscreen material.
         * @returns The current fullscreen material, or null if there is none.
         */
        getFullscreenMaterial(): Material;
        /**
           * Sets the fullscreen material.
          
          The material will be assigned to a mesh that fills the screen. The mesh
          will be created once a material is assigned via this method.
           * @param material - A fullscreen material.
           */
        protected setFullscreenMaterial(material: Material): void;
        /**
         * Returns the current depth texture.
         * @returns The current depth texture, or null if there is none.
         */
        getDepthTexture(): Texture;
        /**
           * Sets the depth texture.
          
          You may override this method if your pass relies on the depth information
          of a preceding {@link RenderPass}.
           * @param depthTexture - A depth texture.
           * @param [depthPacking = 0] - The depth packing.
           */
        setDepthTexture(depthTexture: Texture, depthPacking?: number): void;
        /**
           * Renders the effect.
          
          This is an abstract method that must be overridden.
           * @param renderer - The renderer.
           * @param inputBuffer - A frame buffer that contains the result of the previous pass.
           * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
           * @param [deltaTime] - The time between the last frame and the current one in seconds.
           * @param [stencilTest] - Indicates whether a stencil mask is active.
           */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
        /**
           * Updates this pass with the renderer's size.
          
          You may override this method in case you want to be informed about the size
          of the main frame buffer.
          
          The {@link EffectComposer} calls this method before this pass is
          initialized and every time its own size is updated.
           * @example
           * this.myRenderTarget.setSize(width, height);
           * @param width - The renderer's width.
           * @param height - The renderer's height.
           */
        setSize(width: number, height: number): void;
        /**
           * Performs initialization tasks.
          
          By overriding this method you gain access to the renderer. You'll also be
          able to configure your custom render targets to use the appropriate format
          (RGB or RGBA).
          
          The provided renderer can be used to warm up special off-screen render
          targets by performing a preliminary render operation.
          
          The {@link EffectComposer} calls this method when this pass is added to its
          queue, but not before its size has been set.
           * @example
           * if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }
           * @param renderer - The renderer.
           * @param alpha - Whether the renderer uses the alpha channel or not.
           * @param frameBufferType - The type of the main frame buffers.
           */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
        /**
           * Performs a shallow search for disposable properties and deletes them. The
          pass will be inoperative after this method was called!
          
          Disposable objects:
           - WebGLRenderTarget
           - Material
           - Texture
          
          The {@link EffectComposer} calls this method when it is being destroyed.
          You may, however, use it independently to free memory when you are certain
          that you don't need this pass anymore.
           */
        dispose(): void;
    }

    /**
     * Constructs a new blur pass.
     * @param [options] - The options.
     * @param [options.width = Resizer.AUTO_SIZE] - The blur render width.
     * @param [options.height = Resizer.AUTO_SIZE] - The blur render height.
     * @param [options.kernelSize = KernelSize.LARGE] - The blur kernel size.
     */
    export class BlurPass {
        constructor(
            options?: Partial<{
                width?: number;
                height?: number;
                kernelSize?: KernelSize;
            }>
        );
        /**
           * The desired render resolution.
          
          It's recommended to set the height or the width to an absolute value for
          consistent results across different devices and resolutions.
          
          Use {@link Resizer.AUTO_SIZE} for the width or height to automatically
          calculate it based on its counterpart and the original aspect ratio.
           */
        resolution: Resizer;
        /**
         * Whether the blurred result should also be dithered using noise.
         */
        dithering: boolean;
        /**
         * The current width of the internal render targets.
         */
        width: number;
        /**
         * The current height of the internal render targets.
         */
        height: number;
        /**
         * The current blur scale.
         */
        scale: number;
        /**
         * The kernel size.
         */
        kernelSize: KernelSize;
        /**
         * Returns the current resolution scale.
         * @returns The resolution scale.
         */
        getResolutionScale(): number;
        /**
         * Sets the resolution scale.
         * @param scale - The new resolution scale.
         */
        setResolutionScale(scale: number): void;
        /**
           * Blurs the input buffer and writes the result to the output buffer. The
          input buffer remains intact, unless it's also the output buffer.
           * @param renderer - The renderer.
           * @param inputBuffer - A frame buffer that contains the result of the previous pass.
           * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
           * @param [deltaTime] - The time between the last frame and the current one in seconds.
           * @param [stencilTest] - Indicates whether a stencil mask is active.
           */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
        /**
         * Updates the size of this pass.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Performs initialization tasks.
         * @param renderer - The renderer.
         * @param alpha - Whether the renderer uses the alpha channel or not.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
        /**
         * An auto sizing flag.
         */
        static AUTO_SIZE: number;
    }

    /**
     * Constructs a new clear mask pass.
     */
    export class ClearMaskPass {
        /**
         * Disables the global stencil test.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         * @param [stencilTest] - Indicates whether a stencil mask is active.
         */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
    }

    /**
     * Constructs a new clear pass.
     * @param [color = true] - Determines whether the color buffer should be cleared.
     * @param [depth = true] - Determines whether the depth buffer should be cleared.
     * @param [stencil = false] - Determines whether the stencil buffer should be cleared.
     */
    export class ClearPass {
        constructor(color?: boolean, depth?: boolean, stencil?: boolean);
        /**
         * Indicates whether the color buffer should be cleared.
         */
        color: boolean;
        /**
         * Indicates whether the depth buffer should be cleared.
         */
        depth: boolean;
        /**
         * Indicates whether the stencil buffer should be cleared.
         */
        stencil: boolean;
        /**
           * An override clear alpha.
          
          The default value is -1.
           */
        overrideClearAlpha: number;
        /**
         * Clears the input buffer or the screen.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         * @param [stencilTest] - Indicates whether a stencil mask is active.
         */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
    }

    /**
     * Constructs a new render pass.
     * @param scene - The scene to render.
     * @param camera - The camera to use to render the scene.
     * @param [overrideMaterial = null] - An override material for the scene.
     */
    export class RenderPass extends Pass {
        constructor(scene: Scene, camera: Camera, overrideMaterial?: Material);
        /**
         * An override material.
         */
        overrideMaterial: Material;
        /**
         * Indicates whether the target buffer should be cleared before rendering.
         */
        clear: boolean;
        /**
         * Returns the clear pass.
         * @returns The clear pass.
         */
        getClearPass(): ClearPass;
        /**
         * Returns the current depth texture.
         * @returns The current depth texture, or null if there is none.
         */
        getDepthTexture(): Texture;
        /**
           * Sets the depth texture.
          
          The provided texture will be attached to the input buffer unless this pass
          renders to screen.
           * @param depthTexture - A depth texture.
           * @param [depthPacking = 0] - The depth packing.
           */
        setDepthTexture(depthTexture: DepthTexture, depthPacking?: number): void;
        /**
         * Renders the scene.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         * @param [stencilTest] - Indicates whether a stencil mask is active.
         */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
    }

    /**
     * Constructs a new depth pass.
     * @param scene - The scene to render.
     * @param camera - The camera to use to render the scene.
     * @param [options] - The options.
     * @param [options.width = Resizer.AUTO_SIZE] - The render width.
     * @param [options.height = Resizer.AUTO_SIZE] - The render height.
     * @param [options.renderTarget] - A custom render target.
     */
    export class DepthPass {
        constructor(
            scene: Scene,
            camera: Camera,
            options?: Partial<{
                width?: number;
                height?: number;
                renderTarget?: WebGLRenderTarget;
            }>
        );
        /**
         * A render target that contains the scene depth.
         */
        renderTarget: WebGLRenderTarget;
        /**
           * The desired render resolution.
          
          Use {@link Resizer.AUTO_SIZE} for the width or height to automatically
          calculate it based on its counterpart and the original aspect ratio.
           */
        resolution: Resizer;
        /**
         * Returns the current resolution scale.
         * @returns The resolution scale.
         */
        getResolutionScale(): number;
        /**
         * Sets the resolution scale.
         * @param scale - The new resolution scale.
         */
        setResolutionScale(scale: number): void;
        /**
         * Renders the scene depth.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         * @param [stencilTest] - Indicates whether a stencil mask is active.
         */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
        /**
         * Updates the size of this pass.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
    }

    /**
     * A blend function enumeration.
     * @property SKIP - No blending. The effect will not be included in the final shader.
     * @property ADD - Additive blending. Fast, but may produce washed out results.
     * @property ALPHA - Alpha blending. Blends based on the alpha value of the new color.
     * @property AVERAGE - Average blending.
     * @property COLOR_BURN - Color burn.
     * @property COLOR_DODGE - Color dodge.
     * @property DARKEN - Prioritize darker colors.
     * @property DIFFERENCE - Color difference.
     * @property EXCLUSION - Color exclusion.
     * @property LIGHTEN - Prioritize lighter colors.
     * @property MULTIPLY - Color multiplication.
     * @property DIVIDE - Color division.
     * @property NEGATION - Color negation.
     * @property NORMAL - Normal blending. The new color overwrites the old one.
     * @property OVERLAY - Color overlay.
     * @property REFLECT - Color reflection.
     * @property SCREEN - Screen blending. The two colors are effectively projected on a white screen simultaneously.
     * @property SOFT_LIGHT - Soft light blending.
     * @property SUBTRACT - Color subtraction.
     */
    export enum BlendFunction {
        'SKIP',
        'ADD',
        'ALPHA',
        'AVERAGE',
        'COLOR_BURN',
        'COLOR_DODGE',
        'DARKEN',
        'DIFFERENCE',
        'EXCLUSION',
        'LIGHTEN',
        'MULTIPLY',
        'DIVIDE',
        'NEGATION',
        'NORMAL',
        'OVERLAY',
        'REFLECT',
        'SCREEN',
        'SOFT_LIGHT',
        'SUBTRACT',
    }

    /**
     * Constructs a new blend mode.
     * @param blendFunction - The blend function to use.
     * @param opacity - The opacity of the color that will be blended with the base color.
     */
    export class BlendMode {
        constructor(blendFunction: BlendFunction, opacity?: number);
        /**
         * The blend function.
         */
        blendFunction: BlendFunction;
        /**
         * The opacity of the color that will be blended with the base color.
         */
        opacity: Uniform;
        /**
         * Returns the blend function shader code.
         * @returns The blend function shader code.
         */
        getShaderCode(): string;
    }

    /**
     * Constructs a new effect.
     * @param name - The name of this effect. Doesn't have to be unique.
     * @param fragmentShader - The fragment shader. This shader is required.
     * @param [options] - Additional options.
     * @param [options.attributes = EffectAttribute.NONE] - The effect attributes that determine the execution priority and resource requirements.
     * @param [options.blendFunction = BlendFunction.SCREEN] - The blend function of this effect.
     * @param [options.defines] - Custom preprocessor macro definitions. Keys are names and values are code.
     * @param [options.uniforms] - Custom shader uniforms. Keys are names and values are uniforms.
     * @param [options.extensions] - WebGL extensions.
     * @param [options.vertexShader = null] - The vertex shader. Most effects don't need one.
     */
    export class Effect implements Initializable, Resizable, Disposable {
        constructor(
            name: string,
            fragmentShader: string,
            options?: {
                attributes?: EffectAttribute;
                blendFunction?: BlendFunction;
                defines?: Map<string, string>;
                uniforms?: Map<string, Uniform>;
                extensions?: Set<WebGLExtension>;
                vertexShader?: string;
            }
        );
        /**
         * The name of this effect.
         */
        name: string;
        /**
           * The effect attributes.
          
          Effects that have the same attributes will be executed in the order in
          which they were registered. Some attributes imply a higher priority.
           */
        attributes: EffectAttribute;
        /**
         * The fragment shader.
         */
        fragmentShader: string;
        /**
         * The vertex shader.
         */
        vertexShader: string;
        /**
           * Preprocessor macro definitions.
          
          You'll need to call {@link EffectPass#recompile} after changing a macro.
           */
        defines: Map<string, string>;
        /**
           * Shader uniforms.
          
          You may freely modify the values of these uniforms at runtime. However,
          uniforms must not be removed or added after the effect was created.
           */
        uniforms: Map<string, Uniform>;
        /**
           * WebGL extensions that are required by this effect.
          
          You'll need to call {@link EffectPass#recompile} after adding or removing
          an extension.
           */
        extensions: Set<WebGLExtension>;
        /**
           * The blend mode of this effect.
          
          The result of this effect will be blended with the result of the previous
          effect using this blend mode.
          
          Feel free to adjust the opacity of the blend mode at runtime. However,
          you'll need to call {@link EffectPass#recompile} if you change the blend
          function.
           */
        blendMode: BlendMode;
        /**
           * Sets the depth texture.
          
          You may override this method if your effect requires direct access to the
          depth texture that is bound to the associated {@link EffectPass}.
           * @param depthTexture - A depth texture.
           * @param [depthPacking = 0] - The depth packing.
           */
        setDepthTexture(depthTexture: Texture, depthPacking?: number): void;
        /**
           * Updates the effect by performing supporting operations.
          
          This method is called by the {@link EffectPass} right before the main
          fullscreen render operation, even if the blend function is set to `SKIP`.
          
          You may override this method if you need to render additional off-screen
          textures or update custom uniforms.
           * @param renderer - The renderer.
           * @param inputBuffer - A frame buffer that contains the result of the previous pass.
           * @param [deltaTime] - The time between the last frame and the current one in seconds.
           */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
        /**
           * Updates the size of this effect.
          
          You may override this method in case you want to be informed about the main
          render size.
          
          The {@link EffectPass} calls this method before this effect is initialized
          and every time its own size is updated.
           * @example
           * this.myRenderTarget.setSize(width, height);
           * @param width - The width.
           * @param height - The height.
           */
        setSize(width: number, height: number): void;
        /**
           * Performs initialization tasks.
          
          By overriding this method you gain access to the renderer. You'll also be
          able to configure your custom render targets to use the appropriate format
          (RGB or RGBA).
          
          The provided renderer can be used to warm up special off-screen render
          targets by performing a preliminary render operation.
          
          The {@link EffectPass} calls this method during its own initialization
          which happens after the size has been set.
           * @example
           * if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }
           * @param renderer - The renderer.
           * @param alpha - Whether the renderer uses the alpha channel or not.
           * @param frameBufferType - The type of the main frame buffers.
           */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
        /**
           * Performs a shallow search for properties that define a dispose method and
          deletes them. The effect will be inoperative after this method was called!
          
          Disposable objects:
           - render targets
           - materials
           - textures
          
          The {@link EffectPass} calls this method when it is being destroyed. Do not
          call this method directly.
           */
        dispose(): void;
    }

    /**
     * An enumeration of effect attributes.
    
    Attributes can be concatenated using the bitwise OR operator.
     * @example
     * const attributes = EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH;
     * @property CONVOLUTION - Describes effects that fetch additional samples from the input buffer. There cannot be more than one effect with this attribute per {@link EffectPass}.
     * @property DEPTH - Describes effects that require a depth texture.
     * @property NONE - No attributes. Most effects don't need to specify any attributes.
     */
    export const EffectAttribute: {
        CONVOLUTION: number;
        DEPTH: number;
        NONE: number;
    };

    /**
     * An enumeration of WebGL extensions.
     * @property DERIVATIVES - Enables derivatives by adding the functions dFdx, dFdy and fwidth.
     * @property FRAG_DEPTH - Enables gl_FragDepthEXT to set a depth value of a fragment from within the fragment shader.
     * @property DRAW_BUFFERS - Enables multiple render targets (MRT) support.
     * @property SHADER_TEXTURE_LOD - Enables explicit control of texture LOD.
     */
    export const WebGLExtension: {
        DERIVATIVES: string;
        FRAG_DEPTH: string;
        DRAW_BUFFERS: string;
        SHADER_TEXTURE_LOD: string;
    };

    /**
     * Constructs a new effect pass.
    
    The provided effects will be organized and merged for optimal performance.
     * @param camera - The main camera. The camera's type and settings will be available to all effects.
     * @param effects - The effects that will be rendered by this pass.
     */
    export class EffectPass extends Pass {
        constructor(camera: Camera, ...effects: Effect[]);
        /**
           * A time offset.
          
          Elapsed time will start at this value.
           */
        minTime: number;
        /**
           * The maximum time.
          
          If the elapsed time exceeds this value, it will be reset.
           */
        maxTime: number;
        /**
         * Indicates whether this pass encodes its output when rendering to screen.
         */
        encodeOutput: boolean;
        /**
           * Indicates whether dithering is enabled.
          
          Color quantization reduces banding artifacts but degrades performance.
           */
        dithering: boolean;
        /**
           * Updates the shader material.
          
          Warning: This method triggers a relatively expensive shader recompilation.
           */
        recompile(): void;
        /**
         * Returns the current depth texture.
         * @returns The current depth texture, or null if there is none.
         */
        getDepthTexture(): Texture;
        /**
         * Sets the depth texture.
         * @param depthTexture - A depth texture.
         * @param [depthPacking = 0] - The depth packing.
         */
        setDepthTexture(depthTexture: Texture, depthPacking?: number): void;
        /**
         * Renders the effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         * @param [stencilTest] - Indicates whether a stencil mask is active.
         */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
        /**
         * Updates the size of this pass.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Performs initialization tasks.
         * @param renderer - The renderer.
         * @param alpha - Whether the renderer uses the alpha channel or not.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
        /**
           * Deletes disposable objects.
          
          This pass will be inoperative after this method was called!
           */
        dispose(): void;
    }

    /**
     * Constructs a new mask pass.
     * @param scene - The scene to render.
     * @param camera - The camera to use.
     */
    export class MaskPass {
        constructor(scene: Scene, camera: Camera);
        /**
         * Inverse flag.
         */
        inverse: boolean;
        /**
         * Indicates whether this pass should clear the stencil buffer.
         */
        clear: boolean;
        /**
         * Renders the effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         * @param [stencilTest] - Indicates whether a stencil mask is active.
         */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
    }

    /**
     * Constructs a new normal pass.
     * @param scene - The scene to render.
     * @param camera - The camera to use to render the scene.
     * @param [options] - The options.
     * @param [options.width = Resizer.AUTO_SIZE] - The render width.
     * @param [options.height = Resizer.AUTO_SIZE] - The render height.
     * @param [options.renderTarget] - A custom render target.
     */
    export class NormalPass extends Pass {
        constructor(
            scene: Scene,
            camera: Camera,
            options?: Partial<{
                width: number;
                height: number;
                renderTarget: WebGLRenderTarget;
            }>
        );
        /**
         * A render target that contains the scene normals.
         */
        renderTarget: WebGLRenderTarget;
        /**
           * The desired render resolution.
          
          Use {@link Resizer.AUTO_SIZE} for the width or height to automatically
          calculate it based on its counterpart and the original aspect ratio.
           */
        resolution: Resizer;
        /**
         * Returns the current resolution scale.
         * @returns The resolution scale.
         */
        getResolutionScale(): number;
        /**
         * Sets the resolution scale.
         * @param scale - The new resolution scale.
         */
        setResolutionScale(scale: number): void;
        /**
         * Renders the scene normals.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         * @param [stencilTest] - Indicates whether a stencil mask is active.
         */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
        /**
         * Updates the size of this pass.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
    }

    /**
     * Constructs a new save pass.
     * @param [renderTarget] - A render target.
     * @param [resize = true] - Whether the render target should adjust to the size of the input buffer.
     */
    export class SavePass {
        constructor(renderTarget?: WebGLRenderTarget, resize?: boolean);
        /**
         * The render target.
         */
        renderTarget: WebGLRenderTarget;
        /**
         * Indicates whether the render target should be resized automatically.
         */
        resize: boolean;
        /**
         * Saves the input buffer.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         * @param [stencilTest] - Indicates whether a stencil mask is active.
         */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
        /**
         * Updates the size of this pass.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Performs initialization tasks.
         * @param renderer - A renderer.
         * @param alpha - Whether the renderer uses the alpha channel.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
    }

    /**
     * Constructs a new shader pass.
     * @param material - A shader material.
     * @param [input = "inputBuffer"] - The name of the input buffer uniform.
     */
    export class ShaderPass {
        constructor(material: ShaderMaterial, input?: string);
        /**
           * Sets the name of the input buffer uniform.
          
          Most fullscreen materials modify texels from an input texture. This pass
          automatically assigns the main input buffer to the uniform identified by
          the given name.
           * @param input - The name of the input buffer uniform.
           */
        setInput(input: string): void;
        /**
         * Renders the effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         * @param [stencilTest] - Indicates whether a stencil mask is active.
         */
        render(
            renderer: WebGLRenderer,
            inputBuffer: WebGLRenderTarget,
            outputBuffer: WebGLRenderTarget,
            deltaTime?: number,
            stencilTest?: boolean
        ): void;
    }

    export interface EffectComposer extends Resizable, Disposable { }

    /**
     * Constructs a new effect composer.
     * @param renderer - The renderer that should be used.
     * @param [options] - The options.
     * @param [options.depthBuffer = true] - Whether the main render targets should have a depth buffer.
     * @param [options.stencilBuffer = false] - Whether the main render targets should have a stencil buffer.
     * @param [options.multisampling = 0] - The number of samples used for multisample antialiasing. Requires WebGL 2.
     * @param [options.frameBufferType] - The type of the internal frame buffers. It's recommended to use HalfFloatType if possible.
     */
    export class EffectComposer implements Resizable, Disposable {
        constructor(
            renderer: WebGLRenderer,
            options?: {
                depthBuffer?: boolean;
                stencilBuffer?: boolean;
                multisampling?: number;
                frameBufferType?: TextureDataType;
            }
        );
        /**
         * The current amount of samples used for multisample antialiasing.
         */
        multisampling: number;
        /**
           * Returns the WebGL renderer.
          
          You may replace the renderer at any time by using
          {@link EffectComposer#replaceRenderer}.
           * @returns The renderer.
           */
        getRenderer(): WebGLRenderer;
        /**
           * Replaces the current renderer with the given one.
          
          The auto clear mechanism of the provided renderer will be disabled. If the
          new render size differs from the previous one, all passes will be updated.
          
          By default, the DOM element of the current renderer will automatically be
          removed from its parent node and the DOM element of the new renderer will
          take its place.
           * @param renderer - The new renderer.
           * @param updateDOM - Indicates whether the old canvas should be replaced by the new one in the DOM.
           * @returns The old renderer.
           */
        replaceRenderer(renderer: WebGLRenderer, updateDOM?: boolean): WebGLRenderer;
        /**
           * Creates a new render target by replicating the renderer's canvas.
          
          The created render target uses a linear filter for texel minification and
          magnification. Its render texture format depends on whether the renderer
          uses the alpha channel. Mipmaps are disabled.
          
          Note: The buffer format will also be set to RGBA if the frame buffer type
          is HalfFloatType because RGB16F buffers are not renderable.
           * @param depthBuffer - Whether the render target should have a depth buffer.
           * @param stencilBuffer - Whether the render target should have a stencil buffer.
           * @param type - The frame buffer type.
           * @param multisampling - The number of samples to use for antialiasing.
           * @returns A new render target that equals the renderer's canvas.
           */
        createBuffer(depthBuffer: boolean, stencilBuffer: boolean, type: number, multisampling: number): WebGLRenderTarget;
        /**
         * Adds a pass, optionally at a specific index.
         * @param pass - A new pass.
         * @param [index] - An index at which the pass should be inserted.
         */
        addPass(pass: Pass, index?: number): void;
        /**
         * Removes a pass.
         * @param pass - The pass.
         */
        removePass(pass: Pass): void;
        /**
         * Renders all enabled passes in the order in which they were added.
         * @param deltaTime - The time between the last frame and the current one in seconds.
         */
        render(deltaTime: number): void;
        /**
           * Sets the size of the buffers and the renderer's output canvas.
          
          Every pass will be informed of the new size. It's up to each pass how that
          information is used.
          
          If no width or height is specified, the render targets and passes will be
          updated with the current size of the renderer.
           * @param [width] - The width.
           * @param [height] - The height.
           * @param [updateStyle] - Determines whether the style of the canvas should be updated.
           */
        setSize(width?: number, height?: number, updateStyle?: boolean): void;
        /**
         * Resets this composer by deleting all passes and creating new buffers.
         */
        reset(): void;
        /**
           * Destroys this composer and all passes.
          
          This method deallocates all disposable objects created by the passes. It
          also deletes the main frame buffers of this composer.
           */
        dispose(): void;
    }

    /**
     * The Resizable contract.
    
    Implemented by objects that can be resized.
     */
    export interface Resizable {
        /**
         * Sets the size of this object.
         * @param width - The new width.
         * @param height - The new height.
         */
        setSize(width: number, height: number): void;
    }

    /**
     * Constructs a new selection.
     * @param [iterable] - A collection of objects that should be added to this selection.
     * @param [layer = 10] - A dedicated render layer for selected objects.
     */
    export class Selection {
        constructor(iterable?: Iterable<Object3D>, layer?: number);
        /**
           * A dedicated render layer for selected objects.
          
          This layer is set to 10 by default. If this collides with your own custom
          layers, please change it to a free layer before rendering!
           */
        layer: number;
        /**
         * Clears this selection.
         * @returns This selection.
         */
        clear(): Selection;
        /**
         * Clears this selection and adds the given objects.
         * @param objects - The objects that should be selected. This array will be copied.
         * @returns This selection.
         */
        set(objects: Iterable<Object3D>): Selection;
        /**
         * An alias for {@link has}.
         * @param object - An object.
         * @returns Returns 0 if the given object is currently selected, or -1 otherwise.
         */
        indexOf(object: Object3D): number;
        /**
         * Adds an object to this selection.
         * @param object - The object that should be selected.
         * @returns This selection.
         */
        add(object: Object3D): Selection;
        /**
         * Removes an object from this selection.
         * @param object - The object that should be deselected.
         * @returns Returns true if an object has successfully been removed from this selection; otherwise false.
         */
        delete(object: Object3D): boolean;
        /**
           * Sets the visibility of all selected objects.
          
          This method enables or disables render layer 0 of all selected objects.
           * @param visible - Whether the selected objects should be visible.
           * @returns This selection.
           */
        setVisible(visible: boolean): Selection;
    }

    /**
     * Constructs a new bloom effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.SCREEN] - The blend function of this effect.
     * @param [options.luminanceThreshold = 0.9] - The luminance threshold. Raise this value to mask out darker elements in the scene. Range is [0, 1].
     * @param [options.luminanceSmoothing = 0.025] - Controls the smoothness of the luminance threshold. Range is [0, 1].
     * @param [options.intensity = 1.0] - The intensity.
     * @param [options.width = Resizer.AUTO_SIZE] - The render width.
     * @param [options.height = Resizer.AUTO_SIZE] - The render height.
     * @param [options.kernelSize = KernelSize.LARGE] - The blur kernel size.
     */
    export class BloomEffect extends Effect {
        constructor(options?: {
            blendFunction?: BlendFunction;
            luminanceThreshold?: number;
            luminanceSmoothing?: number;
            intensity?: number;
            width?: number;
            height?: number;
            kernelSize?: KernelSize;
        });
        /**
         * A blur pass.
         */
        blurPass: BlurPass;
        /**
           * A luminance shader pass.
          
          You may disable this pass to deactivate luminance filtering.
           */
        luminancePass: ShaderPass;
        /**
           * A texture that contains the intermediate result of this effect.
          
          This texture will be applied to the scene colors unless the blend function
          is set to `SKIP`.
           */
        texture: Texture;
        /**
         * The luminance material.
         */
        luminanceMaterial: LuminanceMaterial;
        /**
         * The resolution of this effect.
         */
        resolution: Resizer;
        /**
         * The current width of the internal render targets.
         */
        width: number;
        /**
         * The current height of the internal render targets.
         */
        height: number;
        /**
         * Indicates whether dithering is enabled.
         */
        dithering: boolean;
        /**
         * The blur kernel size.
         */
        kernelSize: KernelSize;
        distinction: number;
        /**
         * The bloom intensity.
         */
        intensity: number;
        /**
         * Returns the current resolution scale.
         * @returns The resolution scale.
         */
        getResolutionScale(): number;
        /**
         * Sets the resolution scale.
         * @param scale - The new resolution scale.
         */
        setResolutionScale(scale: number): void;
        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
        /**
         * Updates the size of internal render targets.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Performs initialization tasks.
         * @param renderer - The renderer.
         * @param alpha - Whether the renderer uses the alpha channel or not.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
    }

    /**
     * Constructs a new brightness/contrast effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.brightness = 0.0] - The brightness factor, ranging from -1 to 1, where 0 means no change.
     * @param [options.contrast = 0.0] - The contrast factor, ranging from -1 to 1, where 0 means no change.
     */
    export class BrightnessContrastEffect extends Effect {
        constructor(options?: { blendFunction?: BlendFunction; brightness?: number; contrast?: number; });
    }

    /**
     * Constructs a new color average effect.
     * @param [blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     */
    export class ColorAverageEffect extends Effect {
        constructor(blendFunction?: BlendFunction);
    }

    /**
     * Constructs a new color depth effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.bits = 16] - The color bit depth.
     */
    export class ColorDepthEffect extends Effect {
        constructor(options?: { blendFunction?: BlendFunction; bits?: number; });
        /**
         * Returns the current color bit depth.
         * @returns The color bit depth.
         */
        getBitDepth(): number;
        /**
           * Sets the virtual amount of color bits.
          
          Each color channel will use a third of the available bits. The alpha
          channel remains unaffected.
          
          Note that the real color depth will not be altered by this effect.
           * @param bits - The new color bit depth.
           */
        setBitDepth(bits: number): void;
    }

    /**
     * Constructs a new chromatic aberration effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.offset] - The color offset.
     */
    export class ChromaticAberrationEffect extends Effect {
        constructor(options?: { blendFunction?: BlendFunction; offset?: Vector2; });
        /**
         * The color offset.
         */
        offset: Vector2;
        /**
         * Performs initialization tasks.
         * @param renderer - The renderer.
         * @param alpha - Whether the renderer uses the alpha channel or not.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
    }

    /**
     * Constructs a new depth effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.inverted = false] - Whether the depth values should be inverted.
     */
    export class DepthEffect extends Effect {
        constructor(options?: { blendFunction?: BlendFunction; inverted?: boolean; });
        /**
         * Indicates whether depth will be inverted.
         */
        inverted: boolean;
    }

    /**
     * Constructs a new depth of field effect.
     * @param camera - The main camera.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.focusDistance = 0.0] - The normalized focus distance. Range is [0.0, 1.0].
     * @param [options.focalLength = 0.05] - The focal length. Range is [0.0, 1.0].
     * @param [options.bokehScale = 1.0] - The scale of the bokeh blur.
     * @param [options.width = Resizer.AUTO_SIZE] - The render width.
     * @param [options.height = Resizer.AUTO_SIZE] - The render height.
     */
    export class DepthOfFieldEffect extends Effect {
        constructor(
            camera: Camera,
            options?: {
                blendFunction?: BlendFunction;
                focusDistance?: number;
                focalLength?: number;
                bokehScale?: number;
                width?: number;
                height?: number;
            }
        );
        /**
         * This pass blurs the foreground CoC buffer to soften edges.
         */
        blurPass: BlurPass;
        /**
           * A target position that should be kept in focus.
          
          Set this to `null` to disable auto focus.
           */
        target: Vector3;
        /**
         * The circle of confusion material.
         */
        circleOfConfusionMaterial: CircleOfConfusionMaterial;
        /**
         * The resolution of this effect.
         */
        resolution: Resizer;
        /**
         * The current bokeh scale.
         */
        bokehScale: number;
        /**
         * Calculates the focus distance from the camera to the given position.
         * @param target - The target.
         * @returns The normalized focus distance.
         */
        calculateFocusDistance(target: Vector3): number;
        /**
         * Sets the depth texture.
         * @param depthTexture - A depth texture.
         * @param [depthPacking = 0] - The depth packing.
         */
        setDepthTexture(depthTexture: Texture, depthPacking?: number): void;
        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
        /**
         * Updates the size of internal render targets.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Performs initialization tasks.
         * @param renderer - The renderer.
         * @param alpha - Whether the renderer uses the alpha channel or not.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
    }

    /**
     * Constructs a new dot screen effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.angle = 1.57] - The angle of the dot pattern.
     * @param [options.scale = 1.0] - The scale of the dot pattern.
     */
    export class DotScreenEffect extends Effect {
        constructor(options?: { blendFunction?: BlendFunction; angle?: number; scale?: number; });
        /**
         * Sets the pattern angle.
         * @param [angle] - The angle of the dot pattern.
         */
        setAngle(angle?: number): void;
    }

    /**
     * Constructs a new glitch effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.chromaticAberrationOffset] - A chromatic aberration offset. If provided, the glitch effect will influence this offset.
     * @param [options.delay] - The minimum and maximum delay between glitch activations in seconds.
     * @param [options.duration] - The minimum and maximum duration of a glitch in seconds.
     * @param [options.strength] - The strength of weak and strong glitches.
     * @param [options.perturbationMap] - A perturbation map. If none is provided, a noise texture will be created.
     * @param [options.dtSize = 64] - The size of the generated noise map. Will be ignored if a perturbation map is provided.
     * @param [options.columns = 0.05] - The scale of the blocky glitch columns.
     * @param [options.ratio = 0.85] - The threshold for strong glitches.
     */
    export class GlitchEffect extends Effect {
        constructor(options?: {
            blendFunction?: BlendFunction;
            chromaticAberrationOffset?: Vector2;
            delay?: Vector2;
            duration?: Vector2;
            strength?: Vector2;
            perturbationMap?: Texture;
            dtSize?: number;
            columns?: number;
            ratio?: number;
        });
        /**
         * The minimum and maximum delay between glitch activations in seconds.
         */
        delay: Vector2;
        /**
         * The minimum and maximum duration of a glitch in seconds.
         */
        duration: Vector2;
        /**
         * The effect mode.
         */
        mode: GlitchMode;
        /**
         * The strength of weak and strong glitches.
         */
        strength: Vector2;
        /**
           * The threshold for strong glitches, ranging from 0 to 1 where 0 means no
          weak glitches and 1 means no strong ones. The default ratio of 0.85
          offers a decent balance.
           */
        ratio: number;
        /**
         * The chromatic aberration offset.
         */
        chromaticAberrationOffset: Vector2;
        /**
         * Indicates whether the glitch effect is currently active.
         */
        active: boolean;
        /**
         * Returns the current perturbation map.
         * @returns The current perturbation map.
         */
        getPerturbationMap(): Texture;
        /**
           * Replaces the current perturbation map with the given one.
          
          The current map will be disposed if it was generated by this effect.
           * @param perturbationMap - The new perturbation map.
           */
        setPerturbationMap(perturbationMap: Texture): void;
        /**
         * Generates a perturbation map.
         * @param [size = 64] - The texture size.
         * @returns The perturbation map.
         */
        generatePerturbationMap(size?: number): DataTexture;
        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
    }

    /**
     * A glitch mode enumeration.
     * @property DISABLED - No glitches.
     * @property SPORADIC - Sporadic glitches.
     * @property CONSTANT_MILD - Constant mild glitches.
     * @property CONSTANT_WILD - Constant wild glitches.
     */
    export const GlitchMode: {
        DISABLED: number;
        SPORADIC: number;
        CONSTANT_MILD: number;
        CONSTANT_WILD: number;
    };

    /**
     * Constructs a new god rays effect.
     * @param camera - The main camera.
     * @param lightSource - The light source. Must not write depth and has to be flagged as transparent.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.SCREEN] - The blend function of this effect.
     * @param [options.samples = 60.0] - The number of samples per pixel.
     * @param [options.density = 0.96] - The density of the light rays.
     * @param [options.decay = 0.9] - An illumination decay factor.
     * @param [options.weight = 0.4] - A light ray weight factor.
     * @param [options.exposure = 0.6] - A constant attenuation coefficient.
     * @param [options.clampMax = 1.0] - An upper bound for the saturation of the overall effect.
     * @param [options.width = Resizer.AUTO_SIZE] - The render width.
     * @param [options.height = Resizer.AUTO_SIZE] - The render height.
     * @param [options.kernelSize = KernelSize.SMALL] - The blur kernel size. Has no effect if blur is disabled.
     * @param [options.blur = true] - Whether the god rays should be blurred to reduce artifacts.
     */
    export class GodRaysEffect extends Effect {
        constructor(
            camera: Camera,
            lightSource: Mesh | Points,
            options?: {
                blendFunction?: BlendFunction;
                samples?: number;
                density?: number;
                decay?: number;
                weight?: number;
                exposure?: number;
                clampMax?: number;
                width?: number;
                height?: number;
                kernelSize?: KernelSize;
                blur?: number;
            }
        );
        /**
           * A blur pass that reduces aliasing artifacts and makes the light softer.
          
          Disable this pass to improve performance.
           */
        blurPass: BlurPass;
        /**
           * A texture that contains the intermediate result of this effect.
          
          This texture will be applied to the scene colors unless the blend function
          is set to `SKIP`.
           */
        texture: Texture;
        /**
         * The internal god rays material.
         */
        godRaysMaterial: GodRaysMaterial;
        /**
         * The resolution of this effect.
         */
        resolution: Resizer;
        /**
         * The current width of the internal render targets.
         */
        width: number;
        /**
         * The current height of the internal render targets.
         */
        height: number;
        /**
         * Indicates whether dithering is enabled.
         */
        dithering: boolean;
        /**
         * Indicates whether the god rays should be blurred to reduce artifacts.
         */
        blur: boolean;
        /**
         * The blur kernel size.
         */
        kernelSize: KernelSize;
        /**
         * Returns the current resolution scale.
         * @returns The resolution scale.
         */
        getResolutionScale(): number;
        /**
         * Sets the resolution scale.
         * @param scale - The new resolution scale.
         */
        setResolutionScale(scale: number): void;
        /**
         * The number of samples per pixel.
         */
        samples: number;
        /**
         * Sets the depth texture.
         * @param depthTexture - A depth texture.
         * @param [depthPacking = 0] - The depth packing.
         */
        setDepthTexture(depthTexture: Texture, depthPacking?: number): void;
        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
        /**
         * Updates the size of internal render targets.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Performs initialization tasks.
         * @param renderer - The renderer.
         * @param alpha - Whether the renderer uses the alpha channel or not.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
    }

    /**
     * Constructs a new grid effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.OVERLAY] - The blend function of this effect.
     * @param [options.scale = 1.0] - The scale of the grid pattern.
     * @param [options.lineWidth = 0.0] - The line width of the grid pattern.
     */
    export class GridEffect extends Effect {
        constructor(
            options?: Partial<{
                blendFunction: BlendFunction;
                scale: number;
                lineWidth: number;
            }>
        );
        /**
         * Returns the current grid scale.
         * @returns The grid scale.
         */
        getScale(): number;
        /**
         * Sets the grid scale.
         * @param scale - The new grid scale.
         */
        setScale(scale: number): void;
        /**
         * Returns the current grid line width.
         * @returns The grid line width.
         */
        getLineWidth(): number;
        /**
         * Sets the grid line width.
         * @param lineWidth - The new grid line width.
         */
        setLineWidth(lineWidth: number): void;
        /**
         * Updates the size of this pass.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
    }

    /**
     * Constructs a new hue/saturation effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.hue = 0.0] - The hue in radians.
     * @param [options.saturation = 0.0] - The saturation factor, ranging from -1 to 1, where 0 means no change.
     */
    export class HueSaturationEffect extends Effect {
        constructor(options?: { blendFunction?: BlendFunction; hue?: number; saturation?: number; });
        /**
         * Sets the hue.
         * @param hue - The hue in radians.
         */
        setHue(hue: number): void;
    }

    /**
     * Constructs a new noise effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.SCREEN] - The blend function of this effect.
     * @param [options.premultiply = false] - Whether the noise should be multiplied with the input color.
     */
    export class NoiseEffect extends Effect {
        constructor(options?: { blendFunction?: BlendFunction; premultiply?: boolean; });
        /**
         * Indicates whether the noise should be multiplied with the input color.
         */
        premultiply: boolean;
    }

    /**
     * Constructs a new outline effect.
    
    If you want dark outlines, remember to use an appropriate blend function.
     * @param scene - The main scene.
     * @param camera - The main camera.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.SCREEN] - The blend function.  Set this to `BlendFunction.ALPHA` for dark outlines.
     * @param [options.patternTexture = null] - A pattern texture.
     * @param [options.edgeStrength = 1.0] - The edge strength.
     * @param [options.pulseSpeed = 0.0] - The pulse speed. A value of zero disables the pulse effect.
     * @param [options.visibleEdgeColor = 0xffffff] - The color of visible edges.
     * @param [options.hiddenEdgeColor = 0x22090a] - The color of hidden edges.
     * @param [options.width = Resizer.AUTO_SIZE] - The render width.
     * @param [options.height = Resizer.AUTO_SIZE] - The render height.
     * @param [options.kernelSize = KernelSize.VERY_SMALL] - The blur kernel size.
     * @param [options.blur = false] - Whether the outline should be blurred.
     * @param [options.xRay = true] - Whether occluded parts of selected objects should be visible.
     */
    export class OutlineEffect extends Effect {
        constructor(
            scene: Scene,
            camera: Camera,
            options?: Partial<{
                blendFunction: BlendFunction;
                patternTexture: number;
                edgeStrength: number;
                pulseSpeed: number;
                visibleEdgeColor: number;
                hiddenEdgeColor: number;
                width: number;
                height: number;
                kernelSize: KernelSize;
                blur: boolean;
                xRay: boolean;
            }>
        );
        /**
         * A blur pass.
         */
        blurPass: BlurPass;
        /**
         * A selection of objects that will be outlined.
         */
        selection: Selection;
        /**
         * The pulse speed. A value of zero disables the pulse effect.
         */
        pulseSpeed: number;
        /**
         * The resolution of this effect.
         */
        resolution: Resizer;
        /**
         * The current width of the internal render targets.
         */
        width: number;
        /**
         * The current height of the internal render targets.
         */
        height: number;
        selectionLayer: number;
        /**
         * Indicates whether dithering is enabled.
         */
        dithering: boolean;
        /**
         * The blur kernel size.
         */
        kernelSize: KernelSize;
        /**
         * Indicates whether the outlines should be blurred.
         */
        blur: boolean;
        /**
         * Indicates whether X-Ray outlines are enabled.
         */
        xRay: boolean;
        /**
           * Sets the pattern texture.
          
          You'll need to call {@link EffectPass#recompile} after changing the
          texture.
           * @param texture - The new texture.
           */
        setPatternTexture(texture: Texture): void;
        /**
         * Returns the current resolution scale.
         * @returns The resolution scale.
         */
        getResolutionScale(): number;
        /**
         * Sets the resolution scale.
         * @param scale - The new resolution scale.
         */
        setResolutionScale(scale: number): void;
        /**
         * Clears the current selection and selects a list of objects.
         * @param objects - The objects that should be outlined. This array will be copied.
         * @returns This pass.
         */
        setSelection(objects: Object3D[]): OutlinePass;
        /**
         * Clears the list of selected objects.
         * @returns This pass.
         */
        clearSelection(): OutlinePass;
        /**
         * Selects an object.
         * @param object - The object that should be outlined.
         * @returns This pass.
         */
        selectObject(object: Object3D): OutlinePass;
        /**
         * Deselects an object.
         * @param object - The object that should no longer be outlined.
         * @returns This pass.
         */
        deselectObject(object: Object3D): OutlinePass;
        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
        /**
         * Updates the size of internal render targets.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Performs initialization tasks.
         * @param renderer - The renderer.
         * @param alpha - Whether the renderer uses the alpha channel or not.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
    }

    /**
     * Constructs a new pixelation effect.
     * @param [granularity = 30.0] - The pixel granularity.
     */
    export class PixelationEffect extends Effect {
        constructor(granularity?: any);
        /**
         * Returns the pixel granularity.
         * @returns The granularity.
         */
        getGranularity(): number;
        /**
           * Sets the pixel granularity.
          
          A higher value yields coarser visuals.
           * @param granularity - The new granularity.
           */
        setGranularity(granularity: number): void;
        /**
         * Updates the granularity.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
    }

    /**
     * Constructs a new scanline effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.OVERLAY] - The blend function of this effect.
     * @param [options.density = 1.25] - The scanline density.
     */
    export class ScanlineEffect extends Effect {
        density: number;
        blendFunction: BlendFunction;
        constructor(options?: { blendFunction?: BlendFunction; density?: number; });
        /**
         * Returns the current scanline density.
         * @returns The scanline density.
         */
        getDensity(): number;
        /**
         * Sets the scanline density.
         * @param density - The new scanline density.
         */
        setDensity(density: number): void;
        /**
         * Updates the size of this pass.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
    }

    /**
     * Constructs a new shock wave effect.
     * @param camera - The main camera.
     * @param [epicenter] - The world position of the shock wave epicenter.
     * @param [options] - The options.
     * @param [options.speed = 2.0] - The animation speed.
     * @param [options.maxRadius = 1.0] - The extent of the shock wave.
     * @param [options.waveSize = 0.2] - The wave size.
     * @param [options.amplitude = 0.05] - The distortion amplitude.
     */
    export class ShockWaveEffect extends Effect {
        constructor(
            camera: Camera,
            epicenter?: Vector3,
            options?: {
                speed?: number;
                maxRadius?: number;
                waveSize?: number;
                amplitude?: number;
            }
        );
        /**
         * The main camera.
         */
        camera: Camera;
        /**
         * The epicenter.
         * @example
         * shockWavePass.epicenter = myMesh.position;
         */
        epicenter: Vector3;
        /**
         * The speed of the shock wave animation.
         */
        speed: number;
        /**
         * Emits the shock wave.
         */
        explode(): void;
        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [delta] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, delta?: number): void;
    }

    /**
     * Constructs a new selective bloom effect.
     * @param scene - The main scene.
     * @param camera - The main camera.
     * @param [options] - The options. See {@link BloomEffect} for details.
     */
    export class SelectiveBloomEffect extends Effect {
        constructor(scene: Scene, camera: Camera, options?: any);
        /**
         * A selection of objects.
         */
        selection: Selection;
        /**
         * Indicates whether the selection should be considered inverted.
         */
        inverted: boolean;
        /**
         * Indicates whether the scene background should be ignored.
         */
        ignoreBackground: boolean;

        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
        /**
         * Updates the size of internal render targets.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Performs initialization tasks.
         * @param renderer - The renderer.
         * @param alpha - Whether the renderer uses the alpha channel.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
    }

    /**
     * Constructs a new sepia effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.intensity = 1.0] - The intensity of the effect.
     */
    export class SepiaEffect extends Effect {
        constructor(options?: { blendFunction?: BlendFunction; intensity?: number; });
    }

    /**
     * Constructs a new SMAA effect.
     * @param searchImage - The SMAA search image. Preload this image using the {@link SMAAImageLoader}.
     * @param areaImage - The SMAA area image. Preload this image using the {@link SMAAImageLoader}.
     * @param [preset = SMAAPreset.HIGH] - An SMAA quality preset.
     * @param [edgeDetectionMode = EdgeDetectionMode.COLOR] - The edge detection mode.
     */
    export class SMAAEffect extends Effect {
        constructor(searchImage: Image, areaImage: Image, preset?: SMAAPreset, edgeDetectionMode?: EdgeDetectionMode);
        /**
         * The internal edge detection material.
         */
        edgeDetectionMaterial: EdgeDetectionMaterial;
        /**
         * The internal edge detection material.
         */
        colorEdgesMaterial: EdgeDetectionMaterial;
        /**
         * The internal edge weights material.
         */
        weightsMaterial: SMAAWeightsMaterial;
        /**
           * Sets the edge detection sensitivity.
          
          See {@link EdgeDetectionMaterial#setEdgeDetectionThreshold} for more details.
           * @param threshold - The edge detection sensitivity. Range: [0.05, 0.5].
           */
        setEdgeDetectionThreshold(threshold: number): void;
        /**
           * Sets the maximum amount of horizontal/vertical search steps.
          
          See {@link SMAAWeightsMaterial#setOrthogonalSearchSteps} for more details.
           * @param steps - The search steps. Range: [0, 112].
           */
        setOrthogonalSearchSteps(steps: number): void;
        /**
         * Applies the given quality preset.
         * @param preset - The preset.
         */
        applyPreset(preset: SMAAPreset): void;
        /**
         * Sets the depth texture.
         * @param depthTexture - A depth texture.
         * @param [depthPacking = 0] - The depth packing.
         */
        setDepthTexture(depthTexture: Texture, depthPacking?: number): void;
        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
        /**
         * Updates the size of internal render targets.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Deletes internal render targets and textures.
         */
        dispose(): void;
        /**
           * The SMAA search image, encoded as a base64 data URL.
          
          Use this image data to create an Image instance and use it together with
          the area image to create an {@link SMAAEffect}.
           * @example
           * const searchImage = new Image();
          searchImage.addEventListener("load", progress);
          searchImage.src = SMAAEffect.searchImageDataURL;
           */
        static searchImageDataURL: string;
        /**
           * The SMAA area image, encoded as a base64 data URL.
          
          Use this image data to create an Image instance and use it together with
          the search image to create an {@link SMAAEffect}.
           * @example
           * const areaImage = new Image();
          areaImage.addEventListener("load", progress);
          areaImage.src = SMAAEffect.areaImageDataURL;
           */
        static areaImageDataURL: string;
    }

    /**
     * An enumeration of SMAA presets.
     * @property LOW - Results in around 60% of the maximum quality.
     * @property MEDIUM - Results in around 80% of the maximum quality.
     * @property HIGH - Results in around 95% of the maximum quality.
     * @property ULTRA - Results in around 99% of the maximum quality.
     */
    export const SMAAPreset: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
        ULTRA: number;
    };

    /**
     * Constructs a new SSAO effect.
     * @param camera - The main camera.
     * @param normalBuffer - A texture that contains the scene normals. See {@link NormalPass}.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.MULTIPLY] - The blend function of this effect.
     * @param [options.samples = 11] - The amount of samples per pixel. Should not be a multiple of the ring count.
     * @param [options.rings = 4] - The amount of rings in the occlusion sampling pattern.
     * @param [options.distanceThreshold = 0.97] - A global distance threshold at which the occlusion effect starts to fade out. Range [0.0, 1.0].
     * @param [options.distanceFalloff = 0.03] - The distance falloff. Influences the smoothness of the overall occlusion cutoff. Range [0.0, 1.0].
     * @param [options.rangeThreshold = 0.0005] - A local occlusion range threshold at which the occlusion starts to fade out. Range [0.0, 1.0].
     * @param [options.rangeFalloff = 0.001] - The occlusion range falloff. Influences the smoothness of the proximity cutoff. Range [0.0, 1.0].
     * @param [options.luminanceInfluence = 0.7] - Determines how much the luminance of the scene influences the ambient occlusion.
     * @param [options.radius = 18.25] - The occlusion sampling radius.
     * @param [options.scale = 1.0] - The scale of the ambient occlusion.
     * @param [options.bias = 0.0] - An occlusion bias.
     */
    export class SSAOEffect extends Effect {
        constructor(
            camera: Camera,
            normalBuffer: Texture,
            options?: {
                blendFunction?: BlendFunction;
                samples?: number;
                rings?: number;
                distanceThreshold?: number;
                distanceFalloff?: number;
                rangeThreshold?: number;
                rangeFalloff?: number;
                luminanceInfluence?: number;
                radius?: number;
                scale?: number;
                bias?: number;
            }
        );
        /**
         * The amount of occlusion samples per pixel.
         */
        samples: number;
        /**
         * The amount of rings in the occlusion sampling spiral pattern.
         */
        rings: number;
        /**
         * The occlusion sampling radius.
         */
        radius: number;
        /**
         * Sets the occlusion distance cutoff.
         * @param threshold - The distance threshold. Range [0.0, 1.0].
         * @param falloff - The falloff. Range [0.0, 1.0].
         */
        setDistanceCutoff(threshold: number, falloff: number): void;
        /**
         * Sets the occlusion proximity cutoff.
         * @param threshold - The range threshold. Range [0.0, 1.0].
         * @param falloff - The falloff. Range [0.0, 1.0].
         */
        setProximityCutoff(threshold: number, falloff: number): void;
        /**
         * Updates the camera projection matrix uniforms.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
    }

    /**
     * Constructs a new texture effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.texture] - A texture.
     */
    export class TextureEffect extends Effect {
        constructor(options?: Partial<{ blendFunction: BlendFunction; texture: Texture; }>);
        /**
         * The texture.
         */
        texture: Texture;
        /**
           * Indicates whether aspect correction is enabled.
          
          If enabled, the texture can be scaled using the `scale` uniform.
           */
        aspectCorrection: number;
        /**
           * Indicates whether the texture UV coordinates will be transformed using the
          transformation matrix of the texture.
          
          Cannot be used if aspect correction is enabled.
           */
        uvTransform: boolean;
        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
    }

    /**
     * Constructs a new tone mapping effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.adaptive = true] - Whether the tone mapping should use an adaptive luminance map.
     * @param [options.resolution = 256] - The render texture resolution of the luminance map.
     * @param [options.middleGrey = 0.6] - The middle grey factor.
     * @param [options.maxLuminance = 16.0] - The maximum luminance.
     * @param [options.averageLuminance = 1.0] - The average luminance.
     * @param [options.adaptationRate = 1.0] - The luminance adaptation rate.
     */
    export class ToneMappingEffect extends Effect {
        constructor(options?: {
            blendFunction?: BlendFunction;
            adaptive?: boolean;
            resolution?: number;
            middleGrey?: number;
            maxLuminance?: number;
            averageLuminance?: number;
            adaptationRate?: number;
        });
        /**
         * The resolution of the render targets.
         */
        resolution: number;
        /**
         * Indicates whether this pass uses adaptive luminance.
         */
        adaptive: boolean;
        /**
         * The luminance adaptation rate.
         */
        adaptationRate: number;

        distinction: number;
        /**
         * Updates this effect.
         * @param renderer - The renderer.
         * @param inputBuffer - A frame buffer that contains the result of the previous pass.
         * @param [deltaTime] - The time between the last frame and the current one in seconds.
         */
        update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime?: number): void;
        /**
         * Updates the size of internal render targets.
         * @param width - The width.
         * @param height - The height.
         */
        setSize(width: number, height: number): void;
        /**
         * Performs initialization tasks.
         * @param renderer - The renderer.
         * @param alpha - Whether the renderer uses the alpha channel or not.
         * @param frameBufferType - The type of the main frame buffers.
         */
        initialize(renderer: WebGLRenderer, alpha: boolean, frameBufferType: number): void;
    }

    /**
     * Constructs a new vignette effect.
     * @param [options] - The options.
     * @param [options.blendFunction = BlendFunction.NORMAL] - The blend function of this effect.
     * @param [options.eskil = false] - Enables Eskil's vignette technique.
     * @param [options.offset = 0.5] - The vignette offset.
     * @param [options.darkness = 0.5] - The vignette darkness.
     */
    export class VignetteEffect extends Effect {
        constructor(options?: { blendFunction?: BlendFunction; eskil?: boolean; offset?: number; darkness?: number; });
        /**
         * Indicates whether Eskil's vignette technique is enabled.
         */
        eskil: boolean;
    }

    /**
     * Constructs a new image data container.
     * @param [width = 0] - The width of the image.
     * @param [height = 0] - The height of the image.
     * @param [data = null] - The image data.
     */
    export class RawImageData {
        constructor(width?: number, height?: number, data?: Uint8ClampedArray);
        /**
         * The width of the image.
         */
        width: number;
        /**
         * The height of the image.
         */
        height: number;
        /**
         * The image data.
         */
        data: Uint8ClampedArray;
        /**
         * Creates a canvas from this image data.
         * @returns The canvas or null if it couldn't be created.
         */
        toCanvas(): Canvas;
        /**
         * Creates a new image data container.
         * @param data - Raw image data.
         * @returns The image data.
         */
        static from(data: any): RawImageData;
    }

    /**
     * Constructs a new SMAA image loader.
     * @param [manager] - A loading manager.
     */
    export class SMAAImageLoader extends Loader {
        constructor(manager?: LoadingManager);
        /**
         * Indicates whether data image caching is disabled.
         */
        disableCache: boolean;
        /**
         * Loads the SMAA data images.
         * @param [onLoad] - A function to call when the loading process is done.
         * @param [onError] - A function to call when an error occurs.
         * @returns A promise that returns the search image and area image as a pair.
         */
        load(
            url: string,
            onLoad?: (result: any) => void,
            onProgress?: (event: ProgressEvent) => void,
            onError?: (event: ErrorEvent) => void
        ): Promise<any, any>;
    }

    /**
     * SMAA area image data.
    
    This texture allows to obtain the area for a certain pattern and distances
    to the left and to the right of the identified line.
    
    Based on the official python scripts:
     https://github.com/iryoku/smaa/tree/master/Scripts
     */
    export class SMAAAreaImageData {
        /**
         * Creates a new area image.
         * @returns The generated image data.
         */
        static generate(): RawImageData;
    }

    /**
     * SMAA search image data.
    
    This image stores information about how many pixels the line search
    algorithm must advance in the last step.
    
    Based on the official python scripts:
     https://github.com/iryoku/smaa/tree/master/Scripts
     */
    export class SMAASearchImageData {
        /**
         * Creates a new search image.
         * @returns The generated image data.
         */
        static generate(): RawImageData;
    }
}
