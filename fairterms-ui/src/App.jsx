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
      const res = await fetch("https://fairterms-ai.onrender.com/api/analyze", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

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

  const score = Math.max(0, Math.min(100, Number(result?.fairness_score) || 0));
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const red = (result?.red_flags?.length || 0) * 3;
  const yellow = (result?.yellow_flags?.length || 0) * 2;
  const green = (result?.green_flags?.length || 0) * 1;
  const total = red + yellow + green || 1;

  const redWidth = (red / total) * 100;
  const yellowWidth = (yellow / total) * 100;
  const greenWidth = (green / total) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative selection:bg-blue-500/30">
      
      {/* ✅ NAVBAR MATCHING FIGMA */}
      <nav className="absolute top-0 w-full flex justify-between items-center px-6 md:px-12 py-6 left-0 right-0 z-10">
        <div className="flex items-center gap-3 font-bold text-xl text-white">
          <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
              <path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
            </svg>
          </div>
          FairTerms.AI
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <button className="hover:text-white transition">How it works</button>
          <button className="hover:text-white transition">Pricing</button>
        </div>
      </nav>

      <AnimatePresence>

        {/* ✅ REDESIGNED HOME PAGE */}
        {page === "home" && (
          <motion.div
            className="flex flex-col items-center justify-center min-h-screen p-6 pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-3xl w-full flex flex-col items-center mt-12 md:mt-0">
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-center leading-tight mb-6 tracking-tight text-white">
                Understand what you're <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">signing away.</span>
              </h1>

              <p className="text-center text-slate-400 text-base md:text-lg mb-10 max-w-2xl leading-relaxed">
                Paste any terms of service, privacy policy, or contract. Our AI lawyer will find the red flags and translate the legalese into plain English in seconds.
              </p>

              <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 w-full shadow-2xl">
                
                <div className="flex items-center gap-2 text-slate-300 font-medium mb-3 text-sm px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Paste Terms & Conditions or Privacy Policy
                </div>

                <textarea
                  className="w-full h-56 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition resize-none"
                  placeholder="e.g., 'By using our services, you agree that we may collect, store, and process your personal information...'"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <div className="flex justify-end mt-4">
                  <button
                    onClick={analyze}
                    disabled={!text.trim()}
                    className="flex items-center gap-2 bg-[#1A2235] hover:bg-blue-600 text-slate-300 hover:text-white disabled:opacity-50 disabled:hover:bg-[#1A2235] disabled:cursor-not-allowed transition-all duration-300 px-6 py-2.5 rounded-lg font-medium border border-slate-700 hover:border-blue-500 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Analyze Agreement
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* RESULTS PAGE (Unchanged layout, but inherits new font/bg) */}
        {page === "result" && result && (
          <motion.div
            className="p-6 max-w-6xl mx-auto pt-24"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setPage("home")}
              className="mb-6 text-slate-400 hover:text-blue-400 transition flex items-center gap-2 font-medium"
            >
              ← Back to analyzer
            </button>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-8">Analysis Results</h2>

              <div className="flex flex-col md:flex-row gap-12 items-center mb-8">
                {/* SCORE */}
                <div className="relative">
                  <svg height={radius * 2} width={radius * 2}>
                    <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                    <motion.circle
                      stroke={getColor(score)}
                      fill="transparent"
                      strokeWidth={stroke}
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      strokeLinecap="round"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl font-black">
                    {score}
                  </div>
                </div>

                {/* BARS */}
                <div className="w-full flex-1">
                  <div className="flex justify-between text-sm mb-1"><span className="font-medium">High Risk</span></div>
                  <div className="bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <motion.div initial={{width: 0}} animate={{width: `${redWidth}%`}} className="bg-red-500 h-full rounded-full" />
                  </div>

                  <div className="flex justify-between text-sm mb-1 mt-5"><span className="font-medium">Medium Risk</span></div>
                  <div className="bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <motion.div initial={{width: 0}} animate={{width: `${yellowWidth}%`}} className="bg-yellow-400 h-full rounded-full" />
                  </div>

                  <div className="flex justify-between text-sm mb-1 mt-5"><span className="font-medium">Low Risk</span></div>
                  <div className="bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <motion.div initial={{width: 0}} animate={{width: `${greenWidth}%`}} className="bg-green-500 h-full rounded-full" />
                  </div>
                </div>
              </div>

              {/* FLAGS */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-[#451a1e]/30 border border-red-900/50 p-5 rounded-xl">
                  <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">🚨 Red Flags</h3>
                  <div className="space-y-2 text-sm text-slate-300 text-opacity-90">
                    {result?.red_flags?.map((f, i) => <p key={i}>• {f}</p>)}
                  </div>
                </div>

                <div className="bg-[#423315]/30 border border-yellow-900/50 p-5 rounded-xl">
                  <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">⚠️ Yellow Flags</h3>
                  <div className="space-y-2 text-sm text-slate-300 text-opacity-90">
                    {result?.yellow_flags?.map((f, i) => <p key={i}>• {f}</p>)}
                  </div>
                </div>

                <div className="bg-[#143323]/30 border border-green-900/50 p-5 rounded-xl">
                  <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">✅ Green Flags</h3>
                  <div className="space-y-2 text-sm text-slate-300 text-opacity-90">
                    {result?.green_flags?.map((f, i) => <p key={i}>• {f}</p>)}
                  </div>
                </div>
              </div>

              {/* TRANSLATIONS */}
              <div className="mt-8 bg-slate-950 border border-slate-800 p-6 rounded-xl">
                <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                  🧠 Simplified Explanation
                </h3>
                <div className="space-y-4">
                  {result?.translations?.map((item, i) => (
                    <div key={i} className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                      <p className="text-sm text-slate-400 mb-2">
                        <span className="font-semibold text-slate-500 uppercase text-xs tracking-wider">Original:</span><br/> {item.original}
                      </p>
                      <p className="text-slate-200">
                        <span className="font-semibold text-blue-400 uppercase text-xs tracking-wider">Simple:</span><br/> {item.simple}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full blur-xl opacity-70 bg-gradient-to-r from-blue-500 to-indigo-500 animate-spin"></div>
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin relative z-10"></div>
            </div>
            <h2 className="text-lg font-bold text-white">AI Lawyer is analyzing...</h2>
            <p className="text-sm text-slate-400 mt-2">Scanning for unfair clauses and loopholes</p>
          </div>
        </div>
      )}
    </div>   
  );
}