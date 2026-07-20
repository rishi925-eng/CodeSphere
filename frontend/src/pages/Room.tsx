// ============================================================================
// Room — Main collaboration page with CRDT sync
// ============================================================================
// Updated to use CRDT (RGA) operations for conflict-free real-time editing.
//
// DATA FLOW:
// 1. User joins room → server sends 'crdt-state' (serialized RGA)
// 2. Client deserializes into local RGA instance
// 3. User types → Monaco fires content change → CodeEditor converts to
//    CRDT ops → Room emits 'crdt-operations-batch' via Socket.IO
// 4. Server broadcasts ops to other clients → Room receives
//    'crdt-operation' → applies to local RGA → updates Monaco
// 5. All clients converge to the same document state. Always.
// ============================================================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import CodeEditor from '../components/CodeEditor';
import VideoChat from '../components/VideoChat';
import Participants from '../components/Participants';
import OutputPanel from '../components/OutputPanel';
import Chat from '../components/Chat';
import { Code2, Users as UsersIcon, Video, Play, Copy, Check, MessageCircle, LogOut } from 'lucide-react';
import { codeAPI } from '../services/api';
import { RGA } from '../crdt/RGA';
import type { CRDTOperation, SerializedRGAState } from '../crdt/types';
import { v4 as uuidv4 } from 'uuid';

interface Participant {
  socketId: string;
  username: string;
  userId?: string;
  role: 'interviewer' | 'candidate' | 'observer';
}

