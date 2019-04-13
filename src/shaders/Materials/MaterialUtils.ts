export class MaterialUtils {
    static processSource(source: string): string {
        return source.split(/"/)[1];
    }
}