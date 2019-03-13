import { Matrix4 } from 'three/src/math/Matrix4';
import { BaseShader, BaseShaderStatics } from "../BaseShader";
import { Interpolation } from '../utils/Intepolation';

// TODO: GLSLIFY THIS SHADER
export class VolumeRendererSecondPassShader extends BaseShader implements BaseShaderStatics {

  protected _ManualVertShader(): string {
    throw new Error("Method not implemented.");
  }

  protected _ManualFragShader(): string {
    return `
    void getIntensity(in vec3 dataCoordinates, out float intensity, out vec3 gradient){
    
      vec4 dataValue = vec4(0., 0., 0., 0.);
      ${Interpolation.ShadersInterpolation(this, 'dataCoordinates', 'dataValue', 'gradient')}
    
      intensity = dataValue.r;
    
      // rescale/slope
      intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
      // window level
      float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
      intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];
    }
    
    void main(void) {
      const int maxSteps = 1024;
      
        //
        vec2 texc = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                      ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );
        //The back position is the world space position stored in the texture.
        vec3 backPosNormalized = texture2D(uTextureBack, texc).xyz;
        
        //
        vec3 tBack = vec3(backPosNormalized.x * (uWorldBBox[1] - uWorldBBox[0]) + uWorldBBox[0],
                           backPosNormalized.y * (uWorldBBox[3] - uWorldBBox[2]) + uWorldBBox[2],
                           backPosNormalized.z * (uWorldBBox[5] - uWorldBBox[4]) + uWorldBBox[4]);
        vec3 tFront = vec3(vPos.x, vPos.y, vPos.z);
    
        // gl_FragColor = vec4(tFront.xyz, 1.);
        // // gl_FragColor = vec4(backPosNormalized.xyz, 1.);
        // return;
      
      // the ray
      vec3 rayOrigin = cameraPosition;
      float dist = distance(tBack, tFront);
      vec3 rayDirection = normalize(tBack - tFront);
      // gl_FragColor = vec4(rayDirection.xyz, 1.);
      // return;
    
      // init the ray marching
      float tCurrent = 0.;
      float tStep = dist / float(uSteps);
      // gl_FragColor = vec4(tStep, 1., 1., 1.);
      // return;
    
      vec4 accumulatedColor = vec4(0.0);
      float accumulatedAlpha = 0.0;
    
      for(int rayStep = 0; rayStep < maxSteps; rayStep++){
        vec3 currentPosition = tFront + rayDirection * tCurrent;
        // some non-linear FUN
        // some occlusion issue to be fixed
        vec3 transformedPosition = currentPosition; //transformPoint(currentPosition, uAmplitude, uFrequence);
        // world to data coordinates
        // rounding trick
        // first center of first voxel in data space is CENTERED on (0,0,0)
        vec4 dataCoordinatesRaw = uWorldToData * vec4(transformedPosition, 1.0);
        vec3 currentVoxel = vec3(dataCoordinatesRaw.x, dataCoordinatesRaw.y, dataCoordinatesRaw.z);
        float intensity = 0.0;
        vec3 gradient = vec3(0., 0., 0.);
        getIntensity(currentVoxel, intensity, gradient);
    
        vec4 colorSample;
        float alphaSample;
        if(uLut == 1){
          vec4 colorFromLUT = texture2D( uTextureLUT, vec2( intensity, 1.0) );
          // 256 colors
          colorSample = colorFromLUT;
          alphaSample = colorFromLUT.a;
        }
        else{
          alphaSample = intensity;
          colorSample.r = colorSample.g = colorSample.b = intensity * alphaSample;
        }
    
        alphaSample = 1.0 - pow((1.0- alphaSample),tStep*uAlphaCorrection);
        alphaSample *= (1.0 - accumulatedAlpha);
    
        accumulatedColor += alphaSample * colorSample;
        accumulatedAlpha += alphaSample;
    
        tCurrent += tStep;
    
        if(tCurrent > dist || accumulatedAlpha >= 1.0 ) break;
      }
    
      gl_FragColor = vec4(accumulatedColor.xyz, accumulatedAlpha);
    }
       `;
  }

  // tslint:disable-next-line:typedef
  constructor() {
      super('volume_renderer_second_pass', false, true);
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
      uWorldBBox: {
        type: 'fv1',
        value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        typeGLSL: 'float',
        length: 6,
      },
      uSteps: {
        type: 'i',
        value: 256,
        typeGLSL: 'int',
      },
      uAlphaCorrection: {
        type: 'f',
        value: 0.5,
        typeGLSL: 'float',
      },
      uFrequence: {
        type: 'f',
        value: 0.0,
        typeGLSL: 'float',
      },
      uAmplitude: {
        type: 'f',
        value: 0.0,
        typeGLSL: 'float',
      },
      uTextureBack: {
        type: 't',
        value: [],
        typeGLSL: 'sampler2D',
      },
    };
  }
}
