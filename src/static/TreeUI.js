/**
 * Renders and manages the package/class tree in the sidebar.
 */
export default class TreeUI {
  /**
   * @param {HTMLElement} treeElement - Container element for the tree.
   * @param {import("./DiagramState.js").default} diagramState - Shared diagram state.
   * @param {(elementType:"class"|"package"|"relation", elementId:string) => void} onChangeCallback - Called when selection changes.
   */
  constructor(treeElement, diagramState, onChangeCallback) {
    this.treeElement = treeElement;
    this.diagramState = diagramState;
    this.onChangeCallback = onChangeCallback;
    this.treeElement.addEventListener("click", (event) => this.onClick(event));
    this.treeElement.addEventListener("dblclick", (event) => this.onDoubleClick(event));
    this.treeElement.addEventListener("keydown", (event) => this.onKeyDown(event));
    this.selectedPackageId = null;
    this.editingPackageId = null;
  }

  /**
   * Render the entire tree based on current state.
   * @returns {void}
   */
  render() {
    this.treeElement.innerHTML = "";
    const unorderedListElement = document.createElement("ul");
    // Render only top-level packages (those without parentId)
    this.diagramState.packageList.forEach((packageElement) => {
      if (!packageElement.parentId) {
        unorderedListElement.appendChild(this.renderPackage(packageElement));
      }
    });
    
    // Render relations section
    if (this.diagramState.relationList.length > 0) {
      const relationsLi = document.createElement("li");
      relationsLi.textContent = "Relations";
      relationsLi.className = "relations-header";
      relationsLi.style.fontWeight = "600";
      relationsLi.style.marginTop = "0.5rem";
      relationsLi.style.paddingTop = "0.5rem";
      relationsLi.style.borderTop = "1px solid var(--border)";
      
      const relationsUl = document.createElement("ul");
      this.diagramState.relationList.forEach((relation) => {
        const sourceClass = this.diagramState.getClassById(relation.source);
        const targetClass = this.diagramState.getClassById(relation.target);
        
        if (sourceClass && targetClass) {
          const relationLi = document.createElement("li");
          relationLi.className = "relation";
          relationLi.tabIndex = 0;
          relationLi.dataset.id = relation.id;
          relationLi.dataset.type = "relation";
          
          // Format: SourceClass --[type]--> TargetClass
          const typeLabel = relation.type.charAt(0).toUpperCase() + relation.type.slice(1);
          relationLi.textContent = `${sourceClass.name} --[${typeLabel}]--> ${targetClass.name}`;
          relationLi.style.fontSize = "0.85rem";
          relationLi.style.color = "var(--muted)";
          
          if (
            this.diagramState.selectedElement?.type === "relation" &&
            this.diagramState.selectedElement.id === relation.id
          ) {
            relationLi.classList.add("selected");
          }
          
          relationsUl.appendChild(relationLi);
        }
      });
      
      if (relationsUl.children.length > 0) {
        relationsLi.appendChild(relationsUl);
        unorderedListElement.appendChild(relationsLi);
      }
    }
    
    this.treeElement.appendChild(unorderedListElement);
  }

  /**
   * Render a single package list item with its classes and nested packages.
   * @param {{id:string,name:string,parentId:(string|null)}} packageElement - Package to render.
   * @returns {HTMLLIElement} Created list item element.
   */
  renderPackage(packageElement) {
    const listItemElement = document.createElement("li");
    listItemElement.textContent = packageElement.name;
    listItemElement.tabIndex = 0;
    listItemElement.dataset.id = packageElement.id;
    listItemElement.className = "package";
    if (this.selectedPackageId === packageElement.id) listItemElement.classList.add("selected");

    const childrenUl = document.createElement("ul");

    // Render nested packages
    const nestedPackages = this.diagramState.packageList.filter(
      (pkg) => pkg.parentId === packageElement.id
    );
    nestedPackages.forEach((nestedPackage) => {
      childrenUl.appendChild(this.renderPackage(nestedPackage));
    });

    // Render classes belonging to this package
    const classList = this.diagramState.classList.filter(
      (classElement) => classElement.packageId === packageElement.id
    );
    classList.forEach((classElement) => {
      const classLi = document.createElement("li");
      classLi.textContent = classElement.name;
      classLi.tabIndex = 0;
      classLi.dataset.id = classElement.id;
      classLi.className = "class";
      if (
        this.diagramState.selectedElement?.type === "class" &&
        this.diagramState.selectedElement.id === classElement.id
      ) {
        classLi.classList.add("selected");
      }
      childrenUl.appendChild(classLi);
    });

    if (childrenUl.children.length > 0) {
      listItemElement.appendChild(childrenUl);
    }
    return listItemElement;
  }

    /**
     * Handle single-click selection.
     * @param {MouseEvent} event
     */
    onClick(event) {
      const listItemElement = event.target.closest("li");
      if (!listItemElement) return;
      
      // Check if it's a relation
      if (listItemElement.dataset.type === "relation") {
        this.onChangeCallback?.("relation", listItemElement.dataset.id);
        this.render();
        return;
      }
      
      // Check if it's a class
      if (listItemElement.classList.contains("class")) {
        this.onChangeCallback?.("class", listItemElement.dataset.id);
        this.render();
        return;
      }
      
      // Otherwise it's a package
      this.selectedPackageId = listItemElement.dataset.id;
      this.onChangeCallback?.("package", this.selectedPackageId);
      this.render();
    }

    /**
     * Enter inline edit mode for a package name.
     * @param {MouseEvent} event
     */
    onDoubleClick(event) {
      const listItemElement = event.target.closest("li");
      if (!listItemElement) return;
      this.editingPackageId = listItemElement.dataset.id;
      this.render();
      const inputElement = document.createElement("input");
      inputElement.value = listItemElement.textContent;
      listItemElement.textContent = "";
      listItemElement.appendChild(inputElement);
      inputElement.focus();
      inputElement.addEventListener("blur", () => {
        this.diagramState.packageList.find((packageElement) => packageElement.id === this.editingPackageId).name =
          inputElement.value;
        this.editingPackageId = null;
        this.render();
      });
      inputElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter") inputElement.blur();
      });
    }

    /**
     * Handle key events (Delete removes selected package).
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
      if (event.key === "Delete" && this.selectedPackageId) {
        const packageIndex = this.diagramState.packageList.findIndex((packageElement) => packageElement.id === this.selectedPackageId);
        if (packageIndex !== -1) {
          this.diagramState.packageList.splice(packageIndex, 1);
          this.selectedPackageId = null;
          this.onChangeCallback?.(null);
          this.render();
        }
      }
    }
  }
