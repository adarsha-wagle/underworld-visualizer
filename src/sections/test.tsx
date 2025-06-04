import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// Enhanced audio data interface
export interface IAudioData {
  // Frequency bands
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  treble: number;
  overall: number;

  // Additional analysis
  volume: number;
  peak: number;
  rms: number;

  // Frequency spectrum (for advanced visualizations)
  frequencyData: Uint8Array;
  timeData: Uint8Array;

  // Beat detection
  beatDetected: boolean;
  bpm: number;

  // Audio characteristics
  centroid: number; // Spectral centroid (brightness)
  rolloff: number; // Spectral rolloff
  flux: number; // Spectral flux (onset detection)
}

export interface IAudioSettings {
  fftSize: 256 | 512 | 1024 | 2048 | 4096 | 8192;
  smoothingTimeConstant: number;
  volume: number;
  enableBeatDetection: boolean;
  beatThreshold: number;
  enableAdvancedAnalysis: boolean;
}

export interface IAudioState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  duration: number;
  currentTime: number;
  hasStarted: boolean;
  audioSource: "default" | "custom" | "microphone";
  fileName?: string;
}

interface IAudioVisualizerContext {
  // Audio data
  audioData: IAudioData;
  audioState: IAudioState;
  audioSettings: IAudioSettings;

  // Control methods
  setUserAudio: (file: File) => Promise<void>;
  useDefaultAudio: () => Promise<void>;
  useMicrophone: () => Promise<void>;

  // Playback controls
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;

  // Settings
  updateSettings: (settings: Partial<IAudioSettings>) => void;

  // Utility
  reset: () => void;
}

const AudioVisualizerContext = createContext<IAudioVisualizerContext | null>(
  null
);

export const useAudioData = () => {
  const context = useContext(AudioVisualizerContext);
  if (!context)
    throw new Error("useAudioData must be used inside AudioVisualizerProvider");
  return context;
};

// Default settings
const DEFAULT_SETTINGS: IAudioSettings = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  volume: 0.7,
  enableBeatDetection: true,
  beatThreshold: 0.3,
  enableAdvancedAnalysis: true,
};

// Default audio data
const DEFAULT_AUDIO_DATA: IAudioData = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0,
  overall: 0,
  volume: 0,
  peak: 0,
  rms: 0,
  frequencyData: new Uint8Array(0),
  timeData: new Uint8Array(0),
  beatDetected: false,
  bpm: 0,
  centroid: 0,
  rolloff: 0,
  flux: 0,
};

