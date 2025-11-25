/**
 * Side-panel editors for classes and packages.
 * Available types for attributes and parameters.
 */
const AVAILABLE_TYPES = ["String", "Integer", "Boolean"];

/**
 * @typedef {Object} EditorsReferences
 * @property {HTMLElement} noSelectionPanel
 * @property {HTMLElement} classEditorPanel
 * @property {HTMLElement} packageEditorPanel
 * @property {HTMLInputElement|HTMLTextAreaElement} inputClassName
 * @property {HTMLElement} attrsContainer
 * @property {HTMLElement} opsContainer
 * @property {HTMLButtonElement} buttonAddAttr
 * @property {HTMLButtonElement} buttonAddOp
 * @property {HTMLSelectElement} inputClassPackage
 * @property {HTMLButtonElement} buttonDeleteClass
 * @property {HTMLInputElement|HTMLTextAreaElement} inputPackageName
 * @property {HTMLButtonElement} buttonDeletePackage
 */
export default class EditorsUI {
  /**
   * @param {import("./DiagramState.js").default} diagramState - Shared diagram state.
   * @param {EditorsReferences} references - DOM references for editor widgets.
   * @param {() => void} onChangeCallback - Called after state changes.
   */
  constructor(diagramState, references, onChangeCallback) {
    this.diagramState = diagramState;
    this.references = references;
    this.onChangeCallback = onChangeCallback;
    this.saveTimeout = null;
    this.SAVE_DELAY = 300;
    this.currentClassId = null;

    // Bind delete buttons
    references.buttonDeleteClass.addEventListener("click", () => {
      const selected = this.diagramState.selectedElement;
      if (selected?.type === "class") {
        this.diagramState.removeClass(selected.id);
        this.diagramState.clearSelection();
        this.currentClassId = null;
        this.onChangeCallback();
      }
    });

    references.buttonDeletePackage.addEventListener("click", () => {
      const selected = this.diagramState.selectedElement;
      if (selected?.type === "package") {
        this.diagramState.removePackage(selected.id);
        this.diagramState.clearSelection();
        this.refreshPackageSelect();
        this.onChangeCallback();
      }
    });

    // Bind add buttons
    references.buttonAddAttr.addEventListener("click", () => {
      this.addAttributeRow(references.attrsContainer, "", "String");
      const rows = references.attrsContainer.querySelectorAll(".attr-row");
      if (rows.length > 0) {
        rows[rows.length - 1].querySelector(".attr-name")?.focus();
      }
      this.scheduleAutoSave();
    });

    references.buttonAddOp.addEventListener("click", () => {
      this.addOperationCard(references.opsContainer, "", [], "");
      const cards = references.opsContainer.querySelectorAll(".op-card");
      if (cards.length > 0) {
        cards[cards.length - 1].querySelector(".op-name")?.focus();
      }
      this.scheduleAutoSave();
    });

    // Auto-save for class name
    references.inputClassName.addEventListener("input", () => this.scheduleAutoSave());

    // Auto-save for package select
    references.inputClassPackage.addEventListener("change", () => this.scheduleAutoSave());

    // Auto-save for package name
    references.inputPackageName.addEventListener("input", () => this.schedulePackageAutoSave());
  }

