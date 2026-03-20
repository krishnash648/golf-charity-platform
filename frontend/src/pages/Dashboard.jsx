import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ total: 0, average: 0, best: 0 });
  const [drawResult, setDrawResult] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState("");
  const [loadingScores, setLoadingScores] = useState(true);
  const [drawHistory, setDrawHistory] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(
    localStorage.getItem("isSubscribed") === "true"
  );
  const [charity, setCharity] = useState(
    localStorage.getItem("charity") || ""
  );
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    } else {
      fetchScores();
      fetchDrawHistory();
      fetchGlobalLeaderboard();
    }
  }, []);

  useEffect(() => {
    if (mounted && scores.length > 0) {
      // Animate stats on load
      const targetTotal = scores.length;
      const targetAverage = scores.length > 0
        ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
        : 0;
      const targetBest = scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0;

      let current = { total: 0, average: 0, best: 0 };
      const duration = 1500;
      const steps = 60;
      const increment = duration / steps;

      const timer = setInterval(() => {
        current.total += targetTotal / steps;
        current.average += targetAverage / steps;
        current.best += targetBest / steps;

        setAnimatedStats({
          total: Math.floor(current.total),
          average: parseFloat(current.average).toFixed(1),
          best: Math.floor(current.best)
        });

        if (current.total >= targetTotal) {
          setAnimatedStats({ total: targetTotal, average: targetAverage, best: targetBest });
          clearInterval(timer);
        }
      }, increment);

      return () => clearInterval(timer);
    }
  }, [mounted, scores]);

  const fetchScores = async () => {
    try {
      setLoadingScores(true);
      const res = await API.get("/scores");
      setScores(res.data.data.scores);
    } catch (err) {
      console.error(err);
      setError("Failed to load scores");
    } finally {
      setLoadingScores(false);
    }
  };

  const fetchDrawHistory = async () => {
    try {
      const res = await API.get("/draw");
      setDrawHistory(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load draw history");
    }
  };

  const fetchGlobalLeaderboard = async () => {
    try {
      const res = await API.get("/scores/leaderboard");
      setGlobalLeaderboard(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load global leaderboard");
    }
  };

  const addScore = async () => {
    if (!newScore) {
      setError("Please enter a score");
      return;
    }
    const scoreNum = Number(newScore);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) return alert("Score must be between 1 and 45");

    // Check if user already has 5 scores
    if (scores.length >= 5) {
      setError("Oldest score removed (max 5 allowed)");
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/scores", { score: Number(newScore) });

      setNewScore("");
      fetchScores();
      
      // Success feedback
      setTimeout(() => {
        setError("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to add score");
    } finally {
      setLoading(false);
    }
  };

  const runDraw = async () => {
    try {
      setIsDrawing(true);
      setError("");

      const res = await API.post("/draw/run");

      setDrawResult(res.data.data);
      
      // Success feedback
      setTimeout(() => {
        setError("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to run draw");
    } finally {
      setIsDrawing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleSubscription = () => {
    setIsSubscribed(prev => {
      const newValue = !prev;
      localStorage.setItem("isSubscribed", newValue);
      return newValue;
    });
  };

  const handleCharityChange = (value) => {
    setCharity(value);
    localStorage.setItem("charity", value);
  };

  // Stats
  const totalScores = animatedStats.total;
  const averageScore = animatedStats.average;
  const bestScore = animatedStats.best;

  // Rank System
  const getRank = (score) => {
    if (score >= 60) return { name: "Elite", color: "from-yellow-400 to-yellow-600", icon: "" };
    if (score >= 41) return { name: "Pro", color: "from-purple-400 to-purple-600", icon: "" };
    if (score >= 21) return { name: "Amateur", color: "from-blue-400 to-blue-600", icon: "" };
    return { name: "Beginner", color: "from-green-400 to-green-600", icon: "" };
  };

  const userRank = getRank(bestScore);

  // Get top 5 scores
  const topScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Prepare chart data
  const chartData = scores.slice(-10).map((score, index) => ({
    x: index,
    y: score.score,
    date: new Date(score.createdAt).toLocaleDateString()
  }));

  const userId = localStorage.getItem("userId");

  const didWin = drawResult?.results?.some(
    (r) => r.userId?._id === userId || r.userId === userId
  );

  // Custom SVG Chart with advanced animations
  const ScoreChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 text-gray-400">
          <p className="text-lg">No data to display</p>
        </div>
      );
    }

    const maxScore = Math.max(...chartData.map(d => d.y));
    const minScore = Math.min(...chartData.map(d => d.y));
    const range = maxScore - minScore || 1;

    // Create smooth curve points
    const smoothPoints = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1 || 1)) * 100;
      const y = 100 - ((point.y - minScore) / range) * 80;
      return { x, y };
    });

    // Create quadratic bezier curve
    const curvePoints = [];
    for (let i = 0; i < smoothPoints.length - 1; i++) {
      const p1 = smoothPoints[i];
      const p2 = smoothPoints[i + 1];
      const cp = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      curvePoints.push(`M ${p1.x} ${p1.y} Q ${cp.x} ${cp.y} ${p2.x} ${p2.y}`);
    }

    const points = smoothPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <div className="h-80 relative w-full">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Grid lines */}
          {[0, 20, 40, 60, 80, 100].map((y) => (
            <line
              key={y}
              x1="0" y1={y} x2="100" y2={y}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="0.5"
            />
          ))}
          {[0, 20, 40, 60, 80, 100].map((x) => (
            <line
              key={x}
              x1={x} y1="0" x2={x} y2="100"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
              <stop offset="50%" stopColor="rgba(52, 211, 153, 0.15)" />
              <stop offset="100%" stopColor="rgba(234, 179, 8, 0.02)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="innerGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Area fill with gradient */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#fillGradient)"
            opacity="0.7"
          />
          
          {/* Animated smooth curve */}
          <path
            d={curvePoints.join(' ')}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
            strokeDasharray="1000"
            strokeDashoffset="1000"
            className="animate-drawLine"
          />
          
          {/* Glowing data points */}
          {smoothPoints.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="url(#lineGradient)"
                opacity="0.2"
                className="animate-pulse"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#10b981"
                filter="url(#innerGlow)"
                className="animate-pulse"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative z-10 w-full">
        
        {/* ===== HERO HEADER ===== */}
        <div className={`border-b border-slate-800 transition-all duration-500 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold text-white flex items-center gap-3 mb-2">
                  Golf Dashboard
                  <span className="text-emerald-400">⛳</span>
                </h1>
                
                <p className="text-slate-400 text-sm">
                  Welcome back, {user?.name || "Player"} 👋
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSubscription}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isSubscribed 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  {isSubscribed ? "Active Plan" : "Subscribe"}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== OVERVIEW SECTION ===== */}
        <div className={`transition-all duration-500 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            {!isSubscribed ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Subscribe to access your dashboard features
                  </h2>
                  <button
                    onClick={toggleSubscription}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:from-emerald-600 hover:to-green-600 hover:scale-105 transition-all duration-400"
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-white mb-2">Overview</h2>
                  <p className="text-slate-400 text-sm">Your golf performance metrics</p>
                </div>
                
                {loadingScores ? (
                    <div className="flex items-center justify-center py-20">
                          <div className="text-slate-400">Loading scores...</div>
                            </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400 text-sm font-medium">Total Scores</p>
                    </div>
                    <p className="text-3xl font-semibold text-white">{totalScores}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400 text-sm font-medium">Average Score</p>
                    </div>
                    <p className="text-3xl font-semibold text-white">{averageScore}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400 text-sm font-medium">Best Score</p>
                    </div>
                    <p className="text-3xl font-semibold text-amber-400">{bestScore}</p>
                  </div>
                </div>
                              )}
                <div className="mt-10">
                  <ScoreChart />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== ACTIONS SECTION ===== */}
        <div className={`px-8 mb-12 transition-all duration-700 delay-300 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight">⚡ Actions</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            </div>
            
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 shadow-xl hover:shadow-green-500/30 transition-all duration-400 overflow-hidden hover:scale-102 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent rounded-2xl" />
              
              <div className="relative z-10">
                {!isSubscribed && (
                  <div className="text-red-400 text-sm mb-3">
                    Subscribe to enable scoring and draw features
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-400 text-red-300 rounded-lg">
                    {error}
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">
                  Add New Score
                </h3>

                <div className="flex gap-6 max-w-2xl">
                  <input
                    type="number"
                    className="flex-1 px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400 hover:border-green-400 transition-all duration-400 text-xl font-medium backdrop-blur-sm"
                    placeholder="Enter score"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    disabled={!isSubscribed}
                  />

                  <button
                    onClick={addScore}
                    disabled={loading || !newScore || !isSubscribed}
                    className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-2xl shadow-xl hover:from-emerald-600 hover:to-green-600 hover:scale-105 hover:shadow-green-400/50 transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed text-xl overflow-hidden active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </>
                      ) : (
                        "Add Score"
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  </button>
                </div>

                <div className="mt-6">
                  <label className="text-white text-sm font-medium mb-2 block">Select Charity</label>
                  <select
                    value={charity}
                    onChange={(e) => handleCharityChange(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400 hover:border-green-400 transition-all duration-400 backdrop-blur-sm"
                  >
                    <option value="" className="text-black">Select Charity</option>
                    <option value="Education Fund" className="text-black">Education Fund</option>
                    <option value="Healthcare Support" className="text-black">Healthcare Support</option>
                    <option value="Sports Development" className="text-black">Sports Development</option>
                  </select>
                  
                  {charity && (
                    <p className="mt-3 text-emerald-400 text-sm">
                      Supporting: {charity}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={runDraw}
                    disabled={isDrawing || !isSubscribed}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isDrawing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Running Draw...
                      </>
                    ) : (
                      <>
                        🎲 Run Monthly Draw
                      </>
                    )}
                  </button>
                </div>

                {isDrawing && (
                  <div className="flex gap-4 mb-6 justify-center">
                    {[1,2,3,4,5].map((_, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-white text-xl font-bold animate-spin-slow shadow-inner"
                      >
                        🎰
                      </div>
                    ))}
                  </div>
                )}

                {drawResult && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 mt-6 animate-slideUp">
                    {didWin && (
                      <div className="mb-4 p-4 rounded-xl bg-green-500/20 border border-green-400 text-green-300 font-semibold text-center">
                        🎉 Congratulations! You won this draw!
                      </div>
                    )}

                    <h2 className="text-xl text-white mb-4">
                      🎯 Draw Results
                    </h2>

                    <div className="flex gap-3 mb-4">
                      {drawResult?.numbers?.map((num, i) => (
                        <div
                          key={i}
                          className="w-14 h-14 flex items-center justify-center rounded-full 
                                     bg-gradient-to-r from-green-400 to-yellow-400 
                                     text-black font-bold text-lg 
                                     shadow-xl shadow-green-400/50 
                                     animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>

                    {drawResult?.results?.length > 0 ? (
                      drawResult?.results?.map((r, i) => (
                        <div
                          key={i}
                          className="p-3 bg-white/5 rounded-lg flex justify-between"
                        >
                          <span className="text-white">
                            User: {r.userId?.name || r.userId?.email || "Player"}
                          </span>
                          <span className="text-yellow-400">
                            {r.matchCount} Matches
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No winners this round</p>
                    )}
                  </div>
                )}

                {/* ===== DRAW HISTORY ===== */}
                {drawHistory?.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 mt-6">
                    <h3 className="text-xl text-white mb-4">
                      📜 Draw History
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {drawHistory?.map((draw, index) => (
                        <div key={index} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium">
                              {draw.month} {draw.year}
                            </span>
                            <span className="text-amber-400 text-sm">
                              {draw.results?.length || 0} Winners
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {draw?.numbers?.map((num, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold"
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {drawHistory?.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No draws yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== DATA SECTION ===== */}
        {isSubscribed && (
          <div className={`px-8 pb-12 transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="max-w-screen-2xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">📊 Data</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 shadow-xl hover:shadow-yellow-500/30 transition-all duration-400 overflow-hidden hover:scale-102 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-2xl" />
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">
                      🏆 Leaderboard
                    </h3>

                    {globalLeaderboard?.length > 0 ? (
                      <div className="space-y-3">
                        {globalLeaderboard.map((entry, index) => (
                          <div
                            key={entry._id}
                            className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-400 hover:scale-105 hover:-translate-y-1 hover:shadow-xl overflow-hidden ${
                              index === 0
                                ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-l-4 border-yellow-400 shadow-lg scale-105 animate-pulse shadow-yellow-400/50"
                                : index === 1
                                ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-l-4 border-gray-400"
                                : index === 2
                                ? "bg-gradient-to-r from-orange-400/20 to-orange-500/20 border-l-4 border-orange-400"
                                : "bg-white/5 border-l-4 border-transparent"
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                            
                            <div className="relative z-10 flex items-center gap-4 flex-1">
                              <span className="text-3xl w-12 text-center">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                              </span>
                              <span className={`text-white font-black ${index === 0 ? "text-3xl" : "text-2xl"}`}>
                                {entry.score}
                              </span>
                            </div>

                            <span className="text-gray-400 text-sm relative z-10">
                              {entry.userId?.name || entry.userId?.email || "Player"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-12 text-xl">
                        No scores yet — start playing ⛳
                      </p>
                    )}
                  </div>
                </div>

                {/* ===== ALL SCORES ===== */}
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 shadow-xl hover:shadow-emerald-500/30 transition-all duration-400 overflow-hidden hover:scale-102 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent rounded-2xl" />
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">
                      All Scores
                    </h3>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {scores.length > 0 ? (
                        scores.map((score) => (
                          <div
                            key={score._id}
                            className="group relative flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 hover:scale-105 hover:-translate-y-1 hover:shadow-lg transition-all duration-400 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                            
                            <span className="relative z-10 text-white font-bold text-xl">{score.score}</span>
                            <span className="relative z-10 text-gray-400 text-sm">
                              {new Date(score.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-12 text-xl">
                          No scores yet — start playing ⛳
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
          }

          @keyframes float-delayed {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-30px, -20px) rotate(-120deg); }
            66% { transform: translate(20px, 30px) rotate(-240deg); }
          }

          @keyframes shift {
            0%, 100% { opacity: 0.3; transform: translateX(0); }
            50% { opacity: 0.6; transform: translateX(10px); }
          }

          @keyframes drawLine {
            to { stroke-dashoffset: 0; }
          }

          .animate-slideUp {
            animation: slideUp 0.6s ease-out;
          }

          .animate-spin-slow {
            animation: spinSlow 1s linear infinite;
          }

          .animate-float {
            animation: float 20s ease-in-out infinite;
          }

          .animate-float-delayed {
            animation: float-delayed 25s ease-in-out infinite;
          }

          .animate-shift {
            animation: shift 8s ease-in-out infinite;
          }

          .animate-drawLine {
            animation: drawLine 2.5s ease-out forwards;
          }

          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
          .delay-300 { animation-delay: 300ms; }
          .delay-400 { animation-delay: 400ms; }
          .delay-500 { animation-delay: 500ms; }

          .hover\\:scale-102:hover {
            transform: scale(1.02);
          }

          .hover\\:scale-103:hover {
            transform: scale(1.03);
          }

          .hover\\:-translate-y-1:hover {
            transform: translateY(-0.25rem);
          }

          .hover\\:-translate-y-2:hover {
            transform: translateY(-0.5rem);
          }

          .group:hover .group-hover\\:opacity-100 {
            opacity: 1;
          }
        `}</style>
      </div>
    </div>
  );
}

export default Dashboard;