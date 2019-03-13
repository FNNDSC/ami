import { Matrix4 } from 'three/src/math/Matrix4';
import { BaseShader, BaseShaderStatics } from "../BaseShader";
import { Interpolation } from '../utils/Intepolation';

export class DataShader extends BaseShader implements BaseShaderStatics {
    protected _ManualVertShader(): string {
        throw new Error("Method not implemented.");
    }
    protected _ManualFragShader(): string {
        return `
        void main(void) {
        
          // draw border if slice is cropped
          // float uBorderDashLength = 10.;
        
          if( uCanvasWidth > 0. &&
              ((gl_FragCoord.x > uBorderMargin && (gl_FragCoord.x - uBorderMargin) < uBorderWidth) ||
               (gl_FragCoord.x < (uCanvasWidth - uBorderMargin) && (gl_FragCoord.x + uBorderMargin) > (uCanvasWidth - uBorderWidth) ))){
            float valueY = mod(gl_FragCoord.y, 2. * uBorderDashLength);
            if( valueY < uBorderDashLength && gl_FragCoord.y > uBorderMargin && gl_FragCoord.y < (uCanvasHeight - uBorderMargin) ){
              gl_FragColor = vec4(uBorderColor, 1.);
              return;
            }
          }
        
          if( uCanvasHeight > 0. &&
              ((gl_FragCoord.y > uBorderMargin && (gl_FragCoord.y - uBorderMargin) < uBorderWidth) ||
               (gl_FragCoord.y < (uCanvasHeight - uBorderMargin) && (gl_FragCoord.y + uBorderMargin) > (uCanvasHeight - uBorderWidth) ))){
            float valueX = mod(gl_FragCoord.x, 2. * uBorderDashLength);
            if( valueX < uBorderDashLength && gl_FragCoord.x > uBorderMargin && gl_FragCoord.x < (uCanvasWidth - uBorderMargin) ){
              gl_FragColor = vec4(uBorderColor, 1.);
              return;
            }
          }
        
          // get texture coordinates of current pixel
          vec4 dataValue = vec4(0.);
          vec3 gradient = vec3(1.); // gradient calculations will be skipped if it is equal to vec3(1.) 
          float steps = floor(uThickness / uSpacing + 0.5);
        
          if (steps > 1.) {
            vec3 origin = vPos - uThickness * 0.5 * vNormal;
            vec4 dataValueAcc = vec4(0.);
            for (float step = 0.; step < 128.; step++) {
              if (step >= steps) {
                break;
              }
        
              vec4 dataCoordinates = uWorldToData * vec4(origin + step * uSpacing * vNormal, 1.);
              vec3 currentVoxel = dataCoordinates.xyz;
              ${Interpolation.ShadersInterpolation(this, 'currentVoxel', 'dataValueAcc', 'gradient')};
        
              if (step == 0.) {
                dataValue.r = dataValueAcc.r;
                continue;
              }
        
              if (uThicknessMethod == 0) {
                dataValue.r = max(dataValueAcc.r, dataValue.r);
              }
              if (uThicknessMethod == 1) {
                dataValue.r += dataValueAcc.r;
              }
              if (uThicknessMethod == 2) {
                dataValue.r = min(dataValueAcc.r, dataValue.r);
              }
            }
        
            if (uThicknessMethod == 1) {
              dataValue.r /= steps;
            }
          } else {
            vec4 dataCoordinates = uWorldToData * vec4(vPos, 1.);
            vec3 currentVoxel = dataCoordinates.xyz;
            ${Interpolation.ShadersInterpolation(this, 'currentVoxel', 'dataValue', 'gradient')}
          }
        
          if(uNumberOfChannels == 1){
            // rescale/slope
            float realIntensity = dataValue.r * uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
          
            // threshold
            if (realIntensity < uLowerUpperThreshold[0] || realIntensity > uLowerUpperThreshold[1]) {
              discard;
            }
          
            // normalize
            float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
            float normalizedIntensity =
              ( realIntensity - windowMin ) / uWindowCenterWidth[1];
            dataValue.r = dataValue.g = dataValue.b = normalizedIntensity;
            dataValue.a = 1.;
        
            // apply LUT
            if(uLut == 1){
              // should opacity be grabbed there?
              dataValue = texture2D( uTextureLUT, vec2( normalizedIntensity , 1.0) );
            }
          
            // apply segmentation
            if(uLutSegmentation == 1){
              // should opacity be grabbed there?
              //
              float textureWidth = 256.;
              float textureHeight = 128.;
              float min = 0.;
              // start at 0!
              int adjustedIntensity = int(floor(realIntensity + 0.5));
          
              // Get row and column in the texture
              int colIndex = int(mod(float(adjustedIntensity), textureWidth));
              int rowIndex = int(floor(float(adjustedIntensity)/textureWidth));
          
              float texWidth = 1./textureWidth;
              float texHeight = 1./textureHeight;
            
              // Map row and column to uv
              vec2 uv = vec2(0,0);
              uv.x = 0.5 * texWidth + (texWidth * float(colIndex));
              uv.y = 1. - (0.5 * texHeight + float(rowIndex) * texHeight);
          
              dataValue = texture2D( uTextureLUTSegmentation, uv );
            }
          }
        
          if(uInvert == 1){
            dataValue.xyz = vec3(1.) - dataValue.xyz;
          }
        
          dataValue.a = dataValue.a*uOpacity;
        
          gl_FragColor = dataValue;
        }
           `;
    }

