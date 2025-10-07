export default class Exporter {
  buildXMI(diagramState) {
    const xmiNamespace = 'http://schema.omg.org/spec/XMI/2.1';
    const umlNamespace = 'http://schema.omg.org/spec/UML/2.1';

    const xmlDocument = document.implementation.createDocument('', '', null);
    const xmiRootElement = xmlDocument.createElementNS(xmiNamespace, 'xmi:XMI');
    xmiRootElement.setAttribute('xmlns:uml', umlNamespace);
    xmiRootElement.setAttribute('xmi:version', '2.1');

    const umlModelElement = xmlDocument.createElementNS(umlNamespace, 'uml:Model');
    umlModelElement.setAttribute('xmi:id', 'model1');
    umlModelElement.setAttribute('name', 'Project');

    const packageElementNodeById = new Map();
    diagramState.packageList.forEach(packageElement => {
      const packagedElementNode = xmlDocument.createElement('packagedElement');
      packagedElementNode.setAttribute('xmi:type', 'uml:Package');
      packagedElementNode.setAttribute('xmi:id', packageElement.id);
      packagedElementNode.setAttribute('name', packageElement.name || 'Module');
      umlModelElement.appendChild(packagedElementNode);
      packageElementNodeById.set(packageElement.id, packagedElementNode);
    });

    // Helper: parse UML-like operation signature
    const parseUmlOperationSignature = (signature) => {
      const result = { name: '', params: [], returnType: '' };
      if (!signature || typeof signature !== 'string') return result;
      const trimmed = signature.trim();
      const openParenIndex = trimmed.indexOf('(');
      const closeParenIndex = openParenIndex >= 0 ? trimmed.indexOf(')', openParenIndex + 1) : -1;

      if (openParenIndex === -1 || closeParenIndex === -1) {
        result.name = trimmed;
        return result;
      }

      result.name = trimmed.slice(0, openParenIndex).trim();

      const paramsPart = trimmed.slice(openParenIndex + 1, closeParenIndex).trim();
      if (paramsPart) {
        paramsPart.split(',').forEach((paramString) => {
          const [paramName, paramType] = paramString.split(':').map(s => (s || '').trim());
          if (paramName) result.params.push({ name: paramName, type: paramType || '' });
        });
      }

      const after = trimmed.slice(closeParenIndex + 1).trim();
      if (after.startsWith(':')) {
        result.returnType = after.slice(1).trim();
      }
      return result;
    };

    diagramState.classList.forEach(classElement => {
      const classElementNode = xmlDocument.createElement('packagedElement');
      classElementNode.setAttribute('xmi:type', 'uml:Class');
      classElementNode.setAttribute('xmi:id', classElement.id);
      classElementNode.setAttribute('name', classElement.name || 'Class');

      classElement.attributes.forEach((attributeEntry, attributeIndex) => {
        const [attributeName, attributeType] = (attributeEntry || '')
          .split(':')
          .map(s => (s || '').trim());
        const ownedAttributeNode = xmlDocument.createElement('ownedAttribute');
        ownedAttributeNode.setAttribute('xmi:id', `${classElement.id}_attr_${attributeIndex + 1}`);
        ownedAttributeNode.setAttribute('xmi:type', 'uml:Property');
        ownedAttributeNode.setAttribute('name', attributeName || `attr${attributeIndex + 1}`);
        if (attributeType) ownedAttributeNode.setAttribute('type', attributeType);
        classElementNode.appendChild(ownedAttributeNode);
      });

      classElement.operations.forEach((operationEntry, operationIndex) => {
        const parsed = parseUmlOperationSignature(operationEntry);
        const operationName = parsed.name || `op${operationIndex + 1}`;

        const ownedOperationNode = xmlDocument.createElement('ownedOperation');
        ownedOperationNode.setAttribute('xmi:type', 'uml:Operation');
        ownedOperationNode.setAttribute('xmi:id', `${classElement.id}_op_${operationIndex + 1}`);
        ownedOperationNode.setAttribute('name', operationName);

        // Input parameters (direction="in")
        parsed.params.forEach((param, paramIndex) => {
          const paramNode = xmlDocument.createElement('ownedParameter');
          paramNode.setAttribute('xmi:id', `${classElement.id}_op_${operationIndex + 1}_param_${paramIndex + 1}`);
          paramNode.setAttribute('xmi:type', 'uml:Parameter');
          if (param.name) paramNode.setAttribute('name', param.name);
          if (param.type) paramNode.setAttribute('type', param.type);
          paramNode.setAttribute('direction', 'in');
          ownedOperationNode.appendChild(paramNode);
        });

        // Return parameter (direction="return")
        if (parsed.returnType) {
          const returnNode = xmlDocument.createElement('ownedParameter');
          returnNode.setAttribute('xmi:id', `${classElement.id}_op_${operationIndex + 1}_return`);
          returnNode.setAttribute('xmi:type', 'uml:Parameter');
          returnNode.setAttribute('direction', 'return');
          returnNode.setAttribute('type', parsed.returnType);
          ownedOperationNode.appendChild(returnNode);
        }

        classElementNode.appendChild(ownedOperationNode);
      });

      diagramState.relationList
        .filter(relation => relation.type === 'generalization' && relation.source === classElement.id)
        .forEach((relation, generalizationIndex) => {
          const generalizationNode = xmlDocument.createElement('generalization');
          generalizationNode.setAttribute('xmi:id', `${classElement.id}_gen_${generalizationIndex + 1}`);
          generalizationNode.setAttribute('general', relation.target);
          classElementNode.appendChild(generalizationNode);
        });

      if (classElement.packageId && packageElementNodeById.has(classElement.packageId)) {
        packageElementNodeById.get(classElement.packageId).appendChild(classElementNode);
      } else {
        umlModelElement.appendChild(classElementNode);
      }
    });

    diagramState.relationList
      .filter(relation => ['association', 'aggregation', 'composition'].includes(relation.type))
      .forEach((relation, associationIndex) => {
        const associationElementNode = xmlDocument.createElement('packagedElement');
        associationElementNode.setAttribute('xmi:type', 'uml:Association');
        associationElementNode.setAttribute('xmi:id', relation.id);
        associationElementNode.setAttribute(
          'name',
          `${relation.type.toUpperCase() + relation.type.slice(1)}${associationIndex + 1}`,
        );

        const ownedEndSourceNode = xmlDocument.createElement('ownedEnd');
        ownedEndSourceNode.setAttribute('xmi:id', `${relation.id}_end1`);
        ownedEndSourceNode.setAttribute('type', relation.source);
        if (relation.type === 'aggregation') ownedEndSourceNode.setAttribute('aggregation', 'shared');
        if (relation.type === 'composition')
          ownedEndSourceNode.setAttribute('aggregation', 'composite');

        const ownedEndTargetNode = xmlDocument.createElement('ownedEnd');
        ownedEndTargetNode.setAttribute('xmi:id', `${relation.id}_end2`);
        ownedEndTargetNode.setAttribute('type', relation.target);

        associationElementNode.appendChild(ownedEndSourceNode);
        associationElementNode.appendChild(ownedEndTargetNode);
        umlModelElement.appendChild(associationElementNode);
      });

    diagramState.relationList
      .filter(relation => relation.type === 'dependency')
      .forEach((relation, dependencyIndex) => {
        const dependencyElementNode = xmlDocument.createElement('packagedElement');
        dependencyElementNode.setAttribute('xmi:type', 'uml:Dependency');
        dependencyElementNode.setAttribute('xmi:id', relation.id);
        dependencyElementNode.setAttribute('name', `Dependency${dependencyIndex + 1}`);

        const clientNode = xmlDocument.createElement('client');
        clientNode.setAttribute('xmi:idref', relation.source);
        const supplierNode = xmlDocument.createElement('supplier');
        supplierNode.setAttribute('xmi:idref', relation.target);

        dependencyElementNode.appendChild(clientNode);
        dependencyElementNode.appendChild(supplierNode);
        umlModelElement.appendChild(dependencyElementNode);
      });

    diagramState.relationList
      .filter(relation => relation.type === 'realization')
      .forEach((relation, realizationIndex) => {
        const realizationElementNode = xmlDocument.createElement('packagedElement');
        realizationElementNode.setAttribute('xmi:type', 'uml:Realization');
        realizationElementNode.setAttribute('xmi:id', relation.id);
        realizationElementNode.setAttribute('name', `Realization${realizationIndex + 1}`);

        const clientNode = xmlDocument.createElement('client');
        clientNode.setAttribute('xmi:idref', relation.source);
        const supplierNode = xmlDocument.createElement('supplier');
        supplierNode.setAttribute('xmi:idref', relation.target);

        realizationElementNode.appendChild(clientNode);
        realizationElementNode.appendChild(supplierNode);
        umlModelElement.appendChild(realizationElementNode);
      });

    const xmlSerializer = new XMLSerializer();
    xmiRootElement.appendChild(umlModelElement);
    xmlDocument.appendChild(xmiRootElement);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlSerializer.serializeToString(xmlDocument);
  }
}
