import { useEffect, useRef, useState } from 'react';
import { Video as VideoIcon, VideoOff, Mic, MicOff } from 'lucide-react';

interface VideoChatProps {
  roomId: string;
  username: string;
}

const VideoChat = ({ roomId: _roomId, username }: VideoChatProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    startLocalStream();
    return () => {
      stopLocalStream();
    };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setLocalStream(stream);
      setError('');
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone');
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-300">Video Chat</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Local Video */}
      <div className="relative bg-dark-700 rounded-lg overflow-hidden mb-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full aspect-video object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-dark-900/80 px-2 py-1 rounded text-xs">
          {username} (You)
        </div>
        {!isVideoOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-700">
            <VideoOff className="h-12 w-12 text-gray-500" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={toggleVideo}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            isVideoOn
              ? 'bg-dark-700 hover:bg-dark-600'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isVideoOn ? <VideoIcon className="h-5 w-5 mx-auto" /> : <VideoOff className="h-5 w-5 mx-auto" />}
        </button>
        <button
          onClick={toggleAudio}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            isAudioOn
              ? 'bg-dark-700 hover:bg-dark-600'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isAudioOn ? <Mic className="h-5 w-5 mx-auto" /> : <MicOff className="h-5 w-5 mx-auto" />}
        </button>
      </div>

      {/* Remote Videos (placeholder for WebRTC implementation) */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        {/* In a full implementation, remote participant videos would appear here */}
        Video chat ready
      </div>
    </div>
  );
};

export default VideoChat;
