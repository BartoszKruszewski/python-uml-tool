/**
 * Handles POSTing XMI to the backend and triggering the download of generated artifacts.
 */
export default class GenerateService {
  /**
   * @param {HTMLButtonElement} generateButtonElement - The "Generate" button to show busy state.
   */
  constructor(generateButtonElement) {
    this.generateButtonElement = generateButtonElement;
  }

  /**
   * Toggle busy UI state on the generate button.
   * @param {boolean} isBusy - Whether generation is in progress.
   */
  setBusy(isBusy) {
    this.generateButtonElement.disabled = isBusy;
    this.generateButtonElement.textContent = isBusy ? "Generating…" : "Generate";
  }

  /**
   * Extract a filename from a Content-Disposition header, supporting RFC 5987.
   * @param {string|null} contentDispositionHeader - Header value.
   * @returns {string|null} Suggested filename or null if not present.
   */
  getFilenameFromDisposition(contentDispositionHeader) {
    if (!contentDispositionHeader) return null;
    const matchStar = contentDispositionHeader.match(/filename\*=(?:UTF-8''|)([^;]+)/i);
    if (matchStar)
      return decodeURIComponent(matchStar[1].trim().replace(/(^\"|\"$)/g, ""));
    const match = contentDispositionHeader.match(/filename=\"?([^\";]+)\"?/i);
    return match ? match[1] : null;
  }

  /**
   * Send the XMI to the backend and download the resulting archive.
   * @param {string} xmiXml - XMI document content.
   * @returns {Promise<void>} Resolves when the download is triggered.
   */
  async generate(xmiXml) {
    try {
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
