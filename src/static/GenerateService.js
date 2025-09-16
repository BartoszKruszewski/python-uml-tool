export default class GenerateService {
  constructor(btnGenerate) {
    this.btnGenerate = btnGenerate;
  }
  setBusy(b) { this.btnGenerate.disabled = b; this.btnGenerate.textContent = b ? 'Generating…' : 'Generate'; }
  getFilenameFromDisposition(cd) {
    if (!cd) return null;
    const mStar = cd.match(/filename\\*=(?:UTF-8''|)([^;]+)/i);
    if (mStar) return decodeURIComponent(mStar[1].trim().replace(/(^\"|\"$)/g, ''));
    const m = cd.match(/filename=\"?([^\";]+)\"?/i);
    return m ? m[1] : null;
  }
  async generate(xml) {
    try {
      this.setBusy(true);
      const resp = await fetch('/generate', { method: 'POST', headers: { 'Content-Type': 'application/xml', 'Accept': 'application/zip' }, body: xml });
      if (!resp.ok) throw new Error('Server error: ' + resp.status);
      const suggested = this.getFilenameFromDisposition(resp.headers.get('Content-Disposition')) || 'generated.zip';
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = suggested; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
    } finally {
      this.setBusy(false);
    }
  }
}