import { ShaderUtils } from './ShaderUtils';
import { Unpack } from './Unpack';

export class Interpolation {
    public static ShadersInterpolation(
        // tslint:disable-next-line:no-any
        baseFragment: any, 
        currentVoxel: string, 
        dataValue: string, 
        gradient: string
    ) {
        switch (baseFragment.FragUniforms.uInterpolation.value) {
          case 0:
            // no interpolation
            return this.identity(baseFragment, currentVoxel, dataValue);
      
          case 1:
            // trilinear interpolation
            return this.trilinear(baseFragment, currentVoxel, dataValue, gradient);
      
          default:
            return this.identity(baseFragment, currentVoxel, dataValue);
        }
    }

    private static identity(
        // tslint:disable-next-line:no-any
        baseFragment: any, 
        // tslint:disable-next-line:no-any
        currentVoxel: any, 
        // tslint:disable-next-line:no-any
        dataValue: any,   
    ){
        const base = baseFragment;
        const name = 'interpolationIdentity';
        const definition = `
        void ${name}(in vec3 currentVoxel, out vec4 dataValue){
          // lower bound
          vec3 rcurrentVoxel = vec3(floor(currentVoxel.x + 0.5 ), floor(currentVoxel.y + 0.5 ), floor(currentVoxel.z + 0.5 ));
          ivec3 voxel = ivec3(int(rcurrentVoxel.x), int(rcurrentVoxel.y), int(rcurrentVoxel.z));
        
          vec4 tmp = vec4(0., 0., 0., 0.);
          int offset = 0;
        
          ${ShaderUtils.Texture3D(base, 'voxel', 'tmp', 'offset')}
          ${Unpack.Unpack(base, 'tmp', 'offset', 'dataValue')}
        }
            `;
        base.functions[name] = definition;
        return `${name}(${currentVoxel}, ${dataValue});`;
    }

