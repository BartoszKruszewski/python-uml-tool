export default class GenerateService {
  constructor(btnGenerate) {
    this.btnGenerate = btnGenerate;
  }
  setBusy(b) {
    this.btnGenerate.disabled = b;
    this.btnGenerate.textContent = b ? "Generating…" : "Generate";
  }
  getFilenameFromDisposition(cd) {
    if (!cd) return null;
    const mStar = cd.match(/filename\\*=(?:UTF-8''|)([^;]+)/i);
    if (mStar)
      return decodeURIComponent(mStar[1].trim().replace(/(^\"|\"$)/g, ""));
    const m = cd.match(/filename=\"?([^\";]+)\"?/i);
    return m ? m[1] : null;
  }
  async generate(xml) {
    try {
      this.setBusy(true);
      const xmlBlob = new Blob([xml], { type: "application/xml" });
      const xmlFile = new File([xmlBlob], "diagram.xmi", {
        type: "application/xml",
      });
      const formData = new FormData();
      formData.append("file", xmlFile);
      const resp = await fetch("/generate", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) throw new Error("Server error: " + resp.status);
      const suggested =
        this.getFilenameFromDisposition(
          resp.headers.get("Content-Disposition")
        ) || "generated.zip";
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggested;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } finally {
      this.setBusy(false);
    }
  }
}
