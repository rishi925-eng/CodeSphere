import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomAPI } from '../services/api';
import { Code2, Plus, Users, Clock, Play, LogOut, User as UserIcon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Room {
  _id: string;
  roomId: string;
  name: string;
  language: string;
  status: string;
  participants: any[];
  createdAt: string;
}

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats] = useState(user?.stats || {
    roomsCreated: 0,
    roomsJoined: 0,
    interviewsConducted: 0,
    interviewsTaken: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    language: 'javascript',
    role: 'interviewer'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadUserRooms();
  }, [isAuthenticated]);

  const loadUserRooms = async () => {
    try {
      const response = await roomAPI.getUserRooms();
      setRooms(response.data.data.rooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQuickRoom = async () => {
    try {
      const response = await roomAPI.createRoom({
        name: newRoom.name || 'Quick Interview Room',
        language: newRoom.language,
        settings: {
          allowCodeExecution: true,
          allowVideoChat: true
        }
      });

      const room = response.data.data.room;
      navigate(`/room/${room.roomId}?username=${user?.username || 'Anonymous'}&role=${newRoom.role}`);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const joinRoom = (roomId: string) => {
    navigate(`/room/${roomId}?username=${user?.username || 'Anonymous'}&role=candidate`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
      {/* Header */}
      <nav className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                CodeSphere
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-dark-700 rounded-lg">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Rooms Created', value: stats.roomsCreated || 0, icon: Plus, color: 'text-blue-500' },
            { label: 'Rooms Joined', value: stats.roomsJoined || 0, icon: Users, color: 'text-green-500' },
            { label: 'Interviews Conducted', value: stats.interviewsConducted || 0, icon: TrendingUp, color: 'text-purple-500' },
            { label: 'Interviews Taken', value: stats.interviewsTaken || 0, icon: Play, color: 'text-orange-500' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Create Room Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Room</span>
          </button>
        </div>

        {/* Rooms List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Rooms</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 bg-dark-800/50 rounded-xl border border-dark-700">
              <Code2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No rooms yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Create Your First Room
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors cursor-pointer"
                  onClick={() => joinRoom(room.roomId)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{room.name}</h3>
                      <span className="text-xs px-2 py-1 bg-primary-600 rounded-full">
                        {room.language}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      room.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                      {room.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{room.participants.length} participants</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-2xl p-8 max-w-md w-full border border-dark-700"
          >
            <h3 className="text-2xl font-bold mb-6">Create New Room</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Room Name</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Interview Room"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={newRoom.language}
                  onChange={(e) => setNewRoom({ ...newRoom, language: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Role</label>
                <select
                  value={newRoom.role}
                  onChange={(e) => setNewRoom({ ...newRoom, role: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="interviewer">Interviewer</option>
                  <option value="candidate">Candidate</option>
                  <option value="observer">Observer</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={createQuickRoom}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all"
              >
                Create Room
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
