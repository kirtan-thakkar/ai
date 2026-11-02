import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { watchPartyApi } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { 
  Users, 
  Swords, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  Sparkles, 
  Flame, 
  Copy, 
  Check, 
  MessageSquare, 
  HelpCircle, 
  Film, 
  BarChart3, 
  Radio, 
  Share2,
  Tv,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
}

export const WatchPartyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlRoomCode = searchParams.get('room');
  const { user, isGuest } = useAuth();

  // Room state
  const [room, setRoom] = useState<any>(null);
  const [inputCode, setInputCode] = useState(urlRoomCode || '');
  const [loading, setLoading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'adversarial_minimax' | 'collaborative_fairness'>('adversarial_minimax');

  // Chat & Reactions
  const [chatInput, setChatInput] = useState('');
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [activeTab, setActiveTab] = useState<'copilot' | 'chat'>('copilot');

  // Video playback
  const [localPlaying, setLocalPlaying] = useState(false);
  const [localTime, setLocalTime] = useState(0);

  const isHost = room ? (room.hostUserId === user?.id || room.members?.[0]?.userId === user?.id) : true;
  const currentMember = room?.members?.find((m: any) => m.userId === user?.id);

  // Poll room state every 1.5 seconds when active
  useEffect(() => {
    if (!room?.code) return;

    const interval = setInterval(async () => {
      try {
        const res = await watchPartyApi.get(room.code);
        if (res.data) {
          setRoom((prev: any) => {
            // Check for new reactions
            const oldChatLen = prev?.chat?.length || 0;
            const newChat = res.data.chat || [];
            if (newChat.length > oldChatLen) {
              const latest = newChat[newChat.length - 1];
              if (latest.reaction) {
                triggerFloatingReaction(latest.reaction, latest.senderName);
              }
            }
            return res.data;
          });

          // Sync local playback state from room
          if (res.data.playback) {
            setLocalPlaying(res.data.playback.isPlaying);
            setLocalTime(res.data.playback.currentTime || 0);
          }
        }
      } catch (err) {
        console.error('Room poll error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [room?.code]);

  // Initial load from URL room query
  useEffect(() => {
    if (urlRoomCode && (!room || room.code !== urlRoomCode)) {
      handleJoinRoom(urlRoomCode);
    }
  }, [urlRoomCode]);

  const triggerFloatingReaction = (emoji: string, senderName: string) => {
    const id = `react_${Date.now()}_${Math.random()}`;
    setFloatingReactions(prev => [...prev, { id, emoji, senderName }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2800);
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const res = await watchPartyApi.create();
      setRoom(res.data);
      setSearchParams({ room: res.data.code });
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create watch party room. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (codeToJoin?: string) => {
    const code = (codeToJoin || inputCode).trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    try {
      const res = await watchPartyApi.join(code);
      setRoom(res.data);
      setSearchParams({ room: res.data.code });
    } catch (err: any) {
      console.error('Failed to join room:', err);
      alert(err.response?.data?.error || 'Room not found. Please check code.');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdatePreferences = async (updates: any) => {
    if (!room?.code) return;
    try {
      const res = await watchPartyApi.updatePreferences(room.code, updates);
      if (res.data?.room) {
        setRoom(res.data.room);
      }
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  const handleRunConsensus = async () => {
    if (!room?.code) return;
    setRecommending(true);
    try {
      const res = await watchPartyApi.recommend(room.code, mode);
      setRoom((prev: any) => ({ ...prev, recommendations: res.data }));
    } catch (err) {
      console.error('Consensus recommendation failed:', err);
      alert('Failed to compute compromise. Check AI service.');
    } finally {
      setRecommending(false);
    }
  };

  const handleSelectMovieForTheater = async (movie: any) => {
    if (!room?.code) return;
    try {
      const res = await watchPartyApi.selectMovie(room.code, movie);
      setRoom(res.data);
    } catch (err) {
      console.error('Failed to select movie:', err);
    }
  };

  const handleTogglePlay = async () => {
    if (!room?.code) return;
    const newPlaying = !localPlaying;
    setLocalPlaying(newPlaying);
    try {
      await watchPartyApi.syncPlayback(room.code, {
        isPlaying: newPlaying,
        currentTime: localTime
      });
    } catch (err) {
      console.error('Sync playback failed:', err);
    }
  };

  const handleSeek = async (newTime: number) => {
    if (!room?.code) return;
    setLocalTime(newTime);
    try {
      await watchPartyApi.syncPlayback(room.code, {
        isPlaying: localPlaying,
        currentTime: newTime
      });
    } catch (err) {
      console.error('Seek sync failed:', err);
    }
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !room?.code) return;
    const text = chatInput.trim();
    setChatInput('');
    try {
      await watchPartyApi.sendChat(room.code, { text });
    } catch (err) {
      console.error('Failed to send chat:', err);
    }
  };

  const handleSendReaction = async (emoji: string) => {
    if (!room?.code) return;
    triggerFloatingReaction(emoji, user?.name || 'You');
    try {
      await watchPartyApi.sendChat(room.code, { reaction: emoji });
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const handleVotePoll = async (optionIndex: number) => {
    if (!room?.code) return;
    try {
      const res = await watchPartyApi.submitPollVote(room.code, optionIndex);
      if (res.data?.pollVotes) {
        setRoom((prev: any) => ({ ...prev, pollVotes: res.data.pollVotes }));
      }
    } catch (err) {
      console.error('Poll vote failed:', err);
    }
  };

  const handleSwitchStage = async (newStage: string) => {
    if (!room?.code) return;
    try {
      const res = await watchPartyApi.switchStage(room.code, newStage);
      setRoom(res.data);
    } catch (err) {
      console.error('Failed to switch stage:', err);
    }
  };

  // ----------------------------------------------------------------------------------
  // STAGE 0: NO ACTIVE ROOM (Create or Join Screen)
  // ----------------------------------------------------------------------------------
  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs font-bold text-white shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f24c27] animate-pulse" />
            <span className="tracked-caps text-[#f24c27]">Watch Together Live</span>
            <span className="text-white/20">|</span>
            <span className="text-[#d4d4e2]">Dual-Viewer Synchronized Cinema</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Watch Together & Couch War
          </h1>
          <p className="text-base text-[#c8c8d8] max-w-2xl mx-auto leading-relaxed">
            Invite a friend or open a second browser window with a 6-character room code. Solve conflicting tastes via 2-Player Minimax, then watch in real-time synchronized harmony with AI scene trivia and dilemma polls.
          </p>

          {isGuest && (
            <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-[#f24c27]/10 border border-[#f24c27]/30 text-xs text-[#f24c27] font-semibold">
              <span>💡 You are in Guest Mode. For named dual-browser testing (e.g. Kirtan vs Dr. Turing),</span>
              <Link to="/login" className="underline font-bold text-white hover:text-[#f24c27]">
                Sign In in 1 Click
              </Link>
            </div>
          )}
        </div>

        {/* 2 Join/Create Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Create Room */}
          <div className="evo-card p-8 flex flex-col justify-between space-y-6 border-[#f24c27]/30 hover:border-[#f24c27] transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f24c27]/20 border border-[#f24c27]/40 flex items-center justify-center text-[#f24c27]">
                <Radio className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Create a Watch Room</h2>
              <p className="text-sm text-[#c8c8d8] leading-relaxed">
                Host a session. You'll receive a 6-character room code to share with your friend or professor to join from Browser 2.
              </p>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="btn-evo-accent !text-sm !py-3.5 !px-6 w-full justify-center shadow-xl hover:scale-102 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Creating Room...' : 'Create Watch Room'}</span>
            </button>
          </div>

          {/* Card 2: Join Existing Room */}
          <div className="evo-card p-8 flex flex-col justify-between space-y-6 border-white/20 hover:border-white/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Join with Room Code</h2>
              <p className="text-sm text-[#c8c8d8] leading-relaxed">
                Enter the 6-character room code provided by the host (e.g. <span className="mono text-[#f24c27] font-bold">WAR-4821</span>).
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="WAR-XXXX"
                className="w-full evocuir-glass-pill px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-white placeholder-white/30 focus:outline-none focus:border-[#f24c27] bg-[#0c0c12]"
              />
              <button
                onClick={() => handleJoinRoom()}
                disabled={loading || !inputCode.trim()}
                className="btn-evo-dark !text-sm !py-3.5 !px-6 w-full justify-center shadow-lg hover:scale-102 transition disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4 text-[#f24c27]" />
                <span>Join Watch Room</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // STAGE 3: SYNCHRONIZED THEATER & AI CO-PILOT (When a movie is active)
  // ----------------------------------------------------------------------------------
  if (room.status === 'watching' && room.activeMovie) {
    const activeMovie = room.activeMovie;
    const dilemma = activeMovie.dilemmaPoll;
    const votes = room.pollVotes || {};
    const totalVotes = Object.keys(votes).length;
    const voteCounts = [0, 0];
    Object.values(votes).forEach((v: any) => {
      if (v.optionIndex === 0) voteCounts[0]++;
      if (v.optionIndex === 1) voteCounts[1]++;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 relative">
        
        {/* Floating Emoji Reactions Stream Canvas */}
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {floatingReactions.map(r => (
            <div
              key={r.id}
              className="absolute bottom-16 left-1/3 animate-floatUp flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-2xl"
              style={{
                left: `${35 + Math.random() * 30}%`
              }}
            >
              <span className="text-3xl">{r.emoji}</span>
              <span className="text-xs font-bold text-[#c8c8d8]">{r.senderName}</span>
            </div>
          ))}
        </div>

        {/* Theater Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSwitchStage('lobby')}
              className="evocuir-glass-pill px-3 py-1.5 text-xs font-bold text-[#d4d4e2] hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Back to Lobby
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-xl sm:text-2xl font-black text-white">{activeMovie.title}</h1>
                <span className="text-xs text-[#a0a0ab] mono">({activeMovie.release_year || '2024'})</span>
              </div>
              <p className="text-xs text-[#a0a0ab] mt-0.5">
                {(activeMovie.genres || []).join(' • ')} • IMDb: <span className="text-amber-400 font-bold">{activeMovie.imdb_rating}</span> • Runtime: {activeMovie.runtime}m
              </p>
            </div>
          </div>

          {/* Room sync status pill */}
          <div className="flex items-center gap-2">
            <div className="evocuir-glass-pill px-3.5 py-1.5 text-xs font-mono font-bold text-white flex items-center gap-2 shadow-md">
              <span className="text-[#f24c27]">ROOM: {room.code}</span>
              <span className="text-white/20">|</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{room.members?.length || 1} Viewers Synced</span>
              </span>
            </div>
          </div>
        </div>

        {/* Theater Main Grid: Video Player on Left, AI Co-Pilot & Chat on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cinema Player Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Embedded Cinema Player Container */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl">
              <iframe
                title={activeMovie.title}
                src={activeMovie.trailerUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Synchronized Playback Control Bar */}
            <div className="evo-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold transition shadow-lg ${
                    localPlaying ? 'bg-amber-500 text-black' : 'bg-[#f24c27] text-white hover:scale-105'
                  }`}
                >
                  {localPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-mono font-bold text-white">
                    {localPlaying ? '▶ PLAYING (SYNCED)' : '⏸ PAUSED (SYNCED)'}
                  </div>
                  <div className="text-[11px] text-[#a0a0ab]">
                    Last updated by <span className="text-[#f24c27] font-semibold">{room.playback?.updatedBy || 'Viewer'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Floating Emoji Reaction Bar */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10">
                <span className="text-[11px] font-bold text-[#a0a0ab] pl-3 pr-1 hidden sm:inline">React:</span>
                {[
                  { emoji: '🔥', label: 'Hyped' },
                  { emoji: '🤯', label: 'Mind Blown' },
                  { emoji: '😱', label: 'Tense' },
                  { emoji: '😂', label: 'Funny' },
                  { emoji: '🍿', label: 'Popcorn' }
                ].map(r => (
                  <button
                    key={r.emoji}
                    onClick={() => handleSendReaction(r.emoji)}
                    title={r.label}
                    className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Scene Tension Gauge */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f24c27] animate-ping" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">AI Scene Spectrum:</span>
                <span className="text-xs text-[#f24c27] font-mono font-bold">{activeMovie.moodTension}</span>
              </div>
              <span className="text-[11px] text-[#a0a0ab] mono">Real-Time Fuzzy Mood Engine Active</span>
            </div>

          </div>

          {/* Right Column: AI Co-Pilot & Room Chat (1/3 width) */}
          <div className="space-y-4 flex flex-col h-full">
            
            {/* Tab Switcher */}
            <div className="flex rounded-2xl bg-white/[0.04] p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('copilot')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  activeTab === 'copilot' ? 'bg-[#f24c27] text-white shadow-md' : 'text-[#a0a0ab] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Co-Pilot</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  activeTab === 'chat' ? 'bg-white text-black shadow-md' : 'text-[#a0a0ab] hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Room Chat ({room.chat?.length || 0})</span>
              </button>
            </div>

            {/* Tab 1 Content: AI Co-Pilot */}
            {activeTab === 'copilot' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Director Cut Trivia Box */}
                <div className="bento-box p-5 space-y-3 border-amber-500/30">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Film className="w-4 h-4" />
                    <span>Director Cut Deep Trivia</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#d4d4e2] leading-relaxed">
                    {(activeMovie.trivia || []).map((t: string, idx: number) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="text-[#f24c27] font-bold">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interactive Dilemma Poll (Live Dual-Viewer Decision) */}
                {dilemma && (
                  <div className="evo-card p-5 space-y-4 border-purple-500/40 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                        <Swords className="w-4 h-4" />
                        <span>Live Viewer Dilemma Poll</span>
                      </div>
                      <span className="text-[10px] mono text-[#a0a0ab] font-bold">{totalVotes} Votes Cast</span>
                    </div>

                    <p className="text-xs font-bold text-white leading-relaxed">
                      {dilemma.question}
                    </p>

                    <div className="space-y-2">
                      {dilemma.options.map((opt: string, optIdx: number) => {
                        const count = voteCounts[optIdx] || 0;
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const userVote = votes[user?.id || '']?.optionIndex === optIdx;

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleVotePoll(optIdx)}
                            className={`w-full p-3 rounded-xl text-left text-xs transition relative overflow-hidden border ${
                              userVote 
                                ? 'border-[#f24c27] bg-[#f24c27]/15 text-white font-bold' 
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-[#d4d4e2]'
                            }`}
                          >
                            {/* Vote Percentage Background Fill */}
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-[#f24c27]/20 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex justify-between items-center z-10">
                              <span>{opt}</span>
                              <span className="font-mono font-bold text-white">{pct}% ({count})</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {totalVotes >= 2 && (
                      <div className="text-[11px] mono text-purple-300 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                        {voteCounts[0] === voteCounts[1] 
                          ? '⚡ Room Split 50/50: Divergent Perspectives!' 
                          : '🤝 Majority Consensus Reached!'}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* Tab 2 Content: Room Chat */}
            {activeTab === 'chat' && (
              <div className="evo-card p-4 flex flex-col h-[420px] justify-between border-white/10 animate-fadeIn">
                <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
                  {(room.chat || []).map((msg: any) => {
                    const isMe = msg.senderId === user?.id;
                    if (msg.isSystem) {
                      return (
                        <div key={msg.id} className="text-[11px] text-center text-[#a0a0ab] bg-white/[0.03] py-1.5 px-3 rounded-full mono">
                          🤖 {msg.text}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-2xl text-xs max-w-[85%] ${
                          isMe
                            ? 'bg-[#f24c27]/20 border border-[#f24c27]/40 text-white ml-auto'
                            : 'bg-white/[0.06] border border-white/10 text-[#d4d4e2]'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-[#a0a0ab] mb-0.5">{msg.senderName}</div>
                        {msg.reaction ? (
                          <div className="text-2xl">{msg.reaction}</div>
                        ) : (
                          <div>{msg.text}</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-white/10">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type to room..."
                    className="flex-1 evocuir-glass-pill px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#f24c27] bg-[#0c0c12]"
                  />
                  <button
                    type="submit"
                    className="btn-evo-accent !text-xs !py-2 !px-4"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // STAGE 1 & 2: ROOM LOBBY & AI CONFLICT ARBITER (Consensus Phase)
  // ----------------------------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner with Room Code */}
      <div className="evo-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-[#f24c27]/30 shadow-2xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f24c27]">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Active Watch Party Room</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-5xl font-black text-white mono tracking-wider">{room.code}</span>
            <button
              onClick={copyRoomCode}
              className="evocuir-glass-pill px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1.5 hover:border-[#f24c27] transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#f24c27]" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <p className="text-xs text-[#a0a0ab]">
            Share this 6-character code with your friend or open a second browser window at <span className="text-white font-mono">/watch-party?room={room.code}</span>
          </p>
        </div>

        {/* Connected Viewers Badges */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#a0a0ab] uppercase tracking-wider block">
            Connected Viewers ({room.members?.length || 1})
          </span>
          <div className="flex flex-wrap gap-2">
            {(room.members || []).map((m: any, idx: number) => (
              <div key={m.userId || idx} className="evocuir-glass-pill px-3.5 py-2 text-xs font-bold text-white flex items-center gap-2 border border-white/10 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{m.name}</span>
                <span className="text-[10px] text-[#f24c27] uppercase mono">({m.role})</span>
              </div>
            ))}
            {(room.members?.length || 0) < 2 && (
              <div className="evocuir-glass-pill px-3.5 py-2 text-xs text-[#a0a0ab] border border-dashed border-white/20 animate-pulse">
                + Waiting for Browser 2 to join...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Engine Mode Switcher */}
      <div className="evo-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/[0.08] pb-6">
          <div>
            <span className="tracked-caps text-[#f24c27] block mb-1">AI Conflict Arbiter</span>
            <h2 className="text-2xl font-bold text-white">Solve Taste Disagreement</h2>
            <p className="text-xs text-[#c8c8d8] font-normal mt-0.5">
              Select between academic 2-Player Minimax with Alpha-Beta Pruning or Collaborative Group Fairness.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-full border border-white/[0.1]">
            <button
              onClick={() => setMode('adversarial_minimax')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition ${
                mode === 'adversarial_minimax'
                  ? 'bg-[#f24c27] text-white shadow-lg shadow-[#f24c27]/30'
                  : 'text-[#d4d4e2] hover:text-white'
              }`}
            >
              2-Player Minimax (Alpha-Beta)
            </button>
            <button
              onClick={() => setMode('collaborative_fairness')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition ${
                mode === 'collaborative_fairness'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-[#d4d4e2] hover:text-white'
              }`}
            >
              Collaborative Max-Min
            </button>
          </div>
        </div>

        {/* Viewer Taste Profiles Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(room.members || []).map((member: any, idx: number) => {
            const isMe = member.userId === user?.id;
            return (
              <div key={member.userId || idx} className="bento-box p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-[#f24c27]' : 'bg-purple-400'}`} />
                    {member.name} {isMe && '(You)'}
                  </span>
                  <span className="text-xs text-[#a0a0ab] uppercase mono font-bold">
                    {idx === 0 ? 'Player 1 (Max)' : 'Player 2 (Min)'}
                  </span>
                </div>

                <div className="space-y-3 text-xs text-[#c8c8d8]">
                  <div>
                    <span className="text-[#a0a0ab] block mb-1">Liked Genres:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(member.likedGenres || []).map((g: string) => (
                        <span key={g} className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#a0a0ab] block mb-1">Vetoed Genres (Hard Constraint):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(member.vetoes || []).length > 0 ? (
                        member.vetoes.map((v: string) => (
                          <span key={v} className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 font-semibold">
                            {v}
                          </span>
                        ))
                      ) : (
                        <span className="text-white/40 italic">None</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-xs">
                    <span className="text-[#a0a0ab]">Preferred Mood:</span>
                    <span className="font-bold text-white capitalize">{member.preferredMood || 'Energetic'}</span>
                  </div>
                </div>

                {isMe && (
                  <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newVeto = prompt('Enter a genre to Veto (or leave blank):', member.vetoes?.join(', ') || '');
                        if (newVeto !== null) {
                          handleUpdatePreferences({
                            vetoes: newVeto ? newVeto.split(',').map(s => s.trim()) : []
                          });
                        }
                      }}
                      className="text-xs text-[#f24c27] hover:underline font-bold"
                    >
                      ✎ Edit My Vetoes & Genres
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Execute Consensus Button */}
        <div className="text-center pt-2">
          <button
            onClick={handleRunConsensus}
            disabled={recommending}
            className="btn-evo-accent !text-sm !py-3.5 !px-10 shadow-xl hover:scale-105 disabled:opacity-50"
          >
            <Swords className="w-5 h-5" />
            <span>{recommending ? 'Computing Game Equilibrium...' : `Run ${mode === 'adversarial_minimax' ? 'Minimax Arbiter' : 'Fairness Consensus'}`}</span>
          </button>
        </div>
      </div>

      {/* Consensus Results Display */}
      {room.recommendations && (
        <div className="space-y-6 animate-fadeIn">
          {mode === 'adversarial_minimax' && room.recommendations.selected_movie ? (
            /* Minimax Results Card */
            <div className="evo-card p-6 sm:p-8 space-y-6 border-purple-500/40 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Cpu className="w-4 h-4" />
                    <span>2-Player Minimax with Alpha-Beta Pruning</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    Equilibrium Selected: {room.recommendations.selected_movie.title}
                  </h3>
                </div>

                <div className="evocuir-glass-pill p-3 text-xs mono text-[#d4d4e2] space-y-1 shadow-md">
                  <div>Pruned Branches: <span className="text-white font-bold">{room.recommendations.metrics?.alpha_beta_cutoffs || 0}</span></div>
                  <div>Evaluated Nodes: <span className="text-white font-bold">{room.recommendations.metrics?.nodes_evaluated || 16}</span></div>
                  <div>Payoff Delta: <span className="text-[#f24c27] font-bold">{room.recommendations.minimax_payoff_differential}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MovieCard
                  movie={{
                    id: room.recommendations.selected_movie.id,
                    title: room.recommendations.selected_movie.title,
                    releaseYear: room.recommendations.selected_movie.release_year,
                    runtimeMinutes: room.recommendations.selected_movie.runtime,
                    genres: room.recommendations.selected_movie.genres,
                    imdbRating: room.recommendations.selected_movie.imdb_rating,
                    posterUrl: room.recommendations.selected_movie.poster_url,
                    overview: room.recommendations.selected_movie.overview
                  }}
                  showScore={false}
                />

                <div className="md:col-span-2 space-y-5 flex flex-col justify-between">
                  <div className="bento-box p-6 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Game-Theoretic Satisfaction Distribution</h4>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[#d4d4e2] font-semibold">Player 1 (Host) Satisfaction:</span>
                          <span className="font-mono font-bold text-amber-400">{Math.round(room.recommendations.player1_utility * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${room.recommendations.player1_utility * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[#d4d4e2] font-semibold">Player 2 (Guest) Satisfaction:</span>
                          <span className="font-mono font-bold text-purple-400">{Math.round(room.recommendations.player2_utility * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-400 h-full rounded-full" style={{ width: `${room.recommendations.player2_utility * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-purple-500/30 text-xs text-purple-200 leading-relaxed font-normal">
                    💡 <strong>Alpha-Beta Reasoning:</strong> Minimax modeled both viewers as rational agents with zero-sum discrepancy utility. Subtrees containing vetoed genres were cut off early via alpha-beta pruning, yielding this exact equilibrium compromise.
                  </div>

                  {/* Launch Watch Theater Button */}
                  <button
                    onClick={() => handleSelectMovieForTheater(room.recommendations.selected_movie)}
                    className="btn-evo-accent !text-sm !py-4 w-full justify-center shadow-2xl hover:scale-102 transition"
                  >
                    <Tv className="w-5 h-5" />
                    <span>🎬 Launch Synchronized Watch Room with "{room.recommendations.selected_movie.title}"</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Collaborative Fairness Results */
            <div className="evo-card p-6 sm:p-8 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="tracked-caps text-[#f24c27] block mb-1">Collaborative Max-Min Fairness</span>
                <h3 className="text-2xl font-bold text-white">Compromise Options</h3>
                <p className="text-xs text-[#c8c8d8] mt-1">{room.recommendations.compromise_analysis}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(room.recommendations.recommendations || []).map((rec: any, idx: number) => {
                  const m = rec.movie;
                  return (
                    <div key={m.id} className="bento-box p-5 flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-center text-xs mono font-bold">
                        <span className="text-[#f24c27]">Compromise #{idx + 1}</span>
                        <span className="text-emerald-400">Min: {Math.round(rec.min_satisfaction * 100)}%</span>
                      </div>

                      <MovieCard
                        movie={{
                          id: m.id,
                          title: m.title,
                          releaseYear: m.release_year,
                          runtimeMinutes: m.runtime,
                          genres: m.genres,
                          imdbRating: m.imdb_rating,
                          posterUrl: m.poster_url,
                          overview: m.overview
                        }}
                        showScore={false}
                      />

                      <button
                        onClick={() => handleSelectMovieForTheater(m)}
                        className="btn-evo-dark !text-xs !py-2.5 w-full justify-center"
                      >
                        <Tv className="w-4 h-4 text-[#f24c27]" />
                        <span>Watch This Together</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
