export default class GenerateService {
  constructor(generateButtonElement) {
    this.generateButtonElement = generateButtonElement;
  }

  setBusy(isBusy) {
    this.generateButtonElement.disabled = isBusy;
    this.generateButtonElement.textContent = isBusy ? "Generating…" : "Generate";
  }

  getFilenameFromDisposition(contentDispositionHeader) {
    if (!contentDispositionHeader) return null;
    const matchStar = contentDispositionHeader.match(/filename\*=(?:UTF-8''|)([^;]+)/i);
    if (matchStar)
      return decodeURIComponent(matchStar[1].trim().replace(/(^\"|\"$)/g, ""));
    const match = contentDispositionHeader.match(/filename=\"?([^\";]+)\"?/i);
    return match ? match[1] : null;
  }

  async generate(xmiXml) {
    try {
      console.log(xmiXml);
      this.setBusy(true);
      const xmlBlob = new Blob([xmiXml], { type: "application/xml" });
      const xmlFile = new File([xmlBlob], "diagram.xmi", {
        type: "application/xml",
      });
      const formData = new FormData();
      formData.append("file", xmlFile);
      const response = await fetch("/generate", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Server error: " + response.status);
      const suggestedFilename =
        this.getFilenameFromDisposition(
          response.headers.get("Content-Disposition")
        ) || "generated.zip";
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchorElement = document.createElement("a");
      anchorElement.href = url;
      anchorElement.download = suggestedFilename;
      document.body.appendChild(anchorElement);
      anchorElement.click();
      URL.revokeObjectURL(url);
      anchorElement.remove();
    } finally {
      this.setBusy(false);
    }
  }
}
