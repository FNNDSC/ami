
const AMI_JS_FILE = 'ami.js';

export default function transformer(file, api) {
    const j = api.jscodeshift;

    const withoutExports = j(file.source)
        .find(j.ExportNamedDeclaration)
        .forEach(path => {
            j(path).remove();
        })
        .toSource();

    return j(withoutExports)
        .find(j.ImportDeclaration)
        .forEach(path => {
            j(path).replaceWith(
                j.exportAllDeclaration(null, j.literal(path.value.source.value))
            );
        })
        .toSource();
}