    // tslint:disable-next-line:typedef
    constructor() {
        super('data', false, true);
    }

    public static Uniforms() {
        return {
          uTextureSize: {
            type: 'i',
            value: 0,
            typeGLSL: 'int',
          },
          uTextureContainer: {
            type: 'tv',
            value: [],
            typeGLSL: 'sampler2D',
            length: 7,
          },
          uDataDimensions: {
            type: 'iv',
            value: [0, 0, 0],
            typeGLSL: 'ivec3',
          },
          uWorldToData: {
            type: 'm4',
            value: new Matrix4(),
            typeGLSL: 'mat4',
          },
          uWindowCenterWidth: {
            type: 'fv1',
            value: [0.0, 0.0],
            typeGLSL: 'float',
            length: 2,
          },
          uLowerUpperThreshold: {
            type: 'fv1',
            value: [0.0, 0.0],
            typeGLSL: 'float',
            length: 2,
          },
          uRescaleSlopeIntercept: {
            type: 'fv1',
            value: [0.0, 0.0],
            typeGLSL: 'float',
            length: 2,
          },
          uNumberOfChannels: {
            type: 'i',
            value: 1,
            typeGLSL: 'int',
          },
          uBitsAllocated: {
            type: 'i',
            value: 8,
            typeGLSL: 'int',
          },
          uInvert: {
            type: 'i',
            value: 0,
            typeGLSL: 'int',
          },
          uLut: {
            type: 'i',
            value: 0,
            typeGLSL: 'int',
          },
          uTextureLUT: {
            type: 't',
            value: [],
            typeGLSL: 'sampler2D',
          },
          uLutSegmentation: {
            type: 'i',
            value: 0,
            typeGLSL: 'int',
          },
          uTextureLUTSegmentation: {
            type: 't',
            value: [],
            typeGLSL: 'sampler2D',
          },
          uPixelType: {
            type: 'i',
            value: 0,
            typeGLSL: 'int',
          },
          uPackedPerPixel: {
            type: 'i',
            value: 1,
            typeGLSL: 'int',
          },
          uInterpolation: {
            type: 'i',
            value: 1,
            typeGLSL: 'int',
          },
          uCanvasWidth: {
            type: 'f',
            value: 0,
            typeGLSL: 'float',
          },
          uCanvasHeight: {
            type: 'f',
            value: 0,
            typeGLSL: 'float',
          },
          uBorderColor: {
            type: 'v3',
            value: [1.0, 0.0, 0.5],
            typeGLSL: 'vec3',
          },
          uBorderWidth: {
            type: 'f',
            value: 2,
            typeGLSL: 'float',
          },
          uBorderMargin: {
            type: 'f',
            value: 2,
            typeGLSL: 'float',
          },
          uBorderDashLength: {
            type: 'f',
            value: 10,
            typeGLSL: 'float',
          },
          uOpacity: {
            type: 'f',
            value: 1.0,
            typeGLSL: 'float',
          },
          uSpacing: {
            type: 'f',
            value: 0,
            typeGLSL: 'float',
          },
          uThickness: {
            type: 'f',
            value: 0,
            typeGLSL: 'float',
          },
          uThicknessMethod: {
            type: 'i',
            value: 0,
            typeGLSL: 'int',
          },
        };
      }
}