import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../api/axios.js";

export function Dashboard() {
  const navigate = useNavigate();
  const [githubUrl, setGithubUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // The single repo currently being worked on. Nothing is persisted on
  // the server — analyzing a new URL simply replaces this.
  const [repository, setRepository] = useState(null);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    setAnalyzing(true);
    try {
      const res = await api.post("/repositories/clone", { githubUrl });
      setRepository(res.data.data.repository);
      toast.success("Repository analyzed successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not analyze that repository");
    } finally {
      setAnalyzing(false);
    }
  }

  function openChat() {
    navigate(`/chat/${encodeURIComponent(repository.githubUrl)}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <section className="card mb-10 p-6">
        <p className="label-eyebrow mb-2">New analysis</p>
        <h1 className="mb-2 font-display text-2xl font-semibold text-slate-100">
          Paste a public GitHub repo URL
        </h1>
        <p className="mb-5 text-sm text-slate-500">
          You can only work on one repository at a time — analyzing a new URL
          replaces whatever you had open.
        </p>

        <form onSubmit={handleAnalyze} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            required
            placeholder="https://github.com/owner/repo"
            className="input-field flex-1"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            disabled={analyzing}
          />
          <button type="submit" disabled={analyzing} className="btn-primary sm:w-40">
            {analyzing ? "Analyzing…" : "Analyze"}
          </button>
        </form>
      </section>

      {analyzing && !repository && (
        <div className="card flex justify-center p-10">
          <span className="font-display text-sm text-slate-400">
            Cloning and analyzing your repository…
          </span>
        </div>
      )}

      {repository && (
        <section className="card p-5">
          <p className="label-eyebrow">Current repository</p>
          <a
            href={repository.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="font-display text-base font-semibold text-slate-100 hover:text-signal-400"
          >
            {repository.githubUrl.replace("https://github.com/", "")}
          </a>

          <div className="my-4 flex gap-6">
            <div>
              <p className="text-2xl font-semibold text-slate-100">
                {repository.totalFiles}
              </p>
              <p className="text-xs text-slate-500">files</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-100">
                {repository.totalFolders}
              </p>
              <p className="text-xs text-slate-500">folders</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-1.5">
            {repository.languages.length === 0 && (
              <span className="text-xs text-slate-500">No recognized file types</span>
            )}
            {repository.languages.map((lang) => (
              <span
                key={lang}
                className="rounded border border-ink-600 bg-ink-800 px-2 py-0.5 font-display text-[11px] uppercase tracking-wide text-amber-400"
              >
                {lang}
              </span>
            ))}
          </div>

          <button onClick={openChat} className="btn-secondary w-full">
            Ask about this repo
          </button>
        </section>
      )}
    </div>
  );
}