interface Message {
  userId?: string;
  username: string;
  message: string;
  timestamp: Date;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' }
];

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username') || 'Anonymous';
  const role = (searchParams.get('role') as 'interviewer' | 'candidate' | 'observer') || 'candidate';
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('// Start coding here...\n');
  const [language, setLanguage] = useState('javascript');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'queued' | 'running' | 'completed' | 'failed'>('idle');
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [memoryUsed, setMemoryUsed] = useState<number | undefined>();

  const codeRef = useRef(code);
  const languageRef = useRef(language);
  const editorRef = useRef<any>(null);

  // ========================================================================
  // CRDT State
  // ========================================================================
  // Each browser tab gets a unique client ID for the RGA.
  // The RGA instance is created on mount and initialized when we receive
  // the room's CRDT state from the server.
  // ========================================================================
  const clientIdRef = useRef<string>(uuidv4());
  const [rga, setRga] = useState<RGA | null>(null);
  const rgaRef = useRef<RGA | null>(null);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    rgaRef.current = rga;
  }, [rga]);

  // ========================================================================
  // Socket Event Handlers
  // ========================================================================
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room with user info
    socket.emit('join-room', { 
      roomId, 
      username, 
      userId: user?._id,
      role 
    });

    // Listen for room state (initial sync — includes code as string)
    socket.on('room-state', ({ code: roomCode, language: roomLang, participants: roomParticipants }) => {
      setCode(roomCode || '// Start coding here...\n');
      setLanguage(roomLang || 'javascript');
      setParticipants(roomParticipants || []);
    });

    // Listen for CRDT state (full RGA — sent to new joiners)
    socket.on('crdt-state', ({ state }: { state: SerializedRGAState }) => {
      const newRga = new RGA(clientIdRef.current);
      newRga.deserialize(state);
      setRga(newRga);
      rgaRef.current = newRga;
      // Update code state from RGA
      setCode(newRga.toString());
    });

    // Listen for individual CRDT operations from other clients
    socket.on('crdt-operation', ({ operation }: { operation: CRDTOperation; fromSocketId: string }) => {
      const currentRga = rgaRef.current;
      if (!currentRga) return;

      // Apply to local RGA
      currentRga.applyRemote(operation);

      // Update Monaco editor via the exposed method
      if (editorRef.current?.__applyRemoteOperation) {
        // Already applied to RGA above, just update Monaco
        const editor = editorRef.current;
        const model = editor.getModel?.();
        if (model) {
          const newText = currentRga.toString();
          const currentText = model.getValue();
          if (newText !== currentText) {
            const position = editor.getPosition?.();
            const selections = editor.getSelections?.();
            // Use a flag or separate method to prevent feedback loop
            model.setValue(newText);
            if (position) editor.setPosition(position);
            if (selections) editor.setSelections(selections);
          }
        }
      }

      // Update code state
      setCode(currentRga.toString());
    });

    // Listen for batch CRDT operations
    socket.on('crdt-operations-batch', ({ operations }: { operations: CRDTOperation[]; fromSocketId: string }) => {
      const currentRga = rgaRef.current;
      if (!currentRga) return;

      // Apply all to local RGA
      currentRga.applyRemoteBatch(operations);

      // Update Monaco
      if (editorRef.current) {
        const editor = editorRef.current;
        const model = editor.getModel?.();
        if (model) {
          const newText = currentRga.toString();
          const currentText = model.getValue();
          if (newText !== currentText) {
            const position = editor.getPosition?.();
            const selections = editor.getSelections?.();
            model.setValue(newText);
            if (position) editor.setPosition(position);
            if (selections) editor.setSelections(selections);
          }
        }
      }

      setCode(currentRga.toString());
    });

    // Legacy: Listen for code updates (from non-CRDT clients)
    socket.on('code-update', ({ code: newCode, language: newLang }: any) => {
      if (newCode !== undefined) setCode(newCode);
      if (newLang) setLanguage(newLang);
    });

    // Listen for new users (send sync to them)
    socket.on('user-joined', ({ socketId }) => {
      socket.emit('sync-code', { socketId, code: codeRef.current, language: languageRef.current });
    });

    // Listen for language updates
    socket.on('language-update', (newLang: string) => {
      setLanguage(newLang);
    });

    // Listen for chat messages
    socket.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for user left
    socket.on('user-left', ({ socketId }: any) => {
      setParticipants(prev => prev.filter(p => p.socketId !== socketId));
    });

    // Listen for participants update
    socket.on('participants-update', (updatedParticipants: Participant[]) => {
      setParticipants(updatedParticipants);
    });

    return () => {
      socket.off('room-state');
      socket.off('crdt-state');
      socket.off('crdt-operation');
      socket.off('crdt-operations-batch');
      socket.off('user-joined');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('chat-message');
      socket.off('user-left');
      socket.off('participants-update');
      
      // Leave room on unmount
      socket.emit('leave-room', { roomId });
    };
  }, [socket, roomId, username, user, role]);

  // ========================================================================
  // CRDT Operation Handler
  // ========================================================================
  // Called by CodeEditor when the user types. Receives CRDT operations
  // and emits them to the server for broadcast to other clients.
  // ========================================================================
  const handleCRDTOperations = useCallback((ops: CRDTOperation[]) => {
    if (!socket || !roomId || ops.length === 0) return;

    // Send as batch for efficiency (fewer socket messages)
    if (ops.length === 1) {
      socket.emit('crdt-operation', { roomId, operation: ops[0] });
    } else {
      socket.emit('crdt-operations-batch', { roomId, operations: ops });
    }
  }, [socket, roomId]);

  // Legacy: handle code change for non-CRDT fallback
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // In CRDT mode, operations are already sent via handleCRDTOperations.
    // This is only used for updating local state.
    if (!rga && socket && roomId) {
      // Legacy fallback: send full code
      socket.emit('code-change', { 
        roomId, 
        code: newCode, 
        userId: user?._id,
        language 
      });
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (socket && roomId) {
      socket.emit('language-change', { roomId, language: newLang });
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setExecutionStatus('running');
    setOutput('Running code...\n');
    setExecutionTime(undefined);
    setMemoryUsed(undefined);

    try {
      const response = await codeAPI.executeCode({
        language,
        code
      });

      const result = response.data.data;
      
      if (result.success) {
        setOutput(result.output || 'No output');
        setExecutionStatus('completed');
      } else {
        setOutput(`Error:\n${result.error || 'Execution failed'}`);
        setExecutionStatus('failed');
      }

      // Set execution metrics if available
      if (result.executionTime) setExecutionTime(result.executionTime);
      if (result.memory) setMemoryUsed(result.memory);
    } catch (error: any) {
      setOutput(`Error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      setExecutionStatus('failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendMessage = (message: string) => {
    if (socket && roomId) {
      socket.emit('chat-message', {
        roomId,
        userId: user?._id,
        username,
        message
      });
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const leaveRoom = () => {
    if (socket && roomId) {
      socket.emit('leave-room', { roomId });
    }
    navigate('/dashboard');
  };



  return (
    <div className="h-screen flex flex-col bg-dark-900 text-white">
      {/* Header */}
      <header className="bg-dark-800/90 backdrop-blur-sm border-b border-dark-700 px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-7 w-7 text-primary-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">CodeSphere</span>
            </div>
            <div className="flex items-center space-x-2 bg-dark-700 px-4 py-2 rounded-lg border border-dark-600 hover:border-primary-500/50 transition-all group">
              <span className="text-sm text-gray-400">Room:</span>
              <span className="text-sm font-mono font-medium">{roomId?.slice(0, 8)}...</span>
              <button
                onClick={copyRoomId}
                className="text-gray-400 hover:text-primary-400 transition-colors hover:scale-110"
                title="Copy room ID"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-dark-700 border border-dark-700 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>

            {/* CRDT Status Indicator */}
            {rga && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">CRDT Sync</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg transition-all font-medium shadow-lg hover:shadow-green-500/50 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              <Play className="h-4 w-4" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                showChat 
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/50' 
                  : 'bg-dark-700 hover:bg-dark-600 border border-dark-600'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                showVideo 
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/50' 
                  : 'bg-dark-700 hover:bg-dark-600 border border-dark-600'
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Video</span>
            </button>

            <div className="flex items-center space-x-2 px-4 py-2 bg-dark-700 rounded-lg border border-dark-600">
              <UsersIcon className="h-4 w-4 text-primary-400" />
              <span className="text-sm font-semibold">{participants.length + 1}</span>
            </div>

            <button
              onClick={leaveRoom}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95"
              title="Leave Room"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Participants */}
        <aside className="w-64 bg-dark-800 border-r border-dark-700 overflow-y-auto">
          <Participants username={username} participants={participants} currentRole={role} />
        </aside>

        {/* Center - Code Editor */}
        <main className="flex-1 flex flex-col">
          <CodeEditor 
            code={code} 
            language={language} 
            onChange={handleCodeChange}
            rga={rga}
            onCRDTOperations={handleCRDTOperations}
          />
          <OutputPanel 
            output={output}
            status={executionStatus}
            executionTime={executionTime}
            memoryUsed={memoryUsed}
          />
        </main>

        {/* Right Side - Chat */}
        {showChat && (
          <aside className="w-80 bg-dark-800 border-l border-dark-700">
            <Chat messages={messages} onSendMessage={handleSendMessage} currentUsername={username} />
          </aside>
        )}

        {/* Right Side - Video Chat */}
        {showVideo && (
          <aside className="w-80 bg-dark-800 border-l border-dark-700">
            <VideoChat roomId={roomId || ''} username={username} />
          </aside>
        )}
      </div>
    </div>
  );
};

export default Room;