export const AudioVisualizerProvider = ({
  children,
  defaultAudioPath = "/audio/default-audio.mp3",
}: {
  children: ReactNode;
  defaultAudioPath?: string;
}) => {
  // States
  const [audioData, setAudioData] = useState<IAudioData>(DEFAULT_AUDIO_DATA);
  const [audioSettings, setAudioSettings] =
    useState<IAudioSettings>(DEFAULT_SETTINGS);
  const [audioState, setAudioState] = useState<IAudioState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    hasError: false,
    errorMessage: "",
    duration: 0,
    currentTime: 0,
    hasStarted: false,
    audioSource: "default",
  });

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<
    MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null
  >(null);

  // Analysis refs
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const timeDataRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Beat detection refs
  const beatHistoryRef = useRef<number[]>([]);
  const lastBeatTimeRef = useRef<number>(0);
  const previousFluxRef = useRef<number>(0);
  const bpmHistoryRef = useRef<number[]>([]);

  // Advanced analysis
  const previousFrequencyDataRef = useRef<Uint8Array | null>(null);

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

    // Reset refs
    analyserRef.current = null;
    gainNodeRef.current = null;
    frequencyDataRef.current = null;
    timeDataRef.current = null;
  }, []);

  // Initialize audio context and analyser
  const initializeAudioContext = useCallback(async () => {
    try {
      if (
        audioContextRef.current?.state === "closed" ||
        !audioContextRef.current
      ) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const context = audioContextRef.current;

      if (context.state === "suspended") {
        await context.resume();
      }

      // Create analyser
      const analyser = context.createAnalyser();
      analyser.fftSize = audioSettings.fftSize;
      analyser.smoothingTimeConstant = audioSettings.smoothingTimeConstant;

      // Create gain node
      const gainNode = context.createGain();
      gainNode.gain.value = audioSettings.volume;

      analyserRef.current = analyser;
      gainNodeRef.current = gainNode;

      // Initialize data arrays
      const bufferLength = analyser.frequencyBinCount;
      frequencyDataRef.current = new Uint8Array(bufferLength);
      timeDataRef.current = new Uint8Array(bufferLength);
      previousFrequencyDataRef.current = new Uint8Array(bufferLength);

      return { context, analyser, gainNode };
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
      throw error;
    }
  }, [
    audioSettings.fftSize,
    audioSettings.smoothingTimeConstant,
    audioSettings.volume,
  ]);

  // Advanced audio analysis
  const analyzeAudio = useCallback(
    (frequencyData: Uint8Array, timeData: Uint8Array) => {
      const dataLength = frequencyData.length;

      // Frequency band analysis (more detailed)
      const bassEnd = Math.floor(dataLength * 0.1);
      const lowMidEnd = Math.floor(dataLength * 0.25);
      const midEnd = Math.floor(dataLength * 0.5);
      const highMidEnd = Math.floor(dataLength * 0.75);

      const bass = average(frequencyData.slice(0, bassEnd)) / 255;
      const lowMid = average(frequencyData.slice(bassEnd, lowMidEnd)) / 255;
      const mid = average(frequencyData.slice(lowMidEnd, midEnd)) / 255;
      const highMid = average(frequencyData.slice(midEnd, highMidEnd)) / 255;
      const treble = average(frequencyData.slice(highMidEnd)) / 255;
      const overall = average(frequencyData) / 255;

      // Volume analysis
      const volume = average(timeData) / 255;
      const peak = Math.max(...timeData) / 255;
      const rms =
        Math.sqrt(
          timeData.reduce((sum, val) => sum + val * val, 0) / timeData.length
        ) / 255;

      let beatDetected = false;
      let bpm = 0;
      let centroid = 0;
      let rolloff = 0;
      let flux = 0;

      if (audioSettings.enableAdvancedAnalysis) {
        // Spectral centroid (brightness)
        let weightedSum = 0;
        let magnitudeSum = 0;
        for (let i = 0; i < dataLength; i++) {
          const magnitude = frequencyData[i] / 255;
          weightedSum += i * magnitude;
          magnitudeSum += magnitude;
        }
        centroid =
          magnitudeSum > 0 ? weightedSum / magnitudeSum / dataLength : 0;

        // Spectral rolloff (85% of energy)
        const targetEnergy = magnitudeSum * 0.85;
        let cumulativeEnergy = 0;
        for (let i = 0; i < dataLength; i++) {
          cumulativeEnergy += frequencyData[i] / 255;
          if (cumulativeEnergy >= targetEnergy) {
            rolloff = i / dataLength;
            break;
          }
        }

        // Spectral flux (onset detection)
        if (previousFrequencyDataRef.current) {
          let fluxSum = 0;
          for (let i = 0; i < dataLength; i++) {
            const current = frequencyData[i] / 255;
            const previous = previousFrequencyDataRef.current[i] / 255;
            const diff = current - previous;
            if (diff > 0) fluxSum += diff;
          }
          flux = fluxSum / dataLength;
        }

        // Update previous frequency data
        if (previousFrequencyDataRef.current) {
          previousFrequencyDataRef.current.set(frequencyData);
        }
      }

      // Beat detection
      if (audioSettings.enableBeatDetection) {
        const currentTime = Date.now();
        const energy = bass + lowMid; // Focus on low frequencies for beat detection

        beatHistoryRef.current.push(energy);
        if (beatHistoryRef.current.length > 10) {
          beatHistoryRef.current.shift();
        }

        const avgEnergy =
          beatHistoryRef.current.reduce((sum, val) => sum + val, 0) /
          beatHistoryRef.current.length;
        const threshold = avgEnergy * (1 + audioSettings.beatThreshold);

        if (energy > threshold && currentTime - lastBeatTimeRef.current > 200) {
          beatDetected = true;
          lastBeatTimeRef.current = currentTime;

          // BPM calculation
          if (bpmHistoryRef.current.length > 0) {
            const timeDiff =
              currentTime -
              bpmHistoryRef.current[bpmHistoryRef.current.length - 1];
            const instantBpm = 60000 / timeDiff; // Convert ms to BPM

            if (instantBpm >= 60 && instantBpm <= 200) {
              // Reasonable BPM range
              bpmHistoryRef.current.push(currentTime);
              if (bpmHistoryRef.current.length > 8) {
                bpmHistoryRef.current.shift();
              }

              // Calculate average BPM from recent beats
              if (bpmHistoryRef.current.length >= 2) {
                const intervals = [];
                for (let i = 1; i < bpmHistoryRef.current.length; i++) {
                  intervals.push(
                    bpmHistoryRef.current[i] - bpmHistoryRef.current[i - 1]
                  );
                }
                const avgInterval =
                  intervals.reduce((sum, val) => sum + val, 0) /
                  intervals.length;
                bpm = Math.round(60000 / avgInterval);
              }
            }
          } else {
            bpmHistoryRef.current.push(currentTime);
          }
        }
      }

      return {
        bass,
        lowMid,
        mid,
        highMid,
        treble,
        overall,
        volume,
        peak,
        rms,
        frequencyData: new Uint8Array(frequencyData),
        timeData: new Uint8Array(timeData),
        beatDetected,
        bpm,
        centroid,
        rolloff,
        flux,
      };
    },
    [
      audioSettings.enableBeatDetection,
      audioSettings.beatThreshold,
      audioSettings.enableAdvancedAnalysis,
    ]
  );

  // Animation loop
  const updateAudioData = useCallback(() => {
    if (
      !analyserRef.current ||
      !frequencyDataRef.current ||
      !timeDataRef.current
    ) {
      return;
    }

    analyserRef.current.getByteFrequencyData(frequencyDataRef.current);
    analyserRef.current.getByteTimeDomainData(timeDataRef.current);

    const analyzedData = analyzeAudio(
      frequencyDataRef.current,
      timeDataRef.current
    );
    setAudioData(analyzedData);

    // Update current time
    if (audioRef.current) {
      setAudioState((prev) => ({
        ...prev,
        currentTime: audioRef.current?.currentTime || 0,
      }));
    }

    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, [analyzeAudio]);

  // Initialize audio from source
  const initializeAudio = useCallback(
    async (
      source: string | File | MediaStream,
      sourceType: "default" | "custom" | "microphone"
    ) => {
      try {
        setAudioState((prev) => ({
          ...prev,
          isLoading: true,
          hasError: false,
          errorMessage: "",
        }));

        // Initialize audio context
        const { context, analyser, gainNode } = await initializeAudioContext();

        let audioElement: HTMLAudioElement | null = null;
        let sourceNode:
          | MediaElementAudioSourceNode
          | MediaStreamAudioSourceNode;

        if (source instanceof MediaStream) {
          // Microphone input
          sourceNode = context.createMediaStreamSource(source);
        } else {
          // File or URL input
          audioElement = new Audio();
          audioElement.crossOrigin = "anonymous";
          audioElement.loop = sourceType === "default"; // Loop default audio
          audioElement.volume = audioSettings.volume;

          if (source instanceof File) {
            audioElement.src = URL.createObjectURL(source);
          } else {
            audioElement.src = source;
          }

          // Wait for audio to load
          await new Promise((resolve, reject) => {
            const handleCanPlay = () => {
              audioElement!.removeEventListener(
                "canplaythrough",
                handleCanPlay
              );
              audioElement!.removeEventListener("error", handleError);
              resolve(true);
            };

            const handleError = (e: Event) => {
              audioElement!.removeEventListener(
                "canplaythrough",
                handleCanPlay
              );
              audioElement!.removeEventListener("error", handleError);
              reject(new Error("Failed to load audio"));
            };

            audioElement!.addEventListener("canplaythrough", handleCanPlay);
            audioElement!.addEventListener("error", handleError);
            audioElement!.load();
          });

          sourceNode = context.createMediaElementSource(audioElement);
          audioRef.current = audioElement;

          // Set up audio element event listeners
          audioElement.addEventListener("loadedmetadata", () => {
            setAudioState((prev) => ({
              ...prev,
              duration: audioElement!.duration,
            }));
          });

          audioElement.addEventListener("ended", () => {
            setAudioState((prev) => ({
              ...prev,
              isPlaying: false,
              isPaused: false,
            }));
          });
        }

        // Connect audio graph
        sourceNode.connect(analyser);
        analyser.connect(gainNode);

        if (sourceType !== "microphone") {
          gainNode.connect(context.destination);
        }

        sourceNodeRef.current = sourceNode;

        // Start analysis
        if (!animationFrameRef.current) {
          updateAudioData();
        }

        setAudioState((prev) => ({
          ...prev,
          isLoading: false,
          hasStarted: true,
          audioSource: sourceType,
          fileName: source instanceof File ? source.name : undefined,
        }));

        // Auto-play for file sources
        if (audioElement && sourceType !== "microphone") {
          await audioElement.play();
          setAudioState((prev) => ({
            ...prev,
            isPlaying: true,
            isPaused: false,
          }));
        }
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        setAudioState((prev) => ({
          ...prev,
          isLoading: false,
          hasError: true,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error occurred",
        }));
      }
    },
    [audioSettings.volume, initializeAudioContext, updateAudioData]
  );

  // Public methods
  const setUserAudio = useCallback(
    async (file: File) => {
      cleanup();
      await initializeAudio(file, "custom");
    },
    [cleanup, initializeAudio]
  );

  const useDefaultAudio = useCallback(async () => {
    cleanup();
    await initializeAudio(defaultAudioPath, "default");
  }, [cleanup, initializeAudio, defaultAudioPath]);

  const useMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      cleanup();
      await initializeAudio(stream, "microphone");
    } catch (error) {
      console.error("Failed to access microphone:", error);
      setAudioState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage: "Failed to access microphone. Please check permissions.",
      }));
    }
  }, [cleanup, initializeAudio]);

  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setAudioState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
        }));
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioState((prev) => ({
        ...prev,
        isPlaying: false,
        isPaused: true,
      }));
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioState((prev) => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
      }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));

    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume;
    }

    setAudioSettings((prev) => ({ ...prev, volume: clampedVolume }));
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(audioRef.current.duration, time)
      );
    }
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<IAudioSettings>) => {
      setAudioSettings((prev) => {
        const updated = { ...prev, ...newSettings };

        // Apply settings immediately if audio is active
        if (analyserRef.current) {
          if (newSettings.fftSize) {
            analyserRef.current.fftSize = newSettings.fftSize;
            // Recreate data arrays
            const bufferLength = analyserRef.current.frequencyBinCount;
            frequencyDataRef.current = new Uint8Array(bufferLength);
            timeDataRef.current = new Uint8Array(bufferLength);
            previousFrequencyDataRef.current = new Uint8Array(bufferLength);
          }

          if (newSettings.smoothingTimeConstant !== undefined) {
            analyserRef.current.smoothingTimeConstant =
              newSettings.smoothingTimeConstant;
          }
        }

        if (newSettings.volume !== undefined) {
          setVolume(newSettings.volume);
        }

        return updated;
      });
    },
    [setVolume]
  );

  const reset = useCallback(() => {
    cleanup();
    setAudioData(DEFAULT_AUDIO_DATA);
    setAudioState({
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      hasError: false,
      errorMessage: "",
      duration: 0,
      currentTime: 0,
      hasStarted: false,
      audioSource: "default",
    });

    // Reset beat detection
    beatHistoryRef.current = [];
    lastBeatTimeRef.current = 0;
    bpmHistoryRef.current = [];
    previousFluxRef.current = 0;
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const contextValue: IAudioVisualizerContext = {
    audioData,
    audioState,
    audioSettings,
    setUserAudio,
    useDefaultAudio,
    useMicrophone,
    play,
    pause,
    stop,
    setVolume,
    seek,
    updateSettings,
    reset,
  };

  return (
    <AudioVisualizerContext.Provider value={contextValue}>
      {children}
    </AudioVisualizerContext.Provider>
  );
};

// Utility functions
const average = (arr: Uint8Array): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};
