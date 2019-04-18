/**
* @author Almar Klein / http://almarklein.org
*
* Shaders to render 3D volumes using raycasting.
* The applied techniques are based on similar implementations in the Visvis and Vispy projects.
*/
precision highp float;
precision highp sampler3D;

uniform vec3 uSize;
uniform int uRenderstyle;
uniform float uIsoRenderThreshold;
uniform vec2 uClim;

uniform sampler3D uData;
uniform sampler2D uLutTexture;

varying vec3 v_position;
varying vec4 v_nearpos;
varying vec4 v_farpos;

// The maximum distance through our rendering volume is sqrt(3).
const int MAX_STEPS = 887;  // 887 for 512^3 1774 for 1024^3
const int REFINEMENT_STEPS = 4;
const float relative_step_size = 1.0;
const vec4 ambient_color = vec4(0.2, 0.4, 0.2, 1.0);
const vec4 diffuse_color = vec4(0.8, 0.2, 0.2, 1.0);
const vec4 specular_color = vec4(1.0, 1.0, 1.0, 1.0);
const float shininess = 40.0;

/* Sample float value from a 3D texture. Assumes intensity data. */
float sample1(vec3 texcoords) {
    return texture(uData, texcoords.xyz).r;
}

vec4 apply_colormap(float val) {
    val = (val - uClim[0]) / (uClim[1] - uClim[0]);
    return texture2D(uLutTexture, vec2(val, 0.5));
}

vec4 add_lighting(float val, vec3 loc, vec3 step, vec3 view_ray) {
    // Calculate color by incorporating lighting

    // View direction
    vec3 V = normalize(view_ray);

    // calculate normal vector from gradient
    vec3 N;
    float val1, val2;
    val1 = sample1(loc + vec3(-step[0], 0.0, 0.0));
    val2 = sample1(loc + vec3(+step[0], 0.0, 0.0));
    N[0] = val1 - val2;
    val = max(max(val1, val2), val);
    val1 = sample1(loc + vec3(0.0, -step[1], 0.0));
    val2 = sample1(loc + vec3(0.0, +step[1], 0.0));
    N[1] = val1 - val2;
    val = max(max(val1, val2), val);
    val1 = sample1(loc + vec3(0.0, 0.0, -step[2]));
    val2 = sample1(loc + vec3(0.0, 0.0, +step[2]));
    N[2] = val1 - val2;
    val = max(max(val1, val2), val);

    float gm = length(N); // gradient magnitude
    N = normalize(N);

    // Flip normal so it points towards viewer
    float Nselect = float(dot(N, V) > 0.0);
    N = (2.0 * Nselect - 1.0) * N;  // ==  Nselect * N - (1.0-Nselect)*N;

    // Init colors
    vec4 ambient_color = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 diffuse_color = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 specular_color = vec4(0.0, 0.0, 0.0, 0.0);

    // note: could allow multiple lights
    // for (int i=0; i<1; i++) {
        // Get light direction (make sure to prevent zero devision)
        vec3 L = normalize(view_ray);  //lightDirs[i];
        float lightEnabled = float( length(L) > 0.0 );
        L = normalize(L + (1.0 - lightEnabled));

        // Calculate lighting properties
        float lambertTerm = clamp(dot(N, L), 0.0, 1.0);
        vec3 H = normalize(L+V); // Halfway vector
        float specularTerm = pow(max(dot(H, N), 0.0), shininess);

        // Calculate mask
        float mask1 = lightEnabled;

        // Calculate colors
        ambient_color +=  mask1 * ambient_color;  // * gl_LightSource[i].ambient;
        diffuse_color +=  mask1 * lambertTerm;
        specular_color += mask1 * specularTerm * specular_color;
    // }

    // Calculate final color by componing different components
    vec4 final_color;
    vec4 color = apply_colormap(val);
    final_color = color * (ambient_color + diffuse_color) + specular_color;
    final_color.a = color.a;
    return final_color;
}

