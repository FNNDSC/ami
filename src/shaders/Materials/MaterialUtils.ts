export class MaterialUtils {
    static processSource(source: string): string {
        //let raw: string = source.split(/"/)[1].normalize();//.replace(/(\\n)/gm, " ");

        let output = source.split(/"/)[1].normalize().replace(/(\\r)/gm, "").replace(/(\\n)/gm, "\n ");
        // for (let charId = 0; charId < raw.length; charId++) {
        //     // If the charatcer is ASCII, which is [c < 127]
        //     if (!(raw.charCodeAt(charId) > 127)) {
        //         output += raw.charAt(charId);
        //     }
        // }
        return output;
    }
}