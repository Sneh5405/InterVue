import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import Button from '../ui/Button';

const VideoChat = ({ interviewId, isInterviewer }) => {
    const socket = useSocket();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ],
    };



    const localStreamRef = useRef(null);
    const streamCompletedRef = useRef(false);

    useEffect(() => {
        const startCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                localStreamRef.current = stream; // Store in ref
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing media devices:", error);
                // Fallback to audio-only if camera is locked/unavailable
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    setLocalStream(audioStream);
                    localStreamRef.current = audioStream;
                } catch (audioError) {
                    console.error("Error accessing audio devices:", audioError);
                    localStreamRef.current = null;
                }
            } finally {
                streamCompletedRef.current = true;
            }
        };

        startCall();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Store ice candidates if PC isn't ready
        const iceQueue = [];

        // Helper to wait for the local stream
        const waitForStream = () => {
            return new Promise((resolve) => {
                if (streamCompletedRef.current) return resolve(localStreamRef.current);
                const interval = setInterval(() => {
                    if (streamCompletedRef.current) {
                        clearInterval(interval);
                        resolve(localStreamRef.current);
                    }
                }, 100);
            });
        };

        const drainIceQueue = async (pc) => {
            while (iceQueue.length > 0) {
                const candidate = iceQueue.shift();
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding queued ice candidate", e);
                }
            }
        };

        socket.on('user-connected', async (userId) => {
            console.log("Peer connected, initiating offer...");
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            const stream = await waitForStream();
            const pc = createPeerConnection();
            peerConnectionRef.current = pc;

            if (stream) {
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            }

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('offer', { roomId: interviewId, offer });
        });

        socket.on('offer', async ({ offer, userId }) => {
            console.log("Received offer from", userId);
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            const stream = await waitForStream();
            const pc = createPeerConnection();
            peerConnectionRef.current = pc;

            if (stream) {
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            }

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            await drainIceQueue(pc);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('answer', { roomId: interviewId, answer });
        });

        socket.on('answer', async ({ answer }) => {
            console.log("Received answer");
            const pc = peerConnectionRef.current;
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                await drainIceQueue(pc);
            }
        });
        
        socket.on('ice-candidate', async ({ candidate }) => {
            const pc = peerConnectionRef.current;
            if (pc && pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
                }
            } else {
                iceQueue.push(candidate);
            }
        });

        socket.on('user-disconnected', (userId) => {
            console.log("Peer disconnected:", userId);
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            setRemoteStream(null);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        });

        socket.on('force-disconnect', (reason) => {
            alert(`Disconnected: ${reason}`);
            window.location.reload();
        });

        return () => {
            socket.off('user-connected');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('user-disconnected');
            socket.off('force-disconnect');
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
        };

    }, [socket, interviewId]);

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(iceServers);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { roomId: interviewId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log("Received remote track");
            setRemoteStream(event.streams[0]);
        };

        return pc;
    };

    // Keep remote video srcObject synchronized with remoteStream state
    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    const endCall = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        window.location.reload(); // Simple way to reset state/view
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-700 shadow-2xl w-64 md:w-80">
            {/* Header / Role Badge */}
            <div className="flex justify-between items-center px-1 mb-1">
                <span className="text-xs font-semibold text-slate-400">
                    {isInterviewer ? 'Candidate View' : 'Interviewer View'}
                </span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected"></div>
            </div>

            {/* Remote Video (Main) */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-700">
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover ${remoteStream ? 'block' : 'hidden'}`} 
                />
                {!remoteStream && (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        Waiting for peer...
                    </div>
                )}

                {/* Local Video (PiP) */}
                <div className="absolute bottom-2 right-2 w-20 aspect-video bg-slate-800 rounded border border-slate-600 overflow-hidden shadow-lg">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2">
                <button
                    onClick={toggleMute}
                    className={`p-2 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'} text-white transition-colors`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? "🔇" : "🎤"}
                </button>
                <button
                    onClick={toggleVideo}
                    className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'} text-white transition-colors`}
                    title={isVideoOff ? "Start Video" : "Stop Video"}
                >
                    {isVideoOff ? "📷" : "📸"}
                </button>
                <button
                    onClick={endCall}
                    className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                    title="End Call"
                >
                    📞
                </button>
            </div>
        </div>
    );
};

export default VideoChat;
