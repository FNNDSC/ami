export class ShaderUtils {
    public static IntersectsBox (
        // tslint:disable-next-line:typedef
        name = 'intersectBox',
        // tslint:disable-next-line:typedef
        rayOrigin = 'rayOrigin',
        // tslint:disable-next-line:typedef
        rayDirection = 'rayDirection',
        // tslint:disable-next-line:typedef
        aabbMin = 'aabbMin',
        // tslint:disable-next-line:typedef
        aabbMax = 'aabbMax',
        // tslint:disable-next-line:typedef
        tNear = 'tNear',
        // tslint:disable-next-line:typedef
        tFar = 'tFar',
        // tslint:disable-next-line:typedef
        intersect = 'intersect',
        // tslint:disable-next-line:typedef
        base = {
          functions: {},
          uniforms: {},
        }
    ) {
        const definition = `
    void ${
          name
        }(vec3 rayOrigin, vec3 rayDirection, vec3 boxMin, vec3 boxMax, out float tNear, out float tFar, out bool intersect){
      // compute intersection of ray with all six bbox planes
      vec3 invRay = vec3(1.) / rayDirection;
      vec3 tBot = invRay * (boxMin - rayOrigin);
      vec3 tTop = invRay * (boxMax - rayOrigin);
      // re-order intersections to find smallest and largest on each axis
      vec3 tMin = min(tTop, tBot);
      vec3 tMax = max(tTop, tBot);
      // find the largest tMin and the smallest tMax
      float largest_tMin = max(max(tMin.x, tMin.y), max(tMin.x, tMin.z));
      float smallest_tMax = min(min(tMax.x, tMax.y), min(tMax.x, tMax.z));
      tNear = largest_tMin;
      tFar = smallest_tMax;
      intersect = smallest_tMax > largest_tMin;
    }`
        base.functions[name] = definition;
        return `${
          name
        }(${rayOrigin}, ${rayDirection}, ${aabbMin}, ${aabbMax}, ${tNear}, ${tFar}, ${intersect});`;
    }

    public static  Texture3D (
        // tslint:disable-next-line:typedef
        base = {
            functions: {},
            uniforms: {},
        },
        // tslint:disable-next-line:typedef
        name = 'texture3d',
        // tslint:disable-next-line:typedef
        dataCoordinates = 'dataCoordinates',
        // tslint:disable-next-line:typedef
        dataValue = 'dataValue',
        // tslint:disable-next-line:typedef
        offset = 'offset',
    ) {
        let content = `
        step( abs( textureIndexF - 0.0 ), 0.0 ) * texture2D(uTextureContainer[0], uv) +
        step( abs( textureIndexF - 1.0 ), 0.0 ) * texture2D(uTextureContainer[1], uv) +
        step( abs( textureIndexF - 2.0 ), 0.0 ) * texture2D(uTextureContainer[2], uv) +
        step( abs( textureIndexF - 3.0 ), 0.0 ) * texture2D(uTextureContainer[3], uv) +
        step( abs( textureIndexF - 4.0 ), 0.0 ) * texture2D(uTextureContainer[4], uv) +
        step( abs( textureIndexF - 5.0 ), 0.0 ) * texture2D(uTextureContainer[5], uv) +
        step( abs( textureIndexF - 6.0 ), 0.0 ) * texture2D(uTextureContainer[6], uv)`;
  
      // tslint:disable-next-line:no-any
      if ((base.uniforms as any).uTextureContainer.length === 14) {
        content += ` +
        step( abs( textureIndexF - 7.0 ), 0.0 ) * texture2D(uTextureContainer[7], uv) +
        step( abs( textureIndexF - 8.0 ), 0.0 ) * texture2D(uTextureContainer[8], uv) +
        step( abs( textureIndexF - 9.0 ), 0.0 ) * texture2D(uTextureContainer[9], uv) +
        step( abs( textureIndexF - 10.0 ), 0.0 ) * texture2D(uTextureContainer[10], uv) +
        step( abs( textureIndexF - 11.0 ), 0.0 ) * texture2D(uTextureContainer[11], uv) +
        step( abs( textureIndexF - 12.0 ), 0.0 ) * texture2D(uTextureContainer[12], uv) +
        step( abs( textureIndexF - 13.0 ), 0.0 ) * texture2D(uTextureContainer[13], uv)`;
      }
  
      const definition = `
  void ${name}(in ivec3 dataCoordinates, out vec4 dataValue, out int offset){
    float textureSizeF = float(uTextureSize);
    int voxelsPerTexture = uTextureSize*uTextureSize;
  
    int index = dataCoordinates.x
              + dataCoordinates.y * uDataDimensions.x
              + dataCoordinates.z * uDataDimensions.y * uDataDimensions.x;
    
    // dividing an integer by an integer will give you an integer result, rounded down
    // can not get float numbers to work :(
    int packedIndex = index/uPackedPerPixel;
    offset = index - uPackedPerPixel*packedIndex;
  
    // Map data index to right sampler2D texture
    int textureIndex = packedIndex/voxelsPerTexture;
    int inTextureIndex = packedIndex - voxelsPerTexture*textureIndex;
  
    // Get row and column in the texture
    int rowIndex = inTextureIndex/uTextureSize;
    float rowIndexF = float(rowIndex);
    float colIndex = float(inTextureIndex - uTextureSize * rowIndex);
  
    // Map row and column to uv
    vec2 uv = vec2(0,0);
    uv.x = (0.5 + colIndex) / textureSizeF;
    uv.y = 1. - (0.5 + rowIndexF) / textureSizeF;
  
    float textureIndexF = float(textureIndex);
    dataValue = vec4(0.) + ${content};
  }`

        base.functions[name] = definition;
        return `${name}(${dataCoordinates}, ${dataValue}, ${offset});`;
    }

}