export default class Exporter {
  buildXMI(state) {
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
    state.packages.forEach(umlPackage => {
      const packagedElementNode = xmlDocument.createElement('packagedElement');
      packagedElementNode.setAttribute('xmi:type', 'uml:Package');
      packagedElementNode.setAttribute('xmi:id', umlPackage.id);
      packagedElementNode.setAttribute('name', umlPackage.name || 'Module');
      umlModelElement.appendChild(packagedElementNode);
      packageElementNodeById.set(umlPackage.id, packagedElementNode);
    });

    // Helper: parse UML-like operation signature
    const parseUmlOperationSignature = (signature) => {
      const result = { name: '', params: [], returnType: '' };
      if (!signature || typeof signature !== 'string') return result;
      const trimmed = signature.trim();
      const open = trimmed.indexOf('(');
      const close = open >= 0 ? trimmed.indexOf(')', open + 1) : -1;

      if (open === -1 || close === -1) {
        result.name = trimmed;
        return result;
      }

      result.name = trimmed.slice(0, open).trim();

      const paramsPart = trimmed.slice(open + 1, close).trim();
      if (paramsPart) {
        paramsPart.split(',').forEach((p) => {
          const [pn, pt] = p.split(':').map(s => (s || '').trim());
          if (pn) result.params.push({ name: pn, type: pt || '' });
        });
      }

      const after = trimmed.slice(close + 1).trim();
      if (after.startsWith(':')) {
        result.returnType = after.slice(1).trim();
      }
      return result;
    };

    state.classes.forEach(umlClass => {
      const classElementNode = xmlDocument.createElement('packagedElement');
      classElementNode.setAttribute('xmi:type', 'uml:Class');
      classElementNode.setAttribute('xmi:id', umlClass.id);
      classElementNode.setAttribute('name', umlClass.name || 'Class');

      umlClass.attributes.forEach((attributeEntry, index) => {
        const [attributeName, attributeType] = (attributeEntry || '')
          .split(':')
          .map(s => (s || '').trim());
        const ownedAttributeNode = xmlDocument.createElement('ownedAttribute');
        ownedAttributeNode.setAttribute('xmi:id', `${umlClass.id}_attr_${index + 1}`);
        ownedAttributeNode.setAttribute('xmi:type', 'uml:Property');
        ownedAttributeNode.setAttribute('name', attributeName || `attr${index + 1}`);
        if (attributeType) ownedAttributeNode.setAttribute('type', attributeType);
        classElementNode.appendChild(ownedAttributeNode);
      });

      umlClass.operations.forEach((operationEntry, index) => {
        const parsed = parseUmlOperationSignature(operationEntry);
        const operationName = parsed.name || `op${index + 1}`;

        const ownedOperationNode = xmlDocument.createElement('ownedOperation');
        ownedOperationNode.setAttribute('xmi:type', 'uml:Operation');
        ownedOperationNode.setAttribute('xmi:id', `${umlClass.id}_op_${index + 1}`);
        ownedOperationNode.setAttribute('name', operationName);

        // Input parameters (direction="in")
        parsed.params.forEach((param, pIndex) => {
          const paramNode = xmlDocument.createElement('ownedParameter');
          paramNode.setAttribute('xmi:id', `${umlClass.id}_op_${index + 1}_param_${pIndex + 1}`);
          paramNode.setAttribute('xmi:type', 'uml:Parameter');
          if (param.name) paramNode.setAttribute('name', param.name);
          if (param.type) paramNode.setAttribute('type', param.type);
          paramNode.setAttribute('direction', 'in');
          ownedOperationNode.appendChild(paramNode);
        });

        // Return parameter (direction="return")
        if (parsed.returnType) {
          const returnNode = xmlDocument.createElement('ownedParameter');
          returnNode.setAttribute('xmi:id', `${umlClass.id}_op_${index + 1}_return`);
          returnNode.setAttribute('xmi:type', 'uml:Parameter');
          returnNode.setAttribute('direction', 'return');
          returnNode.setAttribute('type', parsed.returnType);
          ownedOperationNode.appendChild(returnNode);
        }

        classElementNode.appendChild(ownedOperationNode);
      });

      state.relations
        .filter(relation => relation.type === 'generalization' && relation.source === umlClass.id)
        .forEach((relation, index) => {
          const generalizationNode = xmlDocument.createElement('generalization');
          generalizationNode.setAttribute('xmi:id', `${umlClass.id}_gen_${index + 1}`);
          generalizationNode.setAttribute('general', relation.target);
          classElementNode.appendChild(generalizationNode);
        });

      if (umlClass.packageId && packageElementNodeById.has(umlClass.packageId)) {
        packageElementNodeById.get(umlClass.packageId).appendChild(classElementNode);
      } else {
        umlModelElement.appendChild(classElementNode);
      }
    });

    state.relations
      .filter(relation => ['association', 'aggregation', 'composition'].includes(relation.type))
      .forEach((relation, index) => {
        const associationElementNode = xmlDocument.createElement('packagedElement');
        associationElementNode.setAttribute('xmi:type', 'uml:Association');
        associationElementNode.setAttribute('xmi:id', relation.id);
        associationElementNode.setAttribute(
          'name',
          `${relation.type.toUpperCase() + relation.type.slice(1)}${index + 1}`,
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

    state.relations
      .filter(relation => relation.type === 'dependency')
      .forEach((relation, index) => {
        const dependencyElementNode = xmlDocument.createElement('packagedElement');
        dependencyElementNode.setAttribute('xmi:type', 'uml:Dependency');
        dependencyElementNode.setAttribute('xmi:id', relation.id);
        dependencyElementNode.setAttribute('name', `Dependency${index + 1}`);

        const clientNode = xmlDocument.createElement('client');
        clientNode.setAttribute('xmi:idref', relation.source);
        const supplierNode = xmlDocument.createElement('supplier');
        supplierNode.setAttribute('xmi:idref', relation.target);

        dependencyElementNode.appendChild(clientNode);
        dependencyElementNode.appendChild(supplierNode);
        umlModelElement.appendChild(dependencyElementNode);
      });

    state.relations
      .filter(relation => relation.type === 'realization')
      .forEach((relation, index) => {
        const realizationElementNode = xmlDocument.createElement('packagedElement');
        realizationElementNode.setAttribute('xmi:type', 'uml:Realization');
        realizationElementNode.setAttribute('xmi:id', relation.id);
        realizationElementNode.setAttribute('name', `Realization${index + 1}`);

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
