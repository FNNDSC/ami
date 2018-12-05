import ShadersBase from '../shaders.base';

class Texture3d extends ShadersBase {
  constructor() {
    super();
    this.name = 'texture3d';

    // default properties names
    this._dataCoordinates = 'dataCoordinates';
    this._dataValue = 'dataValue';
    this._offset = 'offset';
  }

  api(
    baseFragment = this._base,
    dataCoordinates = this._dataCoordinates,
    dataValue = this._dataValue,
    offset = this._offset
  ) {
    this._base = baseFragment;
    return this.compute(dataCoordinates, dataValue, offset);
  }

  compute(dataCoordinates, dataValue, offset) {
    this.computeDefinition();
    this._base._functions[this._name] = this._definition;
    return `${this._name}(${dataCoordinates}, ${dataValue}, ${offset});`;
  }

  computeDefinition() {
    let content = `
      step( abs( textureIndexF - 0.0 ), 0.0 ) * texture2D(uTextureContainer[0], uv) +
      step( abs( textureIndexF - 1.0 ), 0.0 ) * texture2D(uTextureContainer[1], uv) +
      step( abs( textureIndexF - 2.0 ), 0.0 ) * texture2D(uTextureContainer[2], uv) +
      step( abs( textureIndexF - 3.0 ), 0.0 ) * texture2D(uTextureContainer[3], uv) +
      step( abs( textureIndexF - 4.0 ), 0.0 ) * texture2D(uTextureContainer[4], uv) +
      step( abs( textureIndexF - 5.0 ), 0.0 ) * texture2D(uTextureContainer[5], uv) +
      step( abs( textureIndexF - 6.0 ), 0.0 ) * texture2D(uTextureContainer[6], uv)`;

    if (this._base._uniforms.uTextureContainer.length === 14) {
      content += ` +
      step( abs( textureIndexF - 7.0 ), 0.0 ) * texture2D(uTextureContainer[7], uv) +
      step( abs( textureIndexF - 8.0 ), 0.0 ) * texture2D(uTextureContainer[8], uv) +
      step( abs( textureIndexF - 9.0 ), 0.0 ) * texture2D(uTextureContainer[9], uv) +
      step( abs( textureIndexF - 10.0 ), 0.0 ) * texture2D(uTextureContainer[10], uv) +
      step( abs( textureIndexF - 11.0 ), 0.0 ) * texture2D(uTextureContainer[11], uv) +
      step( abs( textureIndexF - 12.0 ), 0.0 ) * texture2D(uTextureContainer[12], uv) +
      step( abs( textureIndexF - 13.0 ), 0.0 ) * texture2D(uTextureContainer[13], uv)`;
    }

    this._definition = `
void ${this._name}(in ivec3 dataCoordinates, out vec4 dataValue, out int offset){
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
}
    `;
  }
}

export default new Texture3d();
