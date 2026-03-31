// pages/index.js
import { useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [cve, setCve] = useState("");
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [researchData, setResearchData] = useState(null);

  const handleGenerate = async () => {
    if (!/^CVE-\d{4}-\d+$/.test(cve.trim().toUpperCase())) {
      setError("Please enter a valid CVE ID (e.g., CVE-2024-1234)");
      return;
    }
    setError("");
    setResult(null);
    setResearchData(null);
    setLoading(true);
    try {
      console.log("Fetching research for:", cve);
      // 1️⃣ fetch CVE research
      const researchRes = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cveId: cve.trim().toUpperCase() })
      });
      if (!researchRes.ok) throw new Error((await researchRes.json()).error || "Research failed");
      const cveData = await researchRes.json();
      setResearchData(cveData);

      console.log("Generating exploit for:", cveData.id);
      // 2️⃣ generate exploit
      const exploitRes = await fetch("/api/exploit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cve: cveData, language })
      });
      if (!exploitRes.ok) throw new Error((await exploitRes.json()).error || "Exploit generation failed");
      const exploit = await exploitRes.json();
      
      if (!exploit.code) {
        throw new Error("AI refused to generate code or returned an empty response. This often happens due to safety filters on exploit generation.");
      }
      
      setResult(exploit);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    alert("Copied to clipboard!");
  };

  return (
    <>
      <Head>
        <title>CVE Exploit POC Generator</title>
        <meta name="description" content="Enter a CVE ID and instantly get a weaponized exploit in your language of choice using Gemini AI." />
      </Head>
      <main className={styles.container}>
        <h1 className={styles.title}>POCme Intelligence</h1>
        
        <div className={styles.card}>
          <label className={styles.label}>CVE ID</label>
          <input
            className={styles.input}
            value={cve}
            onChange={(e) => setCve(e.target.value)}
            placeholder="e.g. CVE-2024-1234"
          />
          <label className={styles.label}>Execution Language</label>
          <select
            className={styles.select}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="ruby">Ruby</option>
            <option value="javascript">JavaScript (Node)</option>
            <option value="bash">Bash</option>
          </select>
          <button className={styles.button} onClick={handleGenerate} disabled={loading}>
            {loading ? (researchData ? "Drafting Exploit..." : "Researching CVE...") : "Generate POC"}
          </button>
          {error && <p className={styles.error}>❌ {error}</p>}
        </div>

        {researchData && (
          <div className={styles.researchCard}>
            <h2 className={styles.subTitle}>Research Intelligence</h2>
            <div className={styles.infoGrid}>
              <p><strong>ID:</strong> {researchData.id}</p>
              <p><strong>CVSS:</strong> {researchData.cvss || "N/A"}</p>
            </div>
            <p className={styles.description}><strong>Description:</strong> {researchData.description}</p>
          </div>
        )}

        {result && (
          <div className={styles.resultCard}>
            <h2 className={styles.subTitle}>Generated POC ({result.language})</h2>
            <pre className={styles.codeBlock}>{result.code}</pre>
            <button className={styles.button} onClick={copyToClipboard}>Copy Payload</button>
          </div>
        )}

        <footer className={styles.footer}>
          <p>⚠️ <strong>Authorized Use Only:</strong> This tool is for authorized security testing and research purposes. Use responsibly.</p>
        </footer>
      </main>
    </>
  );
}