    private static trilinear(
        // tslint:disable-next-line:no-any
        baseFragment: any, 
        // tslint:disable-next-line:no-any
        currentVoxel: any, 
        // tslint:disable-next-line:no-any
        dataValue: any,   
        // tslint:disable-next-line:no-any
        gradient: any
    ) {
        const base = baseFragment;
        const name = 'interpolationTrilinear';
        const definition = `void trilinearInterpolation(
            in vec3 normalizedPosition,
            out vec4 interpolatedValue,
            in vec4 v000, in vec4 v100,
            in vec4 v001, in vec4 v101,
            in vec4 v010, in vec4 v110,
            in vec4 v011, in vec4 v111) {
            // https://en.wikipedia.org/wiki/Trilinear_interpolation
            vec4 c00 = v000 * ( 1.0 - normalizedPosition.x ) + v100 * normalizedPosition.x;
            vec4 c01 = v001 * ( 1.0 - normalizedPosition.x ) + v101 * normalizedPosition.x;
            vec4 c10 = v010 * ( 1.0 - normalizedPosition.x ) + v110 * normalizedPosition.x;
            vec4 c11 = v011 * ( 1.0 - normalizedPosition.x ) + v111 * normalizedPosition.x;
          
            // c0 and c1
            vec4 c0 = c00 * ( 1.0 - normalizedPosition.y) + c10 * normalizedPosition.y;
            vec4 c1 = c01 * ( 1.0 - normalizedPosition.y) + c11 * normalizedPosition.y;
          
            // c
            vec4 c = c0 * ( 1.0 - normalizedPosition.z) + c1 * normalizedPosition.z;
            interpolatedValue = c;
          }
          
          void ${name}(in vec3 currentVoxel, out vec4 dataValue, out vec3 gradient){
          
            vec3 lower_bound = floor(currentVoxel);
            lower_bound = max(vec3(0.), lower_bound);
            
            vec3 higher_bound = lower_bound + vec3(1.);
          
            vec3 normalizedPosition = (currentVoxel - lower_bound);
            normalizedPosition =  max(vec3(0.), normalizedPosition);
          
            vec4 interpolatedValue = vec4(0.);
          
            //
            // fetch values required for interpolation
            //
            vec4 v000 = vec4(0.0, 0.0, 0.0, 0.0);
            vec3 c000 = vec3(lower_bound.x, lower_bound.y, lower_bound.z);
            ${this.identity(base, 'c000', 'v000')}
          
            //
            vec4 v100 = vec4(0.0, 0.0, 0.0, 0.0);
            vec3 c100 = vec3(higher_bound.x, lower_bound.y, lower_bound.z);
            ${this.identity(base, 'c100', 'v100')}
          
            //
            vec4 v001 = vec4(0.0, 0.0, 0.0, 0.0);
            vec3 c001 = vec3(lower_bound.x, lower_bound.y, higher_bound.z);
            ${this.identity(base, 'c001', 'v001')}
          
            //
            vec4 v101 = vec4(0.0, 0.0, 0.0, 0.0);
            vec3 c101 = vec3(higher_bound.x, lower_bound.y, higher_bound.z);
            ${this.identity(base, 'c101', 'v101')}
            
            //
            vec4 v010 = vec4(0.0, 0.0, 0.0, 0.0);
            vec3 c010 = vec3(lower_bound.x, higher_bound.y, lower_bound.z);
            ${this.identity(base, 'c010', 'v010')}
          
            vec4 v110 = vec4(0.0, 0.0, 0.0, 0.0);
            vec3 c110 = vec3(higher_bound.x, higher_bound.y, lower_bound.z);
            ${this.identity(base, 'c110', 'v110')}
          
            //
            vec4 v011 = vec4(0.0, 0.0, 0.0, 0.0);
            vec3 c011 = vec3(lower_bound.x, higher_bound.y, higher_bound.z);
            ${this.identity(base, 'c011', 'v011')}
          
            vec4 v111 = vec4(0.0, 0.0, 0.0, 0.0);
            vec3 c111 = vec3(higher_bound.x, higher_bound.y, higher_bound.z);
            ${this.identity(base, 'c111', 'v111')}
          
            // _compute interpolation at position
            trilinearInterpolation(normalizedPosition, interpolatedValue ,v000, v100, v001, v101, v010,v110, v011,v111);
            dataValue = interpolatedValue;
          
            // That breaks shading in volume rendering
            // if (gradient.x == 1.) { // skip gradient calculation for slice helper
            //  return;
            // }
          
            // _compute gradient
            float gradientStep = 0.005;
          
            // x axis
            vec3 g100 = vec3(1., 0., 0.);
            vec3 ng100 = normalizedPosition + g100 * gradientStep;
            ng100.x = min(1., ng100.x);
          
            vec4 vg100 = vec4(0.);
            trilinearInterpolation(ng100, vg100 ,v000, v100, v001, v101, v010,v110, v011,v111);
          
            vec3 go100 = -g100;
            vec3 ngo100 = normalizedPosition + go100 * gradientStep;
            ngo100.x = max(0., ngo100.x);
          
            vec4 vgo100 = vec4(0.);
            trilinearInterpolation(ngo100, vgo100 ,v000, v100, v001, v101, v010,v110, v011,v111);
          
            gradient.x = (g100.x * vg100.x + go100.x * vgo100.x);
          
            // y axis
            vec3 g010 = vec3(0., 1., 0.);
            vec3 ng010 = normalizedPosition + g010 * gradientStep;
            ng010.y = min(1., ng010.y);
          
            vec4 vg010 = vec4(0.);
            trilinearInterpolation(ng010, vg010 ,v000, v100, v001, v101, v010,v110, v011,v111);
          
            vec3 go010 = -g010;
            vec3 ngo010 = normalizedPosition + go010 * gradientStep;
            ngo010.y = max(0., ngo010.y);
          
            vec4 vgo010 = vec4(0.);
            trilinearInterpolation(ngo010, vgo010 ,v000, v100, v001, v101, v010,v110, v011,v111);
          
            gradient.y = (g010.y * vg010.x + go010.y * vgo010.x);
          
            // z axis
            vec3 g001 = vec3(0., 0., 1.);
            vec3 ng001 = normalizedPosition + g001 * gradientStep;
            ng001.z = min(1., ng001.z);
          
            vec4 vg001 = vec4(0.);
            trilinearInterpolation(ng001, vg001 ,v000, v100, v001, v101, v010,v110, v011,v111);
          
            vec3 go001 = -g001;
            vec3 ngo001 = normalizedPosition + go001 * gradientStep;
            ngo001.z = max(0., ngo001.z);
          
            vec4 vgo001 = vec4(0.);
            trilinearInterpolation(ngo001, vgo001 ,v000, v100, v001, v101, v010,v110, v011,v111);
          
            gradient.z = (g001.z * vg001.x + go001.z * vgo001.x);
          
            // normalize gradient
            // +0.0001  instead of if?
            float gradientMagnitude = length(gradient);
            if (gradientMagnitude > 0.0) {
              gradient = -(1. / gradientMagnitude) * gradient;
            }
          }`;
        base.functions[name] = definition;
        return `${name}(${currentVoxel}, ${dataValue}, ${gradient});`;
    }
}