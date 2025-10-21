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

    // Packages
    const packageElementNodeById = new Map();
    diagramState.packageList.forEach(packageElement => {
      const node = this.createPackagedElement(xmlDocument, {
        type: 'uml:Package',
        id: packageElement.id,
        name: packageElement.name || 'Module'
      });
      umlModelElement.appendChild(node);
      packageElementNodeById.set(packageElement.id, node);
    });

    // Classes
    diagramState.classList.forEach(classElement => {
      const classNode = this.createClassElement(xmlDocument, classElement);
      
      const parentNode = classElement.packageId && packageElementNodeById.has(classElement.packageId)
        ? packageElementNodeById.get(classElement.packageId)
        : umlModelElement;
      
      parentNode.appendChild(classNode);
    });

    // Relations - wszystkie typy obsługiwane tak samo
    this.createRelations(xmlDocument, diagramState.relationList, umlModelElement);

    xmiRootElement.appendChild(umlModelElement);
    xmlDocument.appendChild(xmiRootElement);
    
    const xmlSerializer = new XMLSerializer();
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlSerializer.serializeToString(xmlDocument);
  }

  createPackagedElement(xmlDocument, { type, id, name }) {
    const element = xmlDocument.createElement('packagedElement');
    element.setAttribute('xmi:type', type);
    element.setAttribute('xmi:id', id);
    element.setAttribute('name', name);
    return element;
  }

  createClassElement(xmlDocument, classElement) {
    const classNode = this.createPackagedElement(xmlDocument, {
      type: 'uml:Class',
      id: classElement.id,
      name: classElement.name || 'Class'
    });

    // Attributes
    classElement.attributes.forEach((attr, index) => {
      const [name, type] = (attr || '').split(':').map(s => s.trim());
      const attrNode = xmlDocument.createElement('ownedAttribute');
      attrNode.setAttribute('xmi:id', `${classElement.id}_attr_${index + 1}`);
      attrNode.setAttribute('xmi:type', 'uml:Property');
      attrNode.setAttribute('name', name || `attr${index + 1}`);
      if (type) attrNode.setAttribute('type', type);
      classNode.appendChild(attrNode);
    });

    // Operations
    classElement.operations.forEach((operation, index) => {
      const operationNode = this.createOperation(xmlDocument, classElement.id, operation, index);
      classNode.appendChild(operationNode);
    });

    return classNode;
  }

  createOperation(xmlDocument, classId, operationSignature, index) {
    const parsed = this.parseOperationSignature(operationSignature);
    const operationNode = xmlDocument.createElement('ownedOperation');
    operationNode.setAttribute('xmi:type', 'uml:Operation');
    operationNode.setAttribute('xmi:id', `${classId}_op_${index + 1}`);
    operationNode.setAttribute('name', parsed.name || `op${index + 1}`);

    // Parameters (input)
    parsed.params.forEach((param, paramIndex) => {
      const paramNode = xmlDocument.createElement('ownedParameter');
      paramNode.setAttribute('xmi:id', `${classId}_op_${index + 1}_param_${paramIndex + 1}`);
      paramNode.setAttribute('xmi:type', 'uml:Parameter');
      paramNode.setAttribute('direction', 'in');
      if (param.name) paramNode.setAttribute('name', param.name);
      if (param.type) paramNode.setAttribute('type', param.type);
      operationNode.appendChild(paramNode);
    });

    // Return parameter
    if (parsed.returnType) {
      const returnNode = xmlDocument.createElement('ownedParameter');
      returnNode.setAttribute('xmi:id', `${classId}_op_${index + 1}_return`);
      returnNode.setAttribute('xmi:type', 'uml:Parameter');
      returnNode.setAttribute('direction', 'return');
      returnNode.setAttribute('type', parsed.returnType);
      operationNode.appendChild(returnNode);
    }

    return operationNode;
  }

  parseOperationSignature(signature) {
    const result = { name: '', params: [], returnType: '' };
    if (!signature || typeof signature !== 'string') return result;

    const trimmed = signature.trim();
    const openParen = trimmed.indexOf('(');
    const closeParen = openParen >= 0 ? trimmed.indexOf(')', openParen + 1) : -1;

    if (openParen === -1 || closeParen === -1) {
      result.name = trimmed;
      return result;
    }

    result.name = trimmed.slice(0, openParen).trim();

    const paramsPart = trimmed.slice(openParen + 1, closeParen).trim();
    if (paramsPart) {
      paramsPart.split(',').forEach(paramStr => {
        const [name, type] = paramStr.split(':').map(s => (s || '').trim());
        if (name) result.params.push({ name, type: type || '' });
      });
    }

    const after = trimmed.slice(closeParen + 1).trim();
    if (after.startsWith(':')) {
      result.returnType = after.slice(1).trim();
    }

    return result;
  }

  createRelations(xmlDocument, relationList, parentNode) {
    const relationTypeMap = {
      association: 'uml:Association',
      aggregation: 'uml:Aggregation',
      composition: 'uml:Composition',
      dependency: 'uml:Dependency',
      realization: 'uml:Realization',
      generalization: 'uml:Generalization'
    };

    relationList.forEach(rel => {
      const xmiType = relationTypeMap[rel.type];
      if (xmiType) {
        const element = xmlDocument.createElement('packagedElement');
        element.setAttribute('xmi:type', xmiType);
        element.setAttribute('xmi:id', rel.id);
        element.setAttribute('name', rel.name || rel.type);
        element.setAttribute('client', rel.source);
        element.setAttribute('supplier', rel.target);
        
        parentNode.appendChild(element);
      }
    });
  }
}
