import React, { useState, useRef } from 'react';
import { Video, Square, Play, Download, Paperclip, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { useToast } from '../../context/ToastContext';

export const ScreenRecorderModal = ({ isOpen, onClose, onAttachClip }) => {
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const { addToast } = useToast();

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: false,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        setRecording(false);
        clearInterval(timerIntervalRef.current);
        stream.getTracks().forEach(track => track.stop());
      };

      // Handle user stopping screen share via browser popup bar
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };

      mediaRecorder.start(1000);
      setRecording(true);
      setTimer(0);
      setRecordedUrl(null);
      setRecordedBlob(null);

      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

      addToast('Screen capture recording active...', 'cyber');
    } catch (err) {
      console.error('Screen recording error:', err);
      addToast('Screen recording was cancelled or not supported in this browser.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      addToast('Screen clip captured successfully!', 'success');
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleAttach = () => {
    if (recordedBlob && onAttachClip) {
      const file = new File([recordedBlob], `screen-repro-${Date.now()}.webm`, { type: 'video/webm' });
      onAttachClip(file, recordedUrl);
      addToast('Clip attached to Bug report draft!', 'success');
      onClose();
    }
  };

  const downloadClip = () => {
    if (recordedUrl) {
      const a = document.createElement('a');
      a.href = recordedUrl;
      a.download = `bug-recording-${Date.now()}.webm`;
      a.click();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎥 Built-in Cyber Screen Recorder" maxWidth="max-w-xl">
      <div className="space-y-5">
        <p className="text-sm text-slate-400">
          Capture high-fidelity browser actions, repro steps, and visual regressions directly without external recording tools.
        </p>

        {/* Recording Visualizer */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col items-center justify-center min-h-[220px]">
          {recording ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-rose-400 font-bold tracking-widest text-lg font-mono">
                  REC • {formatTimer(timer)}
                </span>
              </div>
              <p className="text-xs text-slate-400">Capturing live window screen activity...</p>
              <button
                onClick={stopRecording}
                className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all shadow-lg shadow-rose-950/50"
              >
                <Square size={16} fill="white" /> Stop & Review Clip
              </button>
            </div>
          ) : recordedUrl ? (
            <div className="w-full flex flex-col items-center gap-4">
              <video
                src={recordedUrl}
                controls
                className="w-full max-h-56 rounded-lg border border-slate-800 bg-black shadow-lg"
              />
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <CheckCircle2 size={14} /> Ready to attach ({Math.round(recordedBlob?.size / 1024)} KB WebM)
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-4 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-cyan-400">
                <Video size={32} />
              </div>
              <div className="text-sm font-medium text-slate-300">Ready to record display</div>
              <p className="text-xs text-slate-500 max-w-xs">
                Select your browser tab or app window to record reproduction steps.
              </p>
              <button
                onClick={startRecording}
                className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-950/50"
              >
                <Play size={16} fill="currentColor" /> Start Recording
              </button>
            </div>
          )}
        </div>

        {/* Action Controls when recorded */}
        {recordedUrl && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={startRecording}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Re-record clip
            </button>
            <div className="flex items-center gap-2.5">
              <button
                onClick={downloadClip}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Download size={14} /> Download
              </button>
              <button
                onClick={handleAttach}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-950/50"
              >
                <Paperclip size={14} /> Attach Clip to Bug
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

