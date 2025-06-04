import { useState, useEffect, useRef } from "react";

type TAudioData = {
  bass: number;
  mid: number;
  treble: number;
  overall: number;
};

interface IAudioAnalyzerHook {
  audioData: TAudioData;
  startAudio: () => Promise<void>;
  isPlaying: boolean;
}

export function useAudioAnalyzer(): IAudioAnalyzerHook {
  const [audioData, setAudioData] = useState<TAudioData>({
    bass: 0,
    mid: 0,
    treble: 0,
    overall: 0,
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startAudio = async (): Promise<void> => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;

      const bufferLength: number = analyzerRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyzerRef.current);

      setIsPlaying(true);
    } catch (err) {
      console.log("Microphone access denied, using demo data");
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    let animationId: number;

    const updateAudioData = (): void => {
      if (analyzerRef.current && dataArrayRef.current) {
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);

        const bass: number =
          dataArrayRef.current.slice(0, 10).reduce((a, b) => a + b) / 10 / 255;
        const mid: number =
          dataArrayRef.current.slice(10, 40).reduce((a, b) => a + b) / 30 / 255;
        const treble: number =
          dataArrayRef.current.slice(40, 128).reduce((a, b) => a + b) /
          88 /
          255;
        const overall: number =
          dataArrayRef.current.reduce((a, b) => a + b) /
          dataArrayRef.current.length /
          255;

        setAudioData({ bass, mid, treble, overall });
      } else {
        // Demo data when no microphone
        const time: number = Date.now() * 0.001;
        setAudioData({
          bass: Math.abs(Math.sin(time * 0.5)) * 0.8,
          mid: Math.abs(Math.sin(time * 1.2)) * 0.6,
          treble: Math.abs(Math.sin(time * 2)) * 0.4,
          overall:
            (Math.abs(Math.sin(time * 0.8)) + Math.abs(Math.sin(time * 1.5))) *
            0.3,
        });
      }

      animationId = requestAnimationFrame(updateAudioData);
    };

    if (isPlaying) {
      updateAudioData();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  return { audioData, startAudio, isPlaying };
}
