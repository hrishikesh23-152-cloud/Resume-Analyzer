const pdfParse = require("pdf-parse");

async function extractResumeText(file) {
    if (!file || !file.buffer) {
        return "";
    }

    try {
        if (typeof pdfParse === "function") {
            const parsed = await pdfParse(file.buffer);
            return parsed.text || "";
        }

        if (pdfParse.PDFParse) {
            const parser = new pdfParse.PDFParse(Uint8Array.from(file.buffer));
            const resumeContent = await parser.getText();
            return typeof resumeContent === "string" ? resumeContent : (resumeContent.text || "");
        }

        return file.buffer.toString("utf-8");
    } catch (error) {
        console.error("PDF Parsing error:", error);
        return "";
    }
}

module.exports = { extractResumeText };
