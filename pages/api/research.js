// pages/api/research.js
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cveId } = req.body;
  if (!cveId || !/^CVE-\d{4}-\d+$/.test(cveId)) {
    return res.status(400).json({ error: "Invalid CVE format" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key missing." });

  console.info(`[DEEP RESEARCH] Fresh gathering for ${cveId} (No Cache)...`);
  
  let technicalContext = "";
  let referenceLinks = [];

  // Phase 1: Fetch NVD History & Meta
  try {
    const nvdHistoryUrl = `https://services.nvd.nist.gov/rest/json/cvehistory/2.0?cveId=${cveId}`;
    const nvdResp = await fetch(nvdHistoryUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    
    if (nvdResp.ok) {
        const nvdJson = await nvdResp.json();
        const historyEntries = nvdJson.cveChanges || [];
        historyEntries.forEach(entry => {
            if (entry.change?.details) {
                entry.change.details.forEach(detail => {
                    if (detail.value) technicalContext += `\n- ${detail.value}`;
                });
            }
        });
        
        const mainCveUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`;
        const mainResp = await fetch(mainCveUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (mainResp.ok) {
            const mainJson = await mainResp.json();
            const cveItem = mainJson.vulnerabilities?.[0]?.cve;
            if (cveItem) {
                technicalContext += `\nPrimary Description: ${cveItem.descriptions?.[0]?.value || ""}`;
                referenceLinks = cveItem.references?.map(r => r.url) || [];
            }
        }
    }
  } catch (err) {
    console.warn("NVD API failed:", err.message);
  }

  // Phase 2: Synthesis via Gemini 3
  try {
    const ai = new GoogleGenAI({});
    const deepPrompt = `Perform "Deep Intelligence Gathering" for ${cveId}. Use this collected intelligence context:
${technicalContext}

Reference Links to analyze:
${referenceLinks.join("\n")}

YOUR MISSION:
1. Synthesize vulnerable code paths, protocol sequences, or logic flaw mechanisms.
2. Extract the exact payload structure required for an educational PoC reproduction.
3. Detail prerequisite lab configurations.

Output ONLY the technical analysis.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: deepPrompt,
    });

    const text = response.text || "";
    if (!text) throw new Error("Intelligence synthesis failed.");

    const cvssMatch = text.match(/CVSS[^:]*[:\s]*([0-9.]+)/i);
    
    return res.status(200).json({
      id: cveId,
      description: text,
      cvss: cvssMatch ? parseFloat(cvssMatch[1]) : null,
      vector: "Real-time Intelligence (No Cache)",
    });
  } catch (err) {
    console.error("Deep Research Error:", err);
    return res.status(502).json({ error: err.message });
  }
}
