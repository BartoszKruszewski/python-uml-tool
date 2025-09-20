import App from "./App.js";

const svg = document.getElementById("svg");
const viewport = document.getElementById("viewport");
const gridPattern = document.getElementById("gridPattern");
const gridRect = document.getElementById("gridRect");
const tree = document.getElementById("tree");

const btnAddClass = document.getElementById("btnAddClass");
const btnAddPackage = document.getElementById("btnAddPackage");
const btnLinkMode = document.getElementById("btnLinkMode");
const linkTypeSel = document.getElementById("linkType");
const btnGenerate = document.getElementById("btnGenerate");
const btnClear = document.getElementById("btnClear");

const noSel = document.getElementById("noSelection");
const classEditor = document.getElementById("classEditor");
const packageEditor = document.getElementById("packageEditor");
const inClsName = document.getElementById("clsName");
const inAttrs = document.getElementById("clsAttrs");
const inOps = document.getElementById("clsOps");
const inClsPkg = document.getElementById("clsPackage");
const btnUpdate = document.getElementById("btnUpdate");
const btnDelete = document.getElementById("btnDelete");
const inPkgName = document.getElementById("pkgName");
const btnPkgUpdate = document.getElementById("btnPkgUpdate");
const btnPkgDelete = document.getElementById("btnPkgDelete");
const inModelName = document.getElementById("modelName");
const inGridSize = document.getElementById("gridSize");

const app = new App({
  svg,
  viewport,
  gridPattern,
  gridRect,
  tree,
  btnAddClass,
  btnAddPackage,
  btnLinkMode,
  linkTypeSel,
  btnGenerate,
  btnClear,
  noSel,
  classEditor,
  packageEditor,
  inClsName,
  inAttrs,
  inOps,
  inClsPkg,
  btnUpdate,
  btnDelete,
  inPkgName,
  btnPkgUpdate,
  btnPkgDelete,
  inModelName,
  inGridSize,
});