  /**
   * Create a type select element.
   * @param {string} selectedType
   * @param {string} className
   * @returns {HTMLSelectElement}
   */
  createTypeSelect(selectedType, className) {
    const select = document.createElement("select");
    select.className = `form-select form-select-sm text-light bg-card border rounded-3 ${className}`;
    
    // Add empty option
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "-";
    select.appendChild(emptyOption);
    
    AVAILABLE_TYPES.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });
    
    select.value = selectedType || "";
    select.addEventListener("change", () => this.scheduleAutoSave());
    
    return select;
  }

  /**
   * Schedule auto-save with debouncing for class editor.
   */
  scheduleAutoSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.applyClassEditorWithoutRepopulate();
    }, this.SAVE_DELAY);
  }

  /**
   * Schedule auto-save with debouncing for package editor.
   */
  schedulePackageAutoSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.applyPackageEditor();
    }, this.SAVE_DELAY);
  }

  /**
   * Create an attribute row with name input and type select.
   * @param {HTMLElement} container
   * @param {string} name
   * @param {string} type
   */
  addAttributeRow(container, name, type) {
    const row = document.createElement("div");
    row.className = "attr-row d-flex gap-2 align-items-center mb-2";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = name;
    nameInput.className = "form-control form-control-sm text-light bg-card border rounded-3 attr-name";
    nameInput.placeholder = "name";
    nameInput.addEventListener("input", () => this.scheduleAutoSave());

    const typeSelect = this.createTypeSelect(type, "attr-type");

    // Handle Enter key to add new row
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.addAttributeRow(container, "", "String");
        const rows = container.querySelectorAll(".attr-row");
        if (rows.length > 0) {
          rows[rows.length - 1].querySelector(".attr-name")?.focus();
        }
        this.scheduleAutoSave();
      }
      // Handle Backspace on empty to remove row
      if (e.key === "Backspace" && nameInput.value === "") {
        const rows = container.querySelectorAll(".attr-row");
        if (rows.length > 1) {
          e.preventDefault();
          const currentIndex = Array.from(rows).indexOf(row);
          row.remove();
          this.scheduleAutoSave();
          const remainingRows = container.querySelectorAll(".attr-row");
          if (remainingRows.length > 0) {
            const focusIndex = Math.max(0, currentIndex - 1);
            remainingRows[focusIndex]?.querySelector(".attr-name")?.focus();
          }
        }
      }
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-sm btn-outline-danger remove-field-btn";
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.title = "Remove";
    removeBtn.addEventListener("click", () => {
      row.remove();
      this.scheduleAutoSave();
    });

    row.appendChild(nameInput);
    row.appendChild(typeSelect);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }

  /**
   * Create a parameter row within an operation card.
   * @param {HTMLElement} paramsContainer
   * @param {string} name
   * @param {string} type
   */
  addParameterRow(paramsContainer, name, type) {
    const row = document.createElement("div");
    row.className = "param-row d-flex gap-2 align-items-center mb-1";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = name;
    nameInput.className = "form-control form-control-sm text-light bg-card border rounded-3 param-name";
    nameInput.placeholder = "param";
    nameInput.addEventListener("input", () => this.scheduleAutoSave());

    const typeSelect = this.createTypeSelect(type, "param-type");

    // Handle Enter key to add new param
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.addParameterRow(paramsContainer, "", "String");
        const rows = paramsContainer.querySelectorAll(".param-row");
        if (rows.length > 0) {
          rows[rows.length - 1].querySelector(".param-name")?.focus();
        }
        this.scheduleAutoSave();
      }
      // Handle Backspace on empty to remove row
      if (e.key === "Backspace" && nameInput.value === "") {
        const rows = paramsContainer.querySelectorAll(".param-row");
        if (rows.length > 1) {
          e.preventDefault();
          const currentIndex = Array.from(rows).indexOf(row);
          row.remove();
          this.scheduleAutoSave();
          const remainingRows = paramsContainer.querySelectorAll(".param-row");
          if (remainingRows.length > 0) {
            const focusIndex = Math.max(0, currentIndex - 1);
            remainingRows[focusIndex]?.querySelector(".param-name")?.focus();
          }
        }
      }
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-sm btn-outline-secondary remove-param-btn";
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.title = "Remove parameter";
    removeBtn.addEventListener("click", () => {
      row.remove();
      this.scheduleAutoSave();
    });

    row.appendChild(nameInput);
    row.appendChild(typeSelect);
    row.appendChild(removeBtn);
    paramsContainer.appendChild(row);
  }

  /**
   * Create an operation card with name, return type, and parameters list.
   * @param {HTMLElement} container
   * @param {string} name
   * @param {{name: string, type: string}[]} params
   * @param {string} returnType
   */
  addOperationCard(container, name, params, returnType) {
    const card = document.createElement("div");
    card.className = "op-card";

    // Header row: name + return type + remove button
    const headerRow = document.createElement("div");
    headerRow.className = "op-header-row d-flex gap-2 align-items-center mb-2";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = name;
    nameInput.className = "form-control form-control-sm text-light bg-card border rounded-3 op-name";
    nameInput.placeholder = "methodName";
    nameInput.addEventListener("input", () => this.scheduleAutoSave());

    const returnLabel = document.createElement("span");
    returnLabel.className = "text-muted small";
    returnLabel.textContent = "→";

    const returnSelect = this.createTypeSelect(returnType, "op-return");

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-sm btn-outline-danger remove-field-btn";
    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
    removeBtn.title = "Remove operation";
    removeBtn.addEventListener("click", () => {
      card.remove();
      this.scheduleAutoSave();
    });

    headerRow.appendChild(nameInput);
    headerRow.appendChild(returnLabel);
    headerRow.appendChild(returnSelect);
    headerRow.appendChild(removeBtn);

    // Parameters section
    const paramsSection = document.createElement("div");
    paramsSection.className = "params-section";

    const paramsHeader = document.createElement("div");
    paramsHeader.className = "d-flex justify-content-between align-items-center mb-1";
    
    const paramsLabel = document.createElement("span");
    paramsLabel.className = "text-muted small";
    paramsLabel.textContent = "Parameters";

    const addParamBtn = document.createElement("button");
    addParamBtn.type = "button";
    addParamBtn.className = "btn btn-sm btn-outline-secondary add-param-btn";
    addParamBtn.innerHTML = '<i class="fas fa-plus"></i>';
    addParamBtn.title = "Add parameter";

    paramsHeader.appendChild(paramsLabel);
    paramsHeader.appendChild(addParamBtn);

    const paramsContainer = document.createElement("div");
    paramsContainer.className = "params-container";

    // Add parameter button handler
    addParamBtn.addEventListener("click", () => {
      this.addParameterRow(paramsContainer, "", "String");
      const rows = paramsContainer.querySelectorAll(".param-row");
      if (rows.length > 0) {
        rows[rows.length - 1].querySelector(".param-name")?.focus();
      }
      this.scheduleAutoSave();
    });

    paramsSection.appendChild(paramsHeader);
    paramsSection.appendChild(paramsContainer);

    card.appendChild(headerRow);
    card.appendChild(paramsSection);
    container.appendChild(card);

    // Populate parameters
    if (params.length === 0) {
      // Add one empty parameter row
      this.addParameterRow(paramsContainer, "", "");
    } else {
      params.forEach((param) => {
        this.addParameterRow(paramsContainer, param.name, param.type);
      });
    }

    // Handle Enter on name to focus first param
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const firstParamInput = paramsContainer.querySelector(".param-name");
        if (firstParamInput) {
          firstParamInput.focus();
        }
      }
    });
  }

  /**
   * Get all attribute values from the container.
   * @param {HTMLElement} container
   * @returns {string[]}
   */
  getAttributeValues(container) {
    const rows = container.querySelectorAll(".attr-row");
    const values = [];
    rows.forEach((row) => {
      const name = row.querySelector(".attr-name")?.value.trim() || "";
      const type = row.querySelector(".attr-type")?.value || "";
      if (name) {
        values.push(type ? `${name}: ${type}` : name);
      }
    });
    return values;
  }

  /**
   * Get all operation values from the container.
   * @param {HTMLElement} container
   * @returns {string[]}
   */
  getOperationValues(container) {
    const cards = container.querySelectorAll(".op-card");
    const values = [];
    cards.forEach((card) => {
      const name = card.querySelector(".op-name")?.value.trim() || "";
      const returnType = card.querySelector(".op-return")?.value || "";
      
      // Get parameters
      const paramRows = card.querySelectorAll(".param-row");
      const params = [];
      paramRows.forEach((row) => {
        const paramName = row.querySelector(".param-name")?.value.trim() || "";
        const paramType = row.querySelector(".param-type")?.value || "";
        if (paramName) {
          params.push(paramType ? `${paramName}: ${paramType}` : paramName);
        }
      });

      if (name) {
        let op = `${name}(${params.join(", ")})`;
        if (returnType) {
          op += `: ${returnType}`;
        }
        values.push(op);
      }
    });
    return values;
  }

  /**
   * Parse an attribute string into name and type.
   * @param {string} attr
   * @returns {{name: string, type: string}}
   */
  parseAttribute(attr) {
    const colonIndex = attr.indexOf(":");
    if (colonIndex === -1) {
      return { name: attr.trim(), type: "" };
    }
    return {
      name: attr.substring(0, colonIndex).trim(),
      type: attr.substring(colonIndex + 1).trim()
    };
  }

  /**
   * Parse an operation string into name, params array, and return type.
   * @param {string} op
   * @returns {{name: string, params: {name: string, type: string}[], returnType: string}}
   */
  parseOperation(op) {
    const parenOpen = op.indexOf("(");
    const parenClose = op.indexOf(")");
    
    if (parenOpen === -1) {
      const colonIndex = op.indexOf(":");
      if (colonIndex === -1) {
        return { name: op.trim(), params: [], returnType: "" };
      }
      return {
        name: op.substring(0, colonIndex).trim(),
        params: [],
        returnType: op.substring(colonIndex + 1).trim()
      };
    }

    const name = op.substring(0, parenOpen).trim();
    const paramsStr = parenClose > parenOpen ? op.substring(parenOpen + 1, parenClose).trim() : "";
    
    // Parse parameters
    const params = [];
    if (paramsStr) {
      const paramParts = paramsStr.split(",");
      paramParts.forEach((part) => {
        const trimmed = part.trim();
        if (trimmed) {
          const colonIdx = trimmed.indexOf(":");
          if (colonIdx === -1) {
            params.push({ name: trimmed, type: "" });
          } else {
            params.push({
              name: trimmed.substring(0, colonIdx).trim(),
              type: trimmed.substring(colonIdx + 1).trim()
            });
          }
        }
      });
    }

    // Check for return type after closing paren
    const afterParen = op.substring(parenClose + 1).trim();
    let returnType = "";
    if (afterParen.startsWith(":")) {
      returnType = afterParen.substring(1).trim();
    } else if (afterParen.startsWith("->")) {
      returnType = afterParen.substring(2).trim();
    }

    return { name, params, returnType };
  }

  /**
   * Populate attributes container.
   * @param {HTMLElement} container
   * @param {string[]} attributes
   */
  populateAttributes(container, attributes) {
    container.innerHTML = "";
    if (attributes.length === 0) {
      this.addAttributeRow(container, "", "");
    } else {
      attributes.forEach((attr) => {
        const { name, type } = this.parseAttribute(attr);
        this.addAttributeRow(container, name, type);
      });
    }
  }

  /**
   * Populate operations container.
   * @param {HTMLElement} container
   * @param {string[]} operations
   */
  populateOperations(container, operations) {
    container.innerHTML = "";
    if (operations.length === 0) {
      this.addOperationCard(container, "", [], "");
    } else {
      operations.forEach((op) => {
        const { name, params, returnType } = this.parseOperation(op);
        this.addOperationCard(container, name, params, returnType);
      });
    }
  }

  /**
   * Rebuild the package select options.
   */
  refreshPackageSelect() {
    const { inputClassPackage } = this.references;
    const previousValue = inputClassPackage.value;
    inputClassPackage.innerHTML = "";
    const optionNone = document.createElement("option");
    optionNone.value = "";
    optionNone.textContent = "(none)";
    inputClassPackage.appendChild(optionNone);
    this.diagramState.packageList.forEach((packageElement) => {
      const option = document.createElement("option");
      option.value = packageElement.id;
      option.textContent = packageElement.name;
      inputClassPackage.appendChild(option);
    });
    if (previousValue) inputClassPackage.value = previousValue;
  }

  /**
   * Apply form inputs to the selected class WITHOUT repopulating fields.
   */
  applyClassEditorWithoutRepopulate() {
    const selected = this.diagramState.selectedElement;
    if (!selected || selected.type !== "class") return;
    const classElement = this.diagramState.getClassById(selected.id);
    const { inputClassName, attrsContainer, opsContainer, inputClassPackage } = this.references;
    
    classElement.name = inputClassName.value.trim() || "Class";
    classElement.attributes = this.getAttributeValues(attrsContainer);
    classElement.operations = this.getOperationValues(opsContainer);
    classElement.packageId = inputClassPackage.value || null;
    
    const baseHeight = 28,
      lineHeight = 18,
      separator = 12;
    const attributesHeight = classElement.attributes.length ? classElement.attributes.length * lineHeight + separator : separator;
    const operationsHeight = classElement.operations.length ? classElement.operations.length * lineHeight + separator : separator;
    classElement.h = baseHeight + separator + attributesHeight + operationsHeight + 10;
    
    this.onChangeCallback();
  }

  /**
   * Apply form inputs to the selected package.
   */
  applyPackageEditor() {
    const selected = this.diagramState.selectedElement;
    if (!selected || selected.type !== "package") return;
    const packageElement = this.diagramState.getPackageById(selected.id);
    const { inputPackageName } = this.references;
    packageElement.name = inputPackageName.value.trim() || "Module";
    this.onChangeCallback();
    this.refreshPackageSelect();
  }

  /**
   * Sync editor panels with the current selection and state.
   */
  updateEditors() {
    const {
      noSelectionPanel,
      classEditorPanel,
      packageEditorPanel,
      inputClassName,
      attrsContainer,
      opsContainer,
      inputClassPackage,
      inputPackageName,
    } = this.references;
    const selected = this.diagramState.selectedElement;
    
    if (!selected) {
      noSelectionPanel.classList.remove("d-none");
      classEditorPanel.classList.add("d-none");
      packageEditorPanel.classList.add("d-none");
      this.currentClassId = null;
      return;
    }
    
    noSelectionPanel.classList.add("d-none");
    
    if (selected.type === "class") {
      classEditorPanel.classList.remove("d-none");
      packageEditorPanel.classList.add("d-none");
      const classElement = this.diagramState.getClassById(selected.id);
      
      if (this.currentClassId !== selected.id) {
        this.currentClassId = selected.id;
        inputClassName.value = classElement.name;
        this.populateAttributes(attrsContainer, classElement.attributes);
        this.populateOperations(opsContainer, classElement.operations);
        this.refreshPackageSelect();
        inputClassPackage.value = classElement.packageId || "";
      }
    } else {
      packageEditorPanel.classList.remove("d-none");
      classEditorPanel.classList.add("d-none");
      this.currentClassId = null;
      const packageElement = this.diagramState.getPackageById(selected.id);
      inputPackageName.value = packageElement.name;
    }
  }
}
