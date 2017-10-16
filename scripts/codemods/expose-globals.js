
function toExportedType(fragment) {
    return fragment.substr(0, 1).toUpperCase() + fragment.substr(1, fragment.length - 2);
}

export default function transformer(file, api) {
    const j = api.jscodeshift;

    const pathFragments = file.path.split('/');
    const pathFragmentsNumber = pathFragments.length;

    const fileName = pathFragments[pathFragmentsNumber - 1];
    const fileNameFragments = fileName.split('.');
    const fileNameFragmentsNumber = fileNameFragments.length;

    const pathIdentifierFragment = pathFragments[pathFragmentsNumber - 2];
    const fileIdentifierFragment = fileNameFragments[fileNameFragmentsNumber - 2];

    if (fileIdentifierFragment !== pathIdentifierFragment) {
      return file.source;
    }

    return j(file.source)
        .find(j.ExportDefaultDeclaration)
        .forEach(path => {


                function propertyToExportSpecifier(property) {

                    const local = property.value.name;
                    const exportedType = toExportedType(fileIdentifierFragment);
                    const exported = `${local}${exportedType}`;

                    return j.exportSpecifier(
                        j.identifier(local),
                        j.identifier(exported)
                    );
                }

                if (!path.value.declaration.properties) {
                    return;
                }

                j(path).replaceWith(
                    j.exportNamedDeclaration(
                        null,
                        path.value.declaration.properties.map(propertyToExportSpecifier)
                    )
                );
        })
        .toSource();
}

