#pragma glslify: interpolationIdentity = require(../../utility/interpolationIdentity.glsl)

// THREEJS Provided uniforms
// uniform mat4 viewMatrix;
// uniform vec3 cameraPosition;

uniform int uTextureSize;
uniform sampler2D uTextureContainer[7];      // Length 7
uniform ivec3 uDataDimensions;
uniform mat4 uWorldToData;
uniform float uWindowCenterWidth[2];         // Length 2
uniform float uLowerUpperThreshold[2];       // Length 2
uniform float uRescaleSlopeIntercept[2];     // Length 2
uniform int uNumberOfChannels;
uniform int uBitsAllocated;
uniform int uInvert;
uniform int uLut;
uniform sampler2D uTextureLUT;
uniform int uLutSegmentation;
uniform sampler2D uTextureLUTSegmentation;
uniform int uPixelType;
uniform float uCanvasWidth;
uniform float uCanvasHeight;
uniform vec3 uBorderColor;
uniform float uBorderWidth;
uniform float uBorderMargin;
uniform float uBorderDashLength;
uniform float uOpacity;
uniform float uSpacing;
uniform float uThickness;
uniform int uThicknessMethod;
uniform int uPackedPerPixel;

varying vec3 vPos;
varying vec3 vNormal;

void main(void) {
    // DOES NEED REMOVAL
    // Dynamically branching condition - will cause wavefront divergance
    // ------------------------------------------------------------------
    if ( 
        uCanvasWidth > 0. &&
        ((gl_FragCoord.x > uBorderMargin &&  (gl_FragCoord.x - uBorderMargin) < uBorderWidth) 
        || 
        (gl_FragCoord.x < (uCanvasWidth - uBorderMargin) && (gl_FragCoord.x + uBorderMargin) > (uCanvasWidth - uBorderWidth))) 
    ) {
        float valueY = mod(gl_FragCoord.y, 2. * uBorderDashLength);
        // DOES NEED REMOVAL
        // Dynamically branching condition - will cause wavefront divergance
        // ------------------------------------------------------------------
        if (valueY < uBorderDashLength && gl_FragCoord.y > uBorderMargin && gl_FragCoord.y < (uCanvasHeight - uBorderMargin)) 
        {
            gl_FragColor = vec4(uBorderColor, 1.);
            return;
        }
    }

    // DOES NEED REMOVAL
    // Dynamically branching condition - will cause wavefront divergance
    // ------------------------------------------------------------------
    if (
        uCanvasHeight > 0. && 
        ((gl_FragCoord.y > uBorderMargin && (gl_FragCoord.y - uBorderMargin) < uBorderWidth)
        || 
        (gl_FragCoord.y < (uCanvasHeight - uBorderMargin) && (gl_FragCoord.y + uBorderMargin) > (uCanvasHeight - uBorderWidth))) 
    ) {
        float valueX = mod(gl_FragCoord.x, 2. * uBorderDashLength);
        // DOES NEED REMOVAL
        // Dynamically branching condition - will cause wavefront divergance
        // ------------------------------------------------------------------
        if(valueX < uBorderDashLength && gl_FragCoord.x > uBorderMargin && gl_FragCoord.x < (uCanvasWidth - uBorderMargin)) 
        {
            gl_FragColor = vec4(uBorderColor, 1.);
            return;
        }
    }

    // get texture coordinates of current pixel
    vec4 dataValue = vec4(0.);
    // gradient calculations will be skipped if it is equal to vec3(1.) 
    vec3 gradient = vec3(1.); 
    int steps = int(floor(uThickness / uSpacing + 0.5));

    // DOES NOT NEED REMOVAL
    // Statically uniform branching condition - cannot cause wavefront divergance
    // ---------------------------------------------------------------------------
    if (steps > 1) {
        vec3 origin = vPos - uThickness * 0.5 * vNormal;
        vec4 dataValueAcc = vec4(0.);

        for (int i = 0; i < steps; i++) {
            vec4 dataCoordinates = uWorldToData * vec4(origin + float(i) * uSpacing * vNormal, 1.);
            vec3 currentVoxel = dataCoordinates.xyz;

            interpolationIdentity(
                uPixelType,
                currentVoxel,
                uTextureSize,
                uDataDimensions,
                uTextureContainer,
                uBitsAllocated,
                uNumberOfChannels,
                0,
                uPackedPerPixel,
                dataValue,
                gradient
            );

            // DOES NOT NEED REMOVAL
            // Statically uniform branching condition - cannot cause wavefront divergance
            // ---------------------------------------------------------------------------
            if (i == 0) {
                dataValue.r = dataValueAcc.r;
                continue;
            }
            // DOES NOT NEED REMOVAL
            // Statically uniform branching condition - cannot cause wavefront divergance
            // ---------------------------------------------------------------------------
            if (uThicknessMethod == 0) {
                dataValue.r = max(dataValueAcc.r, dataValue.r);
            }
            // DOES NOT NEED REMOVAL
            // Statically uniform branching condition - cannot cause wavefront divergance
            // ---------------------------------------------------------------------------
            if (uThicknessMethod == 1) {
                dataValue.r += dataValueAcc.r;
            }
            // DOES NOT NEED REMOVAL
            // Statically uniform branching condition - cannot cause wavefront divergance
            // ---------------------------------------------------------------------------
            if (uThicknessMethod == 2) {
                dataValue.r = min(dataValueAcc.r, dataValue.r);
            }
        }

        if (uThicknessMethod == 1) {
            dataValue.r = dataValue.r / float(steps);
        }
    } 
    else {
        vec4 dataCoordinates = uWorldToData * vec4(vPos, 1.);
        vec3 currentVoxel = dataCoordinates.xyz;
        
        interpolationIdentity(
            uPixelType,
            currentVoxel,
            uTextureSize,
            uDataDimensions,
            uTextureContainer,
            uBitsAllocated,
            uNumberOfChannels,
            0,
            uPackedPerPixel,
            dataValue,
            gradient
        );
    }

    // DOES NOT NEED REMOVAL
    // Statically uniform branching condition - cannot cause wavefront divergance
    // ---------------------------------------------------------------------------
    if (uNumberOfChannels == 1) {
        // rescale/slope
        float realIntensity = dataValue.r * uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
        
        // DOES NOT NEED REMOVAL
        // Statically uniform branching condition - cannot cause wavefront divergance
        // ---------------------------------------------------------------------------
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

        // DOES NOT NEED REMOVAL
        // Statically uniform branching condition - cannot cause wavefront divergance
        // ---------------------------------------------------------------------------
        // apply LUT
        if(uLut == 1){
            // should opacity be grabbed there?
            dataValue = texture2D( uTextureLUT, vec2( normalizedIntensity , 1.0) );
        }
    
        // DOES NOT NEED REMOVAL
        // Statically uniform branching condition - cannot cause wavefront divergance
        // ---------------------------------------------------------------------------
        // apply segmentation
        if(uLutSegmentation == 1){
            // should opacity be grabbed there?
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

    // DOES NOT NEED REMOVAL
    // Statically uniform branching condition - cannot cause wavefront divergance
    // ---------------------------------------------------------------------------
    if(uInvert == 1){
        dataValue.xyz = vec3(1.) - dataValue.xyz;
    }

    dataValue.a = dataValue.a*uOpacity;
    gl_FragColor = dataValue;
}