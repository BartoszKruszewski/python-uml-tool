/**
 * Parses XMI XML and loads it into the diagram state.
 */
export default class XmiImporter {
  /**
   * Parse XMI XML and return data structure for loading into diagram state.
   * @param {string} xmiXml - XMI document content.
   * @returns {{packages: Array, classes: Array, relations: Array}} Parsed diagram data.
   */
  parseXMI(xmiXml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmiXml, "application/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Invalid XML format: " + parserError.textContent);
    }

    const umlNamespace = "http://schema.omg.org/spec/UML/2.1";
    const xmiNamespace = "http://schema.omg.org/spec/XMI/2.1";

    // Find the model element
    const modelElement = xmlDoc.querySelector("Model") || xmlDoc.querySelector(`*[namespaceURI="${umlNamespace}"][localName="Model"]`);
    if (!modelElement) {
      throw new Error("XMI file does not contain a UML Model element");
    }

    const packages = [];
    const classes = [];
    const relations = [];
    const packageMap = new Map(); // id -> package data
    const classMapByName = new Map(); // name -> class data

    // Layout configuration
    const CLASS_WIDTH = 200;
    const CLASS_HEIGHT = 110;
    const PACKAGE_WIDTH = 360;
    const PACKAGE_HEIGHT = 240;
    const CLASS_SPACING = 200; // spacing between classes (increased 2x)
    const PACKAGE_SPACING = 80; // spacing between packages (larger because packages are bigger)
    const CLASS_SPACING_IN_PACKAGE = 80; // spacing between classes inside package (increased 2x)
    const START_X = 100;
    const START_Y = 100;
    const CLASSES_PER_ROW = 5; // number of classes per row in grid
    const PACKAGES_PER_ROW = 3; // number of packages per row in grid (fewer because they're larger)

    // Helper to calculate grid position for classes
    const calculateClassGridPosition = (index) => {
      const row = Math.floor(index / CLASSES_PER_ROW);
      const col = index % CLASSES_PER_ROW;
      return {
        x: START_X + col * (CLASS_WIDTH + CLASS_SPACING),
        y: START_Y + row * (CLASS_HEIGHT + CLASS_SPACING)
      };
    };

    // Helper to calculate grid position for packages
    const calculatePackageGridPosition = (index) => {
      const row = Math.floor(index / PACKAGES_PER_ROW);
      const col = index % PACKAGES_PER_ROW;
      return {
        x: START_X + col * (PACKAGE_WIDTH + PACKAGE_SPACING),
        y: START_Y + row * (PACKAGE_HEIGHT + PACKAGE_SPACING)
      };
    };

    // Helper to get attribute value
    const getAttr = (element, name) => {
      return element.getAttribute(name) || 
             element.getAttributeNS(umlNamespace, name) ||
             element.getAttributeNS(xmiNamespace, name) ||
             element.getAttribute(`xmi:${name}`) ||
             "";
    };

    // Helper to get xmi:type
    const getXmiType = (element) => {
      return getAttr(element, "type") || getAttr(element, "xmi:type");
    };

    // Recursively parse packages (first pass - only packages and classes)
    const parsePackage = (packageElement, parentPackageId = null, packageIndex = null, parentPackage = null) => {
      const packageId = getAttr(packageElement, "id");
      const packageName = getAttr(packageElement, "name") || "Module";
      
      // Calculate position - if nested, position relative to parent, otherwise use grid
      let pos;
      if (parentPackage) {
        // Nested package: position inside parent with some offset
        pos = {
          x: parentPackage.x + 20,
          y: parentPackage.y + 50 + (packages.filter(p => p.parentId === parentPackageId).length * (PACKAGE_HEIGHT + 20))
        };
      } else {
        // Top-level package: use grid
        const index = packageIndex !== null ? packageIndex : packages.filter(p => !p.parentId).length;
        pos = calculatePackageGridPosition(index);
      }
      
      const packageData = {
        id: packageId,
        name: packageName,
        x: pos.x,
        y: pos.y,
        w: PACKAGE_WIDTH,
        h: PACKAGE_HEIGHT,
        parentId: parentPackageId
      };
      packages.push(packageData);
      packageMap.set(packageId, packageData);

      // Parse only DIRECT children (not all descendants)
      const children = Array.from(packageElement.children);
      let classIndexInPackage = 0;
      children.forEach(childElement => {
        // Check if it's a packagedElement
        if (childElement.tagName === "packagedElement" || childElement.localName === "packagedElement") {
          const xmiType = getXmiType(childElement);
          if (xmiType === "uml:Class" || xmiType === "Class") {
            const classData = parseClass(childElement, packageId, classes.length, packageData, classIndexInPackage);
            classes.push(classData);
            classMapByName.set(classData.name, classData);
            classIndexInPackage++;
          } else if (xmiType === "uml:Package" || xmiType === "Package") {
            parsePackage(childElement, packageId, packages.length, packageData);
          }
        }
      });

      return packageData;
    };

    // Parse a class element
    const parseClass = (classElement, packageId, classIndex = null, parentPackage = null, classIndexInPackage = 0) => {
      const classId = getAttr(classElement, "id");
      const className = getAttr(classElement, "name") || "Class";
      
      const attributes = [];
      const attributeElements = classElement.querySelectorAll("ownedAttribute");
      attributeElements.forEach(attrElement => {
        const attrName = getAttr(attrElement, "name");
        const attrType = getAttr(attrElement, "type");
        if (attrName) {
          attributes.push(attrType ? `${attrName}: ${attrType}` : attrName);
        }
      });

      const operations = [];
      const operationElements = classElement.querySelectorAll("ownedOperation");
      operationElements.forEach(opElement => {
        const opName = getAttr(opElement, "name");
        if (opName) {
          const params = [];
          const paramElements = opElement.querySelectorAll("ownedParameter");
          paramElements.forEach(paramElement => {
            const direction = getAttr(paramElement, "direction");
            if (direction === "in") {
              const paramName = getAttr(paramElement, "name");
              const paramType = getAttr(paramElement, "type");
              if (paramName) {
                params.push(paramType ? `${paramName}: ${paramType}` : paramName);
              }
            }
          });
          
          let returnType = "";
          paramElements.forEach(paramElement => {
            if (getAttr(paramElement, "direction") === "return") {
              returnType = getAttr(paramElement, "type") || "";
            }
          });

          const paramStr = params.length > 0 ? `(${params.join(", ")})` : "()";
          const returnStr = returnType ? `: ${returnType}` : "";
          operations.push(`${opName}${paramStr}${returnStr}`);
        }
      });

      // Calculate position - if in package, position inside package, otherwise use grid
      let pos;
      if (parentPackage && packageId) {
        // Class is in a package: position inside package with increased spacing
        const row = Math.floor(classIndexInPackage / 3); // 3 classes per row inside package
        const col = classIndexInPackage % 3;
        pos = {
          x: parentPackage.x + 30 + col * (CLASS_WIDTH + CLASS_SPACING_IN_PACKAGE),
          y: parentPackage.y + 50 + row * (CLASS_HEIGHT + CLASS_SPACING_IN_PACKAGE)
        };
      } else {
        // Top-level class: use grid
        const index = classIndex !== null ? classIndex : classes.filter(c => !c.packageId).length;
        pos = calculateClassGridPosition(index);
      }
      
      return {
        id: classId,
        name: className,
        x: pos.x,
        y: pos.y,
        w: CLASS_WIDTH,
        h: CLASS_HEIGHT,
        attributes,
        operations,
        packageId
      };
    };

    // Parse a relation element
    const parseRelation = (relationElement, relationType) => {
      const relationId = getAttr(relationElement, "id");
      const clientName = getAttr(relationElement, "client");
      const supplierName = getAttr(relationElement, "supplier");
      
      // Find classes by name (using map for faster lookup)
      const clientClass = classMapByName.get(clientName) || classes.find(c => c.name === clientName);
      const supplierClass = classMapByName.get(supplierName) || classes.find(c => c.name === supplierName);
      
      if (!clientClass || !supplierClass) {
        return null;
      }

      return {
        id: relationId,
        type: relationType,
        source: clientClass.id,
        target: supplierClass.id
      };
    };

    // Helper to recursively find all packagedElements (for relations parsing)
    const findAllPackagedElements = (parent) => {
      const result = [];
      const children = Array.from(parent.children);
      children.forEach(child => {
        if (child.tagName === "packagedElement" || child.localName === "packagedElement") {
          result.push(child);
          // Recursively get children
          result.push(...findAllPackagedElements(child));
        }
      });
      return result;
    };

    // First pass: Parse top-level packages and classes (only direct children)
    // Separate counters for proper grid layout
    let packageCounter = 0;
    let classCounter = 0;
    
    const topLevelChildren = Array.from(modelElement.children);
    topLevelChildren.forEach(element => {
      if (element.tagName === "packagedElement" || element.localName === "packagedElement") {
        const xmiType = getXmiType(element);
        if (xmiType === "uml:Package" || xmiType === "Package") {
          parsePackage(element, null, packageCounter, null);
          packageCounter++;
        } else if (xmiType === "uml:Class" || xmiType === "Class") {
          const classData = parseClass(element, null, classCounter, null);
          classes.push(classData);
          classMapByName.set(classData.name, classData);
          classCounter++;
        }
      }
    });

    // Second pass: Parse relations (after all classes are loaded)
    // Use a Set to track processed relation IDs to avoid duplicates
    const processedRelationIds = new Set();
    const allPackagedElements = findAllPackagedElements(modelElement);
    allPackagedElements.forEach(element => {
      const xmiType = getXmiType(element);
      const relationType = this.getRelationType(xmiType);
      if (relationType) {
        const relationId = getAttr(element, "id");
        if (!processedRelationIds.has(relationId)) {
          processedRelationIds.add(relationId);
          const relationData = parseRelation(element, relationType);
          if (relationData) {
            relations.push(relationData);
          }
        }
      }
    });

    return { packages, classes, relations };
  }

  /**
   * Map XMI relation type to internal relation type.
   * @param {string} xmiType - XMI type string (e.g., "uml:Association").
   * @returns {string|null} Internal relation type or null if not recognized.
   */
  getRelationType(xmiType) {
    const typeMap = {
      "uml:Association": "association",
      "uml:Aggregation": "aggregation",
      "uml:Composition": "composition",
      "uml:Dependency": "dependency",
      "uml:Realization": "realization",
      "uml:Generalization": "generalization",
      "Association": "association",
      "Aggregation": "aggregation",
      "Composition": "composition",
      "Dependency": "dependency",
      "Realization": "realization",
      "Generalization": "generalization"
    };
    return typeMap[xmiType] || null;
  }
}

