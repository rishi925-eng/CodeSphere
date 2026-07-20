import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { 
  Code2, Users, LogIn, LayoutDashboard, 
  Zap, Terminal, Sparkles, Rocket, ChevronRight, Cpu,
  Shield, Globe, GitBranch, Layers, Check, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Typing and execution simulation
  const [editorText, setEditorText] = useState('');
  const [simulationState, setSimulationState] = useState<'typing' | 'running' | 'done'>('typing');

  useEffect(() => {
    let index = 0;
    let timer: any;
    let interval: any;
    const code = `import { RGA } from "./RGA.js";\n\n// 1. Initialize RGA CRDT\nconst rga = new RGA("session");\n\n// 2. Commutative updates\nrga.applyRemote(insertOp1);\nconsole.log(rga.toString());`;
    
    function startTyping() {
      setSimulationState('typing');
      setEditorText('');
      index = 0;
      
      interval = setInterval(() => {
        if (index < code.length) {
          setEditorText(code.substring(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setSimulationState('running');
          timer = setTimeout(() => {
            setSimulationState('done');
            timer = setTimeout(() => {
              startTyping();
            }, 4000);
          }, 1800);
        }
      }, 20);
    }
    
    startTyping();
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const createRoom = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (!username.trim() && !user?.username) {
      alert('Please enter your name');
      return;
    }
    const newRoomId = uuidv4();
    const name = username.trim() || user?.username || 'Anonymous';
    navigate(`/room/${newRoomId}?username=${encodeURIComponent(name)}&role=interviewer`);
  };

  const joinRoom = () => {
    if (!username.trim() && !user?.username) {
      alert('Please enter your name');
      return;
    }
    
    if (!roomId.trim()) {
      alert('Please enter room ID');
      return;
    }
    
    const name = username.trim() || user?.username || 'Anonymous';
    navigate(`/room/${roomId}?username=${encodeURIComponent(name)}&role=candidate`);
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-[#f3f4f6] font-sans antialiased overflow-x-hidden relative selection:bg-blue-600/30 selection:text-blue-200 flex flex-col justify-between">
      
      {/* High-Fidelity Glow Ambient Backdrops */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vh] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[-5%] w-[40vw] h-[40vh] bg-gradient-to-br from-violet-600/15 via-purple-650/10 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vh] bg-gradient-to-tr from-emerald-600/10 via-teal-650/5 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Cyber Grid Mask Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col justify-start">
        {/* Floating Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-[#030712]/60 backdrop-blur-xl border-b border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <div 
              className="flex items-center space-x-3.5 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-blue-500/10 transition-transform duration-300 group-hover:scale-105">
                <Code2 className="h-5 w-5 text-white" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#030712] shadow-sm animate-pulse"></div>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                CodeSphere
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-5 py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl transition-all font-bold text-xs tracking-wider text-slate-200 uppercase"
                  >
                    <LayoutDashboard className="h-4 w-4 text-blue-400" />
                    <span>Dashboard</span>
                  </Link>
                  <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl shadow-inner">
                    <span className="text-xs text-slate-300">Hey, <span className="font-bold text-blue-400">{user?.username}</span>!</span>
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-500/10 font-bold text-xs tracking-wider uppercase"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Get Started</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative container mx-auto px-8 pt-44 pb-20 overflow-hidden z-10 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16 items-center w-full">
            {/* Left Text and Form */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2.5 px-4 py-1.5 bg-gradient-to-r from-blue-500/15 to-indigo-500/15 border border-blue-500/30 rounded-full mb-6 w-fit shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                <span className="text-[10px] text-blue-300 font-extrabold uppercase tracking-widest">Premium Collaborative Editor</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tighter text-white"
              >
                Real-Time Code <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Without Conflicts.
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm md:text-base text-slate-400 mb-8 leading-relaxed max-w-xl"
              >
                Conduct technical interviews on a secure, latency-optimized collaboration platform. Custom RGA CRDT guarantees commutative conflict-free typing, running alongside sandboxed execution containers.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2.5 items-center mb-8"
              >
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl border border-white/[0.05] transition-all">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-300">RGA Sync Mode</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl border border-white/[0.05] transition-all">
                  <Terminal className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-300">Isolated Run</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl border border-white/[0.05] transition-all">
                  <Zap className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-300">BullMQ Throttled</span>
                </div>
              </motion.div>

              {/* Input Card Container */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/[0.01] border border-white/[0.06] p-6 rounded-2xl max-w-lg shadow-2xl relative overflow-hidden backdrop-blur-md"
              >
                <div className="relative z-10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-white/[0.08] focus:border-blue-500/50 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-slate-500 font-semibold text-white shadow-inner"
                    />
                    
                    <AnimatePresence mode="wait">
                      {showJoin ? (
                        <motion.input
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          type="text"
                          placeholder="Enter Room ID"
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-900 border border-white/[0.08] focus:border-blue-500/50 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-slate-500 font-semibold text-white shadow-inner"
                        />
                      ) : (
                        <div className="flex items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-900/40 border border-white/[0.04] rounded-xl px-4 py-3 select-none">
                          ⚡ Ready to Host Session
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {showJoin ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={joinRoom}
                          className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-black rounded-xl shadow-lg flex items-center justify-center space-x-2 uppercase tracking-wider text-white"
                        >
                          <Users className="h-4 w-4" />
                          <span>Join Session</span>
                        </motion.button>
                        <button
                          onClick={() => setShowJoin(false)}
                          className="py-3 px-5 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-xs font-bold rounded-xl transition-all text-white"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px -8px rgba(59, 130, 246, 0.4)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={createRoom}
                          className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-black rounded-xl shadow-lg flex items-center justify-center space-x-2 uppercase tracking-wider text-white"
                        >
                          <Rocket className="h-4 w-4" />
                          <span>Create Room</span>
                          <ChevronRight className="h-4 w-4" />
                        </motion.button>
                        <button
                          onClick={() => setShowJoin(true)}
                          className="py-3 px-6 bg-slate-900 border border-white/[0.06] hover:bg-slate-800 text-xs font-bold rounded-xl transition-all text-slate-300 hover:text-white"
                        >
                          Join Existing
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right IDE View */}
            <div className="lg:col-span-5 hidden lg:block relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/[0.06] shadow-2xl bg-slate-950 overflow-hidden hover:border-slate-800 transition-all duration-300"
              >
                <div className="bg-slate-900/65 px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider">crdt_sync_engine.ts</span>
                  <div className={`flex items-center space-x-1 px-1.5 py-0.5 border rounded text-[9px] font-bold transition-all duration-300 ${
                    simulationState === 'typing' ? 'bg-blue-950/40 border-blue-500/20 text-blue-400' :
                    simulationState === 'running' ? 'bg-amber-950/40 border-amber-500/20 text-amber-400' :
                    'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      simulationState === 'typing' ? 'bg-blue-400 animate-pulse' :
                      simulationState === 'running' ? 'bg-amber-400 animate-spin' :
                      'bg-emerald-400 animate-ping'
                    }`} />
                    <span>
                      {simulationState === 'typing' && 'Typing...'}
                      {simulationState === 'running' && 'Running...'}
                      {simulationState === 'done' && 'Output Ready'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 font-mono text-[11px] leading-relaxed text-slate-350 bg-slate-950/60 min-h-[160px] relative select-none">
                  {editorText}
                  <span className="w-1.5 h-3.5 ml-0.5 bg-blue-400 inline-block animate-pulse" />
                  
                  <AnimatePresence>
                    {(simulationState === 'running' || simulationState === 'done') && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 pt-4 border-t border-white/[0.05]"
                      >
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Sandbox Output:</div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/[0.03]">
                          {simulationState === 'running' ? (
                            <span className="text-amber-400/90 animate-pulse">Initializing runner. Spawning 128M Docker micro-container...</span>
                          ) : (
                            <div className="space-y-1">
                              <div className="text-emerald-400 font-bold">stdout: "Hi!" synced clean</div>
                              <div className="text-[10px] text-slate-500">Exit code: 0 • Execution time: 12ms • Memory: 14.2MB</div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sandbox stats badge */}
                <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/[0.08] p-3 rounded-xl shadow-xl flex items-center space-x-2.5 max-w-[180px]">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Cpu className={`h-4 w-4 text-blue-400 ${simulationState === 'running' ? 'animate-spin' : ''}`} style={{ animationDuration: '1.5s' }} />
                  </div>
                  <div>
                    <div className="text-[8px] text-slate-400 font-bold uppercase">Sandbox Runtime</div>
                    <div className="text-[10px] font-bold text-white">Docker (128M limit)</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Showcase Grid */}
        <section className="relative container mx-auto px-8 py-16 z-10 max-w-7xl border-t border-slate-900/60">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-full mb-4">
              <Layers className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-blue-300 font-extrabold uppercase tracking-widest">Modern Suite</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Built for Scale & Security.
            </h2>
            <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">
              Everything you need to evaluate developers on-demand with absolute reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Code2, 
                title: 'RGA CRDT Live Sync', 
                desc: 'Commutative editing powered by Lamport timestamps. No text loss, cursor jumps, or syncing overrides.',
                color: 'from-blue-500 to-indigo-500' 
              },
              { 
                icon: Terminal, 
                title: 'Docker Sandbox Runner', 
                desc: 'Execution container spun up per request with 128MB RAM caps, 50% CPU quotas, and zero external network access.',
                color: 'from-emerald-500 to-teal-500' 
              },
              { 
                icon: Zap, 
                title: 'BullMQ Queue Throttling', 
                desc: 'High concurrency throttling using BullMQ + Redis to manage sandbox loads safely without crashing the engine.',
                color: 'from-amber-500 to-orange-500' 
              },
              { 
                icon: Video, 
                title: 'RTC Video Channels', 
                desc: 'Face-to-face evaluations with integrated low-latency video and audio stream communication panels.',
                color: 'from-purple-500 to-pink-500' 
              },
              { 
                icon: GitBranch, 
                title: 'Multi-Language Execution', 
                desc: 'Run JS, TS, Python, Java, C++, and Go instantly. Standard execution statistics shown upon completion.',
                color: 'from-indigo-500 to-purple-500' 
              },
              { 
                icon: Users, 
                title: 'Roster & chat tools', 
                desc: 'Interactive chat history, roster status cards, and collaborative tools directly adjacent to the editor.',
                color: 'from-rose-500 to-pink-500' 
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -6, borderColor: 'rgba(59,130,246,0.2)' }}
                className="bg-slate-900/10 border border-white/[0.04] hover:bg-slate-900/30 rounded-2xl p-8 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-6 group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className="h-full w-full text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">{feature.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Engineering Stats & Uptime showcase */}
        <section className="bg-slate-950/40 py-16 border-y border-slate-900/60 relative">
          <div className="container mx-auto px-8 max-w-5xl relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '<42ms', label: 'p99 Sync Latency' },
                { value: '99.9%', label: 'Sandbox Uptime' },
                { value: '120/min', label: 'Executions Processed' }
              ].map((stat, idx) => (
                <div key={idx} className="p-6 bg-slate-900/15 rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-colors duration-300">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits and Uptime Steps */}
        <section className="container mx-auto px-8 py-16 z-10 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Why Teams Choose <br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">CodeSphere.</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-lg">
                Empower your evaluation pipeline with a high-fidelity system designed for developers.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Zap, text: 'Lightning-fast synchronization with RGA CRDT sync' },
                  { icon: Shield, text: 'Docker sandboxed code runner isolation protection' },
                  { icon: Globe, text: 'Highly scalable architecture ready for enterprise scale' }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-4 bg-slate-900/20 rounded-xl border border-white/[0.02] hover:border-white/[0.06] transition-colors duration-305">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Check className="h-4.5 w-4.5 text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/5 to-indigo-600/5 border border-white/[0.06] p-8 rounded-3xl backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-6">Performance Ratios</h3>
              <div className="space-y-6">
                {[
                  { label: 'User Satisfaction', value: 98 },
                  { label: 'Queue Response Efficiency', value: 94 },
                  { label: 'Latency Consistency', value: 92 }
                ].map((metric, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-300 font-bold">{metric.label}</span>
                      <span className="text-blue-400 font-extrabold">{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${metric.value}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#020617] py-8 text-slate-500 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Info Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/10">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-black tracking-tighter text-white">CodeSphere</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px] max-w-xs">
                Ultra-low latency real-time collaborative workspace powered by RGA CRDT sync and Docker sandbox environments.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-200 mb-4">Workspace</h4>
              <ul className="space-y-2.5 text-[11px] text-slate-400">
                <li><Link to="/auth" className="hover:text-blue-400 transition-colors">Start Session</Link></li>
                <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Active Rooms</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Sandbox Status</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-200 mb-4">Core Engine</h4>
              <ul className="space-y-2.5 text-[11px] text-slate-400">
                <li><span className="text-slate-400 font-semibold">RGA CRDT Sync:</span> <span className="text-blue-400 font-bold">&lt;42ms p99</span></li>
                <li><span className="text-slate-400 font-semibold">Sandbox:</span> <span className="text-emerald-400 font-bold">128M Docker</span></li>
                <li><span className="text-slate-400 font-semibold">Queue limit:</span> <span className="text-amber-400 font-bold">BullMQ Redis</span></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-200 mb-4">Legal</h4>
              <ul className="space-y-2.5 text-[11px] text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security Rules</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom segment */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px]">
            <p>© 2026 CodeSphere. All rights reserved. Built for professional developer evaluations.</p>
            <div className="flex space-x-4 text-slate-400 font-medium">
              <span>Status: <span className="text-emerald-400 font-bold">All Systems Operational</span></span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Home;
