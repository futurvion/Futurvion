// Kept as a native Node worker and included in the route's deployment trace.
import { parentPort, workerData } from "node:worker_threads";
import yauzl from "yauzl";
import mammoth from "mammoth";

const bytes = Buffer.from(workerData.bytes);
const limits = workerData.limits;
let text = "";
function inspectDocx() {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(bytes, { lazyEntries: true, validateEntrySizes: true }, (error, zip) => {
      if (error || !zip) return reject(new Error("Invalid archive"));
      let entries = 0, expanded = 0, documentFound = false;
      zip.on("entry", entry => {
        entries++;
        expanded += entry.uncompressedSize;
        if (entry.fileName === "word/document.xml") documentFound = true;
        if (entries > 1000 || expanded > 10 * 1024 * 1024 || entry.fileName.includes("..") || entry.fileName.startsWith("/") || (entry.generalPurposeBitFlag & 1)) {
          zip.close(); reject(new Error("Invalid archive"));
        } else zip.readEntry();
      });
      zip.on("end", () => documentFound ? resolve() : reject(new Error("Missing document")));
      zip.on("error", () => { zip.close(); reject(new Error("Invalid archive")); });
      zip.readEntry();
    });
  });
}
try {
  if (workerData.format === "docx") {
    await inspectDocx();
    text = (await mammoth.extractRawText({ buffer: bytes })).value;
  } else {
    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const task = getDocument({ data: new Uint8Array(bytes), verbosity: 0, useSystemFonts: false, isEvalSupported: false, stopAtErrors: true });
    try {
      const pdf = await task.promise;
      if (pdf.numPages > limits.maxPages) throw new Error("Too many pages");
      for (let number = 1; number <= pdf.numPages; number++) {
        const page = await pdf.getPage(number);
        const content = await page.getTextContent();
        for (const item of content.items) {
          if ("str" in item) text += item.str + (item.hasEOL ? "\n" : " ");
          if (text.length > limits.maxTextCharacters) throw new Error("Too much text");
        }
        text += "\n";
        page.cleanup();
      }
    } finally { await task.destroy(); }
  }
  text = text.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim();
  if (!text || text.length > limits.maxTextCharacters) throw new Error("No usable text");
  parentPort.postMessage({ text });
} catch {
  // Neither parser diagnostics nor document text leave the worker on failure.
  parentPort.postMessage({ error: true });
} finally {
  bytes.fill(0);
  workerData.bytes.fill(0);
  text = "";
}