void cast_mip(
    vec3 start_loc, 
    vec3 step, 
    int nsteps, 
    vec3 view_ray
) {
    float max_val = -1e6;
    int max_i = 100;
    vec3 loc = start_loc;

    // Enter the raycasting loop. In WebGL 1 the loop index cannot be compared with
    // non-constant expression. So we use a hard-coded max and an additional condition
    // inside the loop.
    for (int iter=0; iter<MAX_STEPS; iter++) {
        if (iter >= nsteps)
            break;
        // Sample from the 3D texture
        float val = sample1(loc);
        // Apply MIP operation
        if (val > max_val) {
            max_val = val;
            max_i = iter;
        }
        // Advance location deeper into the volume
        loc += step;
    }

    // Refine location gives crispier images
    vec3 iloc = start_loc + step * (float(max_i) - 0.5);
    vec3 istep = step / float(REFINEMENT_STEPS);
    for (int i=0; i<REFINEMENT_STEPS; i++) {
        max_val = max(max_val, sample1(iloc));
        iloc += istep;
    }

    // Resolve final color
    gl_FragColor = apply_colormap(max_val);
}

void cast_iso(
    vec3 start_loc,
    vec3 step,
    int nsteps,
    vec3 view_ray
) {
    //gl_FragColor = vec4(0.0);  // init transparent
    vec4 color3 = vec4(0.0);  // final color
    vec3 dstep = 1.5 / uSize;  // step to sample derivative
    vec3 loc = start_loc;

    float low_threshold = uIsoRenderThreshold - 0.02 * (uClim[1] - uClim[0]);

    // Enter the raycasting loop. In WebGL 1 the loop index cannot be compared with
    // non-constant expression. So we use a hard-coded max and an additional condition
    // inside the loop.
    for (int iter=0; iter<MAX_STEPS; iter++) {
        if (iter >= nsteps)
            break;

        // Sample from the 3D texture
        float val = sample1(loc);

        if (val > low_threshold) {
            // Take the last interval in smaller steps
            vec3 iloc = loc - 0.5 * step;
            vec3 istep = step / float(REFINEMENT_STEPS);
            for (int i=0; i<REFINEMENT_STEPS; i++) {
                val = sample1(iloc);
                if (val > uIsoRenderThreshold) {
                    gl_FragColor = add_lighting(val, iloc, dstep, view_ray);
                    return;
                }
                iloc += istep;
            }
        }

        // Advance location deeper into the volume
        loc += step;
    }
}

void main() {
    // Normalize clipping plane info
    vec3 farpos = v_farpos.xyz / v_farpos.w;
    vec3 nearpos = v_nearpos.xyz / v_nearpos.w;

    // Calculate unit vector pointing in the view direction through this fragment.
    vec3 view_ray = normalize(nearpos.xyz - farpos.xyz);

    // Compute the (negative) distance to the front surface or near clipping plane.
    // v_position is the back face of the cuboid so the initial distance calculated in the dot
    // product below is the distance from near clip plane to the back of the cuboid
    float distance = dot(nearpos - v_position, view_ray);
    distance = max(distance, min((-0.5 - v_position.x) / view_ray.x,
                                (uSize.x - 0.5 - v_position.x) / view_ray.x));
    distance = max(distance, min((-0.5 - v_position.y) / view_ray.y,
                                (uSize.y - 0.5 - v_position.y) / view_ray.y));
    distance = max(distance, min((-0.5 - v_position.z) / view_ray.z,
                                (uSize.z - 0.5 - v_position.z) / view_ray.z));

                                // Now we have the starting position on the front surface
    vec3 front = v_position + view_ray * distance;

    // Decide how many steps to take
    int nsteps = int(-distance / relative_step_size + 0.5);
    if ( nsteps < 1 )
        discard;

    // Get starting location and step vector in texture coordinates
    vec3 step = ((v_position - front) / uSize) / float(nsteps);
    vec3 start_loc = front / uSize;

    // For testing: show the number of steps. This helps to establish
    // whether the rays are correctly oriented
    //gl_FragColor = vec4(0.0 float(nsteps) / 1.0 / uSize.x 1.0 1.0);
    //return;

    if (uRenderstyle == 0)
        cast_mip(start_loc, step, nsteps, view_ray);
    else if (uRenderstyle == 1)
        cast_iso(start_loc, step, nsteps, view_ray);

    if (gl_FragColor.a < 0.05)
        discard;
}