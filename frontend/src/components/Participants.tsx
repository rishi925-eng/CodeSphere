interface Participant {
  socketId: string;
  username: string;
  userId?: string;
  role: 'interviewer' | 'candidate' | 'observer';
}

interface ParticipantsProps {
  username: string;
  participants: Participant[];
  currentRole: 'interviewer' | 'candidate' | 'observer';
}

const getRoleBadge = (role: string) => {
  const badges = {
    interviewer: { color: 'bg-purple-500', text: 'Interviewer' },
    candidate: { color: 'bg-blue-500', text: 'Candidate' },
    observer: { color: 'bg-gray-500', text: 'Observer' }
  };
  return badges[role as keyof typeof badges] || badges.observer;
};

const Participants = ({ username, participants, currentRole }: ParticipantsProps) => {
  const badge = getRoleBadge(currentRole);
  // Filter out current user from participants list to avoid duplication
  const otherParticipants = participants.filter(p => p.username !== username);
  const totalUsers = participants.length;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">Participants</h3>
        <span className="text-xs px-2.5 py-1 bg-primary-600 rounded-full font-medium">{totalUsers}</span>
      </div>
      <div className="space-y-2.5">
        {/* Current user */}
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-dark-700 to-dark-700/50 rounded-lg border border-primary-500/30 shadow-lg shadow-primary-500/10">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-primary-500/50">
            <span className="text-sm font-bold">{username.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{username}</div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-green-400 font-medium flex items-center">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                You
              </span>
              <span className={`text-xs px-2 py-0.5 ${badge.color} rounded-full font-medium`}>
                {badge.text}
              </span>
            </div>
          </div>
        </div>

        {/* Other participants */}
        {otherParticipants.map((participant, idx) => {
          const participantBadge = getRoleBadge(participant.role);
          const colors = [
            'from-pink-500 to-orange-500',
            'from-green-500 to-teal-500',
            'from-yellow-500 to-red-500',
            'from-indigo-500 to-purple-500'
          ];
          return (
            <div key={participant.socketId} className="flex items-center space-x-3 p-3 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-all hover:scale-[1.02] cursor-pointer">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center shadow-md`}>
                <span className="text-sm font-bold">{participant.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{participant.username}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-green-400 font-medium flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    Online
                  </span>
                  <span className={`text-xs px-2 py-0.5 ${participantBadge.color} rounded-full font-medium`}>
                    {participantBadge.text}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Participants;
