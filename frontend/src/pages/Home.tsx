import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { 
  Code2, Users, Video, Play, ArrowRight, LogIn, LayoutDashboard, 
  Zap, Shield, Globe, Clock, MessageSquare, Terminal,
  GitBranch, Sparkles, TrendingUp, Award, Rocket, Star, Target,
  Check, ChevronRight, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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
    <div className="min-h-screen bg-linear-to-br from-dark-900 via-dark-800 to-dark-900 text-white overflow-x-hidden">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="relative">
                <Code2 className="h-8 w-8 text-primary-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                CodeSphere
              </span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-5 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-all hover:scale-105"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30 rounded-lg">
                    <span className="text-sm text-gray-300">Hey, <span className="font-semibold text-primary-400">{user?.username}</span>! 👋</span>
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center space-x-2 px-6 py-2.5 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg transition-all hover:scale-105 shadow-lg shadow-primary-500/30 font-medium"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Get Started</span>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative container mx-auto px-6 pt-32 pb-20 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600/10 border border-primary-500/30 rounded-full mb-6"
              >
                <Sparkles className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-primary-300 font-medium">The Future of Remote Interviews</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              >
                Conduct <span className="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Technical Interviews</span> Like Never Before
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-400 mb-6 leading-relaxed"
              >
                Collaborate in real-time with HD video, live code editing, instant execution, and seamless communication—all in one powerful platform.
              </motion.p>

              {/* Trust indicators */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 items-center mb-8 justify-center lg:justify-start"
              >
                <div className="flex items-center space-x-2 px-4 py-2 bg-dark-800/50 rounded-full border border-dark-700">
                  <Users className="h-4 w-4 text-primary-400" />
                  <span className="text-sm text-gray-300"><span className="font-bold text-white">50K+</span> Users</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-dark-800/50 rounded-full border border-dark-700">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-300"><span className="font-bold text-white">4.9/5</span> Rating</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-dark-800/50 rounded-full border border-dark-700">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300"><span className="font-bold text-white">99.9%</span> Uptime</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 60px -15px rgba(59, 130, 246, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createRoom}
                  className="group px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold transition-all shadow-2xl shadow-blue-500/50 flex items-center space-x-2"
                >
                  <Rocket className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  <span>Start Interviewing</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowJoin(true)}
                  className="group px-8 py-4 bg-dark-800/50 hover:bg-dark-700 backdrop-blur-sm border-2 border-dark-600 hover:border-primary-500/50 rounded-xl font-semibold transition-all flex items-center space-x-2"
                >
                  <Users className="h-5 w-5" />
                  <span>Join Room</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden border border-dark-700 shadow-2xl hover:shadow-primary-500/20 transition-shadow duration-500">
                <div className="bg-dark-800 p-4 border-b border-dark-700 flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-gray-400 ml-4">interview-room.tsx</span>
                </div>
                <div className="bg-dark-900 p-6">
                  <pre className="text-sm text-gray-300 font-mono">
                    <code className="text-blue-400">const</code> <code className="text-purple-400">interview</code> = {`{\n`}
                    <code className="text-gray-500">  // Real-time collaboration</code>{`\n`}
                    <code>  collaborators: </code><code className="text-green-400">[👨‍💻, 👩‍💻, 👨‍💼]</code>,{`\n`}
                    <code>  videoChat: </code><code className="text-yellow-400">true</code>,{`\n`}
                    <code>  codeExecution: </code><code className="text-yellow-400">instant</code>,{`\n`}
                    <code>  languages: </code><code className="text-green-400">['JS', 'Python', 'Java']</code>{`\n`}
                    {`}`}
                  </pre>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Showcase */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: '50K+', label: 'Active Users', color: 'from-blue-500 to-cyan-500' },
              { icon: Target, value: '100K+', label: 'Interviews', color: 'from-purple-500 to-pink-500' },
              { icon: Zap, value: '99.9%', label: 'Uptime', color: 'from-green-500 to-emerald-500' },
              { icon: Star, value: '4.9/5', label: 'Rating', color: 'from-yellow-500 to-orange-500' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group"
              >
                <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6 hover:border-primary-500/50 transition-all">
                  <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${stat.color} p-2.5 mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-full w-full text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600/10 border border-primary-500/30 rounded-full mb-4">
              <Layers className="h-4 w-4 text-primary-400" />
              <span className="text-sm text-primary-300 font-medium">Comprehensive Platform</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need for successful technical interviews, all in one platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Code2, 
                title: 'Real-time Code Editor', 
                desc: 'Collaborate seamlessly with Monaco editor, syntax highlighting, and instant sync across all participants.',
                color: 'from-blue-500 to-cyan-500' 
              },
              { 
                icon: Video, 
                title: 'HD Video Chat', 
                desc: 'Crystal clear video and audio communication for face-to-face interactions during interviews.',
                color: 'from-purple-500 to-pink-500' 
              },
              { 
                icon: Play, 
                title: 'Instant Code Execution', 
                desc: 'Run code in multiple languages and see results immediately without leaving the platform.',
                color: 'from-green-500 to-emerald-500' 
              },
              { 
                icon: MessageSquare, 
                title: 'Live Chat', 
                desc: 'Text-based communication for quick questions, code snippets, and resource sharing.',
                color: 'from-yellow-500 to-orange-500' 
              },
              { 
                icon: Users, 
                title: 'Multi-participant Support', 
                desc: 'Support for interviewers, candidates, and observers with role-based access control.',
                color: 'from-red-500 to-pink-500' 
              },
              { 
                icon: GitBranch, 
                title: 'Multiple Languages', 
                desc: 'Support for JavaScript, Python, Java, C++, Go, and TypeScript with more coming soon.',
                color: 'from-indigo-500 to-purple-500' 
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-8 hover:border-primary-500/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-primary-500/20 group overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className={`h-14 w-14 rounded-xl bg-linear-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                    <feature.icon className="h-full w-full text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                  <div className="mt-4 flex items-center text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Learn more</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative container mx-auto px-6 py-20 bg-dark-800/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600/10 border border-primary-500/30 rounded-full mb-4">
              <Rocket className="h-4 w-4 text-primary-400" />
              <span className="text-sm text-primary-300 font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get started in seconds with our simple three-step process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create or Join Room',
                desc: 'Start a new interview room or join an existing one using a room ID',
                icon: Rocket
              },
              {
                step: '02',
                title: 'Collaborate & Code',
                desc: 'Write code together in real-time with video chat and messaging',
                icon: Code2
              },
              {
                step: '03',
                title: 'Execute & Evaluate',
                desc: 'Run code instantly and assess candidates based on their performance',
                icon: TrendingUp
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, type: 'spring', stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="group bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-8 hover:border-primary-500/50 transition-all hover:shadow-xl hover:shadow-primary-500/10">
                  <div className="text-6xl font-bold text-primary-500/20 group-hover:text-primary-500/30 transition-colors mb-4">{step.step}</div>
                  <div className="h-12 w-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                    <step.icon className="h-7 w-7 text-primary-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary-400 transition-colors">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-primary-500/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Choose <span className="bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">CodeSphere</span>?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                The ultimate platform for conducting technical interviews that candidates and interviewers love.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Zap, text: 'Lightning-fast performance with zero lag' },
                  { icon: Shield, text: 'Secure and private interview rooms' },
                  { icon: Globe, text: 'Access from anywhere in the world' },
                  { icon: Clock, text: 'Save hours with streamlined workflows' },
                  { icon: Award, text: 'Industry-leading code editor experience' },
                  { icon: Terminal, text: 'Support for 6+ programming languages' }
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                    className="group flex items-center space-x-4 p-4 bg-dark-800/30 rounded-xl hover:bg-dark-800/60 transition-all cursor-pointer border border-transparent hover:border-primary-500/30"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-primary-600 to-primary-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{benefit.text}</span>
                    <ChevronRight className="h-5 w-5 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-linear-to-br from-primary-600/20 to-purple-600/20 rounded-2xl p-8 border border-primary-500/30">
                <div className="space-y-6">
                  {[
                    { label: 'User Satisfaction', value: 98 },
                    { label: 'Interview Success Rate', value: 94 },
                    { label: 'Time Saved', value: 87 }
                  ].map((metric, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300 font-medium">{metric.label}</span>
                        <span className="text-primary-400 font-bold">{metric.value}%</span>
                      </div>
                      <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${metric.value}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + idx * 0.2, duration: 1 }}
                          className="h-full bg-linear-to-r from-primary-500 to-purple-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative container mx-auto px-6 py-20 overflow-hidden"
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-linear-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30 rounded-3xl p-12 text-center backdrop-blur-sm overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600/20 border border-primary-500/30 rounded-full mb-6"
              >
                <Sparkles className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-primary-300 font-medium">Start Your Journey</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Transform</span> Your Interviews?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of companies already using CodeSphere to find the best talent
              </p>

            {showJoin ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-md mx-auto space-y-4"
              >
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-dark-600 transition-all"
                />
                <input
                  type="text"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-dark-600 transition-all"
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={joinRoom}
                    className="flex-1 px-6 py-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    Join Room
                  </motion.button>
                  <button
                    onClick={() => setShowJoin(false)}
                    className="px-6 py-4 bg-dark-700 hover:bg-dark-600 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="max-w-md mx-auto mb-6">
                  <input
                    type="text"
                    placeholder="Enter your name to get started"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-4 bg-dark-700 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-dark-600 transition-all text-center"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 60px -15px rgba(59, 130, 246, 0.6)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={createRoom}
                    className="group px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold transition-all shadow-2xl shadow-blue-500/50 flex items-center justify-center space-x-2"
                  >
                    <Rocket className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span>Create Interview Room</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowJoin(true)}
                    className="group px-8 py-4 bg-dark-800/80 hover:bg-dark-700 backdrop-blur-sm border-2 border-dark-600 hover:border-primary-500/50 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Join Existing Room</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-dark-700 bg-dark-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Code2 className="h-6 w-6 text-primary-500" />
                <span className="text-xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  CodeSphere
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The modern platform for technical interviews and collaborative coding.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-dark-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2026 CodeSphere. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
