import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { IAudioData } from "@/types/audio";

interface IAudioVisualizerContext {
  audioData: IAudioData;
  setAudio: (file?: File) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  setVolume: (volume: number) => void;
  isAudioUploading: boolean;
  isPlaying: boolean;
  volume: number;
}

const AudioVisualizerContext = createContext<IAudioVisualizerContext | null>(
  null
);

export const useAudioAnalyzer = () => {
  const context = useContext(AudioVisualizerContext);
  if (!context)
    throw new Error("useAudioData must be used inside AudioVisualizerProvider");
  return context;
};

// Default audio data
const DEFAULT_AUDIO_DATA: IAudioData = {
  bass: 0,
  mid: 0,
  treble: 0,
  overall: 0,
  volume: 0.8,
  frequencyData: new Uint8Array(0),
};

export const AudioVisualizerProvider = ({
  children,
  defaultAudioPath = "/audio/default-audio.mp3",
}: {
  children: ReactNode;
  defaultAudioPath?: string;
}) => {
  const [audioData, setAudioData] = useState<IAudioData>(DEFAULT_AUDIO_DATA);
  const [isAudioUploading, setIsAudioUploading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(1); // Volume state (0-1)

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Set volume function
  const setVolume = useCallback((newVolume: number) => {
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);

    // Apply volume to audio element if it exists
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    frequencyDataRef.current = null;
  }, []);

  // Play audio
  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to play audio:", error);
        throw error;
      }
    } else {
      console.log("no audio ref");
    }
  }, []);

  // Animation loop for audio analysis
  const updateAudioData = useCallback(() => {
    if (!analyserRef.current || !frequencyDataRef.current) {
      return;
    }

    analyserRef.current.getByteFrequencyData(frequencyDataRef.current);

    const dataLength = frequencyDataRef.current.length;

    // Calculate frequency bands
    const bassEnd = Math.floor(dataLength * 0.15);
    const midEnd = Math.floor(dataLength * 0.5);

    const bass = average(frequencyDataRef.current.slice(0, bassEnd)) / 255;
    const mid = average(frequencyDataRef.current.slice(bassEnd, midEnd)) / 255;
    const treble = average(frequencyDataRef.current.slice(midEnd)) / 255;
    const overall = average(frequencyDataRef.current) / 255;
    const volumeLevel = overall; // Simple volume approximation

    setAudioData({
      bass,
      mid,
      treble,
      overall,
      volume: volumeLevel,
      frequencyData: new Uint8Array(frequencyDataRef.current),
    });

    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, []);

  // Set audio source (file or default)
  const setAudio = useCallback(
    async (file?: File) => {
      try {
        // Cleanup previous audio
        cleanup();
        setIsAudioUploading(true);
        // Create audio context
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const context = audioContextRef.current;

        if (context.state === "suspended") {
          await context.resume();
        }

        // Create analyser
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        // Create audio element
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.loop = !file; // Loop default audio, not custom files
        audio.volume = volume; // Apply current volume setting

        // Set source
        if (file) {
          audio.src = URL.createObjectURL(file);
        } else {
          audio.src = defaultAudioPath;
        }

        // Wait for audio to load
        await new Promise((resolve, reject) => {
          const handleCanPlay = () => {
            audio.removeEventListener("canplaythrough", handleCanPlay);
            audio.removeEventListener("error", handleError);
            resolve(true);
          };

          const handleError = () => {
            audio.removeEventListener("canplaythrough", handleCanPlay);
            audio.removeEventListener("error", handleError);
            reject(new Error("Failed to load audio"));
          };

          audio.addEventListener("canplaythrough", handleCanPlay);
          audio.addEventListener("error", handleError);
          audio.load();
        });

        // Connect audio graph
        const sourceNode = context.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        analyser.connect(context.destination);

        audioRef.current = audio;
        sourceNodeRef.current = sourceNode;

        // Initialize frequency data array
        const bufferLength = analyser.frequencyBinCount;
        frequencyDataRef.current = new Uint8Array(bufferLength);

        setIsAudioUploading(false);
        // Start analysis loop
        updateAudioData();
      } catch (error) {
        console.error("Failed to set audio:", error);
        throw error;
      }
    },
    [cleanup, updateAudioData, defaultAudioPath, volume]
  );

  // Pause audio
  const pause = useCallback(() => {
    if (audioRef.current) {
      setIsPlaying(false);
      audioRef.current.pause();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const contextValue: IAudioVisualizerContext = {
    audioData,
    setAudio,
    play,
    pause,
    setVolume,
    isAudioUploading,
    isPlaying,
    volume,
  };

  return (
    <AudioVisualizerContext.Provider value={contextValue}>
      {children}
    </AudioVisualizerContext.Provider>
  );
};

// Utility function
const average = (arr: Uint8Array): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};
