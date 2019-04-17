export class MaterialUtils {
    static processSource(source: string, isWebGl2: boolean): string {
        let output = source.split(/"/)[1].normalize().replace(/(\\r)/gm, "").replace(/(\\n)/gm, "\n ");
        let res;

        if (isWebGl2) {
            res = "#version 300 es \n" + output;
        }
        else {
            res = output;
        }

        return res;
    }
}