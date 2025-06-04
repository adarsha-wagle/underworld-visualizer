import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { IAudioData } from "../types/audio";

const AudioVisualizerContext = createContext<{
  audioData: IAudioData;
  setUserAudio: (file: File) => void;
} | null>(null);

export const useAudioData = () => {
  const context = useContext(AudioVisualizerContext);
  if (!context)
    throw new Error("useAudioData must be used inside AudioVisualizerProvider");
  return context;
};

export const AudioVisualizerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [audioData, setAudioData] = useState<IAudioData>({
    bass: 0,
    mid: 0,
    treble: 0,
    overall: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(null);

  const initAudio = async (src: string | File) => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.loop = true;

    if (src instanceof File) {
      audio.src = URL.createObjectURL(src);
    } else {
      audio.src = src;
    }

    await audio.play();
    audioRef.current = audio;

    const context = new AudioContext();
    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(context.destination);

    audioContextRef.current = context;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    const update = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const data = dataArrayRef.current;
      const bass = average(data.slice(0, 10)) / 255;
      const mid = average(data.slice(10, 40)) / 255;
      const treble = average(data.slice(40)) / 255;
      const overall = average(data) / 255;

      setAudioData({ bass, mid, treble, overall });
      requestAnimationFrame(update);
    };

    update();
  };

  const setUserAudio = (file: File) => {
    // Stop any previous audio
    audioRef.current?.pause();
    audioRef.current?.removeAttribute("src");
    audioRef.current?.load();

    initAudio(file);
  };

  useEffect(() => {
    // Default audio load
    initAudio("/audio/ambient.mp3");
  }, []);

  return (
    <AudioVisualizerContext.Provider value={{ audioData, setUserAudio }}>
      {children}
    </AudioVisualizerContext.Provider>
  );
};

const average = (arr: Uint8Array): number =>
  arr.reduce((sum, val) => sum + val, 0) / arr.length;
