import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [page, setPage] = useState("home");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      console.log("REAL AI DATA:", data);

      if (data.error) {
        alert("Backend Error: " + data.error);
        console.log(data.raw);
        setLoading(false);
        return;
      }

      setResult(data);
      setPage("result");

    } catch (err) {
      alert("Backend not reachable");
      console.error(err);
    }

    setLoading(false);
  };

  const getColor = (score) => {
    if (score < 40) return "#ef4444";
    if (score < 70) return "#facc15";
    return "#22c55e";
  };

  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let score = result?.fairness_score || 0;

// ✅ FIX SCALE (THIS IS THE ONLY THING YOU NEED)
if (score <= 10) {
  score = score * 10;
}
  const strokeDashoffset =
    circumference - (score / 100) * circumference;

  // ✅ Apply weights (IMPORTANT)
const red = (result?.red_flags?.length || 0) * 3;
const yellow = (result?.yellow_flags?.length || 0) * 2;
const green = (result?.green_flags?.length || 0) * 1;

// ✅ Normalize to percentage
const total = red + yellow + green || 1;

const redWidth = (red / total) * 100;
const yellowWidth = (yellow / total) * 100;
const greenWidth = (green / total) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <AnimatePresence>

        {/* HOME */}
        {page === "home" && (
          <motion.div
            className="flex items-center justify-center min-h-screen p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-slate-900/60 backdrop-blur-lg p-8 rounded-2xl w-full max-w-2xl shadow-xl border border-slate-700">

              <h1 className="text-4xl font-bold mb-4 text-center">
                FairTerms AI
              </h1>

              <p className="text-center text-slate-400 mb-6">
                Analyze agreements instantly using AI
              </p>

              <textarea
                className="w-full p-4 bg-slate-800 rounded-lg"
                rows="6"
                placeholder="Paste Terms & Conditions..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <button
                onClick={analyze}
                className="mt-4 w-full bg-blue-600 p-3 rounded-lg hover:bg-blue-500 transition"
              >
                Analyze Agreement
              </button>
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {page === "result" && result && (
          <motion.div
            className="p-6 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setPage("home")}
              className="mb-6 text-blue-400"
            >
              ← Back
            </button>

            <div className="bg-slate-900 p-6 rounded-xl shadow-xl">

              <h2 className="text-2xl mb-6">Analysis Results</h2>

              <div className="flex flex-col md:flex-row gap-10 items-center">

                {/* SCORE */}
                <div className="relative">
                  <svg height={radius * 2} width={radius * 2}>
                    <circle
                      stroke="#1e293b"
                      fill="transparent"
                      strokeWidth={stroke}
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                    <motion.circle
                      stroke={getColor(score)}
                      fill="transparent"
                      strokeWidth={stroke}
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1 }}
                      strokeLinecap="round"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                    {score}
                  </div>
                </div>

                {/* BARS */}
                <div className="w-full">
                  <p>High Risk</p>
                  <div className="bg-slate-800 h-3 rounded">
                    <div className="bg-red-500 h-3 rounded" style={{ width: `${redWidth}%` }} />
                  </div>

                  <p className="mt-4">Medium Risk</p>
                  <div className="bg-slate-800 h-3 rounded">
                    <div className="bg-yellow-400 h-3 rounded" style={{ width: `${yellowWidth}%` }}  />
                  </div>

                  <p className="mt-4">Low Risk</p>
                  <div className="bg-slate-800 h-3 rounded">
                    <div className="bg-green-500 h-3 rounded" style={{ width: `${greenWidth}%` }} />
                  </div>
                </div>
              </div>

              {/* FLAGS */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">

                <div className="bg-red-900/40 p-4 rounded-lg">
                  <h3 className="text-red-400 font-bold">🚨 Red Flags</h3>
                  {result?.red_flags?.map((f, i) => <p key={i}>• {f}</p>)}
                </div>

                <div className="bg-yellow-900/40 p-4 rounded-lg">
                  <h3 className="text-yellow-300 font-bold">⚠️ Yellow Flags</h3>
                  {result?.yellow_flags?.map((f, i) => <p key={i}>• {f}</p>)}
                </div>

                <div className="bg-green-900/40 p-4 rounded-lg">
                  <h3 className="text-green-400 font-bold">✅ Green Flags</h3>
                  {result?.green_flags?.map((f, i) => <p key={i}>• {f}</p>)}
                </div>

              </div>

              {/* TRANSLATIONS */}
              <div className="mt-8 bg-slate-800 p-4 rounded-lg">
                <h3 className="text-blue-400 font-bold mb-2">
                  🧠 Simplified Explanation
                </h3>

                {result?.translations?.map((item, i) => (
  <div key={i} className="mb-4">
    <p className="text-sm text-slate-400">
      <b>Original:</b> {item.original}
    </p>
    <p className="text-white">
      <b>Simple:</b> {item.simple}
    </p>
  </div>
))}
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {loading && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center">

    <div className="bg-slate-900/70 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center">

      {/* 🔥 GRADIENT GLOW RING */}
      <div className="relative w-20 h-20 mb-6">

        {/* Glow */}
        <div className="absolute inset-0 rounded-full blur-xl opacity-70 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-spin"></div>

        {/* Ring */}
        <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-blue-400 border-r-indigo-400 border-b-purple-400 border-l-transparent animate-spin"></div>

      </div>

      {/* 🧠 TEXT */}
      <h2 className="text-lg font-semibold text-white">
        AI Lawyer is analyzing...
      </h2>

      <p className="text-sm text-slate-400 mt-1">
        Scanning for unfair clauses and loopholes
      </p>

    </div>

  </div>
)}
</div>   
  );
}