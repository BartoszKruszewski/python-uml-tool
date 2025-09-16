export default class Exporter {
  buildXMI(state, modelName) {
    const xmiNS = 'http://www.omg.org/XMI', umlNS = 'http://www.eclipse.org/uml2/5.0.0/UML';
    const doc = document.implementation.createDocument('', '', null);
    const xmi = doc.createElementNS(xmiNS, 'xmi:XMI');
    xmi.setAttribute('xmlns:xmi', xmiNS);
    xmi.setAttribute('xmlns:uml', umlNS);
    xmi.setAttribute('xmi:version', '2.1');

    const model = doc.createElementNS(umlNS, 'uml:Model');
    model.setAttribute('xmi:id', 'model1');
    model.setAttribute('name', modelName || 'Diagram');

    const pkgNodeById = new Map();
    state.packages.forEach(pkg => {
      const pe = doc.createElementNS(umlNS, 'packagedElement');
      pe.setAttribute('xmi:type', 'uml:Package');
      pe.setAttribute('xmi:id', pkg.id);
      pe.setAttribute('name', pkg.name || 'Module');
      model.appendChild(pe);
      pkgNodeById.set(pkg.id, pe);
    });

    state.classes.forEach(cls => {
      const el = doc.createElementNS(umlNS, 'packagedElement');
      el.setAttribute('xmi:type', 'uml:Class');
      el.setAttribute('xmi:id', cls.id);
      el.setAttribute('name', cls.name || 'Class');

      cls.attributes.forEach((a, i) => {
        const [nm, type] = (a || '').split(':').map(s => (s || '').trim());
        const attr = doc.createElementNS(umlNS, 'ownedAttribute');
        attr.setAttribute('xmi:id', `${cls.id}_attr_${i + 1}`);
        attr.setAttribute('name', nm || `attr${i + 1}`);
        if (type) attr.setAttribute('type', type);
        el.appendChild(attr);
      });

      cls.operations.forEach((o, i) => {
        const nm = ((o.split('(') ?? o) || '').trim() || `op${i + 1}`;
        const op = doc.createElementNS(umlNS, 'ownedOperation');
        op.setAttribute('xmi:id', `${cls.id}_op_${i + 1}`);
        op.setAttribute('name', nm);
        el.appendChild(op);
      });

      state.relations.filter(r => r.type === 'generalization' && r.source === cls.id).forEach((r, i) => {
        const gen = doc.createElementNS(umlNS, 'generalization');
        gen.setAttribute('xmi:id', `${cls.id}_gen_${i + 1}`);
        gen.setAttribute('general', r.target);
        el.appendChild(gen);
      });

      if (cls.packageId && pkgNodeById.has(cls.packageId)) pkgNodeById.get(cls.packageId).appendChild(el);
      else model.appendChild(el);
    });

    state.relations.filter(r => ['association','aggregation','composition'].includes(r.type)).forEach((r, i) => {
      const assoc = doc.createElementNS(umlNS, 'packagedElement');
      assoc.setAttribute('xmi:type', 'uml:Association');
      assoc.setAttribute('xmi:id', r.id);
      assoc.setAttribute('name', `${r.type.toUpperCase() + r.type.slice(1)}${i + 1}`);
      const endA = doc.createElementNS(umlNS, 'ownedEnd');
      endA.setAttribute('xmi:id', `${r.id}_end1`);
      endA.setAttribute('type', r.source);
      if (r.type === 'aggregation') endA.setAttribute('aggregation', 'shared');
      if (r.type === 'composition') endA.setAttribute('aggregation', 'composite');
      const endB = doc.createElementNS(umlNS, 'ownedEnd');
      endB.setAttribute('xmi:id', `${r.id}_end2`);
      endB.setAttribute('type', r.target);
      assoc.appendChild(endA); assoc.appendChild(endB);
      model.appendChild(assoc);
    });

    state.relations.filter(r => r.type === 'dependency').forEach((r, i) => {
      const dep = doc.createElementNS(umlNS, 'packagedElement');
      dep.setAttribute('xmi:type', 'uml:Dependency');
      dep.setAttribute('xmi:id', r.id);
      dep.setAttribute('name', `Dependency${i + 1}`);
      const client = doc.createElementNS(umlNS, 'client'); client.setAttribute('xmi:idref', r.source);
      const supplier = doc.createElementNS(umlNS, 'supplier'); supplier.setAttribute('xmi:idref', r.target);
      dep.appendChild(client); dep.appendChild(supplier);
      model.appendChild(dep);
    });

    state.relations.filter(r => r.type === 'realization').forEach((r, i) => {
      const rea = doc.createElementNS(umlNS, 'packagedElement');
      rea.setAttribute('xmi:type', 'uml:Realization');
      rea.setAttribute('xmi:id', r.id);
      rea.setAttribute('name', `Realization${i + 1}`);
      const client = doc.createElementNS(umlNS, 'client'); client.setAttribute('xmi:idref', r.source);
      const supplier = doc.createElementNS(umlNS, 'supplier'); supplier.setAttribute('xmi:idref', r.target);
      rea.appendChild(client); rea.appendChild(supplier);
      model.appendChild(rea);
    });

    const serializer = new XMLSerializer();
    xmi.appendChild(model); doc.appendChild(xmi);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(doc);
  }
}