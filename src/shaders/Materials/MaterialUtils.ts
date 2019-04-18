import glslify from 'glslify';
export class MaterialUtils {
    static processSource(source: string): string {
        let output = source.split(/"/)[1].normalize().replace(/(\\r)/gm, "").replace(/(\\n)/gm, "\n ");
        let res = glslify(output);

        return res;
    }
}