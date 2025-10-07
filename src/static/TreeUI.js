export default class TreeUI {
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

  render() {
    this.treeElement.innerHTML = "";
    const unorderedListElement = document.createElement("ul");
    this.diagramState.packageList.forEach((packageElement) => {
      unorderedListElement.appendChild(this.renderPackage(packageElement));
    });
    this.treeElement.appendChild(unorderedListElement);
  }

  renderPackage(packageElement) {
    const listItemElement = document.createElement("li");
    listItemElement.textContent = packageElement.name;
    listItemElement.tabIndex = 0;
    listItemElement.dataset.id = packageElement.id;
    listItemElement.className = "package";
    if (this.selectedPackageId === packageElement.id) listItemElement.classList.add("selected");

    // Render classes belonging to this package
    const classList = this.diagramState.classList.filter(
      (classElement) => classElement.packageId === packageElement.id
    );
    if (classList.length > 0) {
      const classUl = document.createElement("ul");
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
        classUl.appendChild(classLi);
      });
      listItemElement.appendChild(classUl);
    }
    return listItemElement;
  }

    onClick(event) {
      const listItemElement = event.target.closest("li");
      if (!listItemElement) return;
      this.selectedPackageId = listItemElement.dataset.id;
      this.onChangeCallback?.(this.selectedPackageId);
      this.render();
    }

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
