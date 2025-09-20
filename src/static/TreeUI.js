export default class TreeUI {
  constructor(container, state, onSelect) {
    this.container = container;
    this.state = state;
    this.onSelect = onSelect;
  }
  render(modelName) {
    const div = document.createElement("div");
    div.className = "space-y-2";
    const root = document.createElement("div");
    root.innerHTML = `<div class="font-semibold">Model: ${
      modelName || "Diagram"
    }</div>`;
    div.appendChild(root);

    this.state.packages.forEach((p) => {
      const wrap = document.createElement("div");
      wrap.className = "pl-2";
      const h = document.createElement("div");
      h.className = "cursor-pointer hover:text-sky-300";
      h.textContent = "📦 " + p.name;
      h.onclick = () => this.onSelect("package", p.id);
      wrap.appendChild(h);
      const ul = document.createElement("ul");
      ul.className = "pl-4 list-disc";
      this.state.classes
        .filter((c) => c.packageId === p.id)
        .forEach((c) => {
          const li = document.createElement("li");
          li.className = "cursor-pointer hover:text-sky-300";
          li.textContent = "📄 " + c.name;
          li.onclick = () => this.onSelect("class", c.id);
          ul.appendChild(li);
        });
      wrap.appendChild(ul);
      div.appendChild(wrap);
    });

    const orphans = this.state.classes.filter((c) => !c.packageId);
    if (orphans.length) {
      const wrap = document.createElement("div");
      wrap.className = "pl-2";
      const h = document.createElement("div");
      h.textContent = "📁 (no module)";
      wrap.appendChild(h);
      const ul = document.createElement("ul");
      ul.className = "pl-4 list-disc";
      orphans.forEach((c) => {
        const li = document.createElement("li");
        li.className = "cursor-pointer hover:text-sky-300";
        li.textContent = "📄 " + c.name;
        li.onclick = () => this.onSelect("class", c.id);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      div.appendChild(wrap);
    }

    if (this.state.relations.length) {
      const rel = document.createElement("div");
      rel.className = "pl-2";
      const h = document.createElement("div");
      h.textContent = "🔗 Relations";
      rel.appendChild(h);
      const ul = document.createElement("ul");
      ul.className = "pl-4 list-disc";
      this.state.relations.forEach((r) => {
        const a = this.state.classById(r.source),
          b = this.state.classById(r.target);
        const li = document.createElement("li");
        li.textContent = `${r.type}: ${a?.name || r.source} → ${
          b?.name || r.target
        }`;
        ul.appendChild(li);
      });
      rel.appendChild(ul);
      div.appendChild(rel);
    }

    this.container.innerHTML = "";
    this.container.appendChild(div);
  }
}
