import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";
import { getLofiRadios } from "../../lofi-radio/services/LofiRadioService";
import { LofiRadio } from "../../lofi-radio/types/LofiRadio";
import { LofiTrack } from "../../lofi-radio/types/LofiTrack";

type WidgetPanel = "pomodoro" | "radio";

interface WidgetMediaContextValue {
  activePanel: WidgetPanel;
  goToNextPanel: () => void;
  goToPreviousPanel: () => void;
  openPomodoroPanel: () => void;
  isMinimized: boolean;
  minimizeWidget: () => void;
  expandWidget: () => void;
  toggleWidgetMinimized: () => void;
  radios: LofiRadio[];
  selectedRadio: LofiRadio | null;
  currentTrack: LofiTrack | null;
  isLoadingRadios: boolean;
  isRadioPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  selectRadio: (radioId: string) => Promise<void>;
  toggleRadioPlayback: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seekBy: (seconds: number) => void;
  seekTo: (seconds: number) => void;
  setRadioVolume: (volume: number) => void;
  interruptRadioForAlarm: () => void;
  resumeRadioAfterAlarm: () => Promise<void>;
}

const WidgetMediaContext = createContext<WidgetMediaContextValue | null>(null);

const PANEL_ORDER: WidgetPanel[] = ["pomodoro", "radio"];

export function WidgetMediaProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState<WidgetPanel>("pomodoro");
  const [isMinimized, setIsMinimized] = useState(false);
  const [radios, setRadios] = useState<LofiRadio[]>([]);
  const [selectedRadioId, setSelectedRadioId] = useState<string>("");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoadingRadios, setIsLoadingRadios] = useState(true);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [wasRadioPlayingBeforeAlarm, setWasRadioPlayingBeforeAlarm] = useState(false);
  const { showError } = useToast();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRadioPlayingRef = useRef(false);
  const wasRadioPlayingBeforeAlarmRef = useRef(false);
  const selectedRadioRef = useRef<LofiRadio | null>(null);
  const currentTrackIndexRef = useRef(0);
  const goToTrackRef = useRef<(trackIndex: number, autoplay: boolean) => Promise<void>>(async () => {});

  const mediaBaseUrl = useMemo(
    () => (import.meta.env.VITE_API_URL ?? "/api").replace(/\/api\/?$/, ""),
    []
  );

  const selectedRadio = useMemo(
    () => radios.find((radio) => radio.id === selectedRadioId) ?? null,
    [radios, selectedRadioId]
  );

  const currentTrack = useMemo(() => {
    if (!selectedRadio) {
      return null;
    }

    return selectedRadio.tracks[currentTrackIndex] ?? null;
  }, [currentTrackIndex, selectedRadio]);

  const buildTrackUrl = useCallback(
    (track: LofiTrack) => new URL(track.url, mediaBaseUrl || window.location.origin).toString(),
    [mediaBaseUrl]
  );

  const loadTrack = useCallback(
    async (track: LofiTrack | null, autoplay: boolean, preserveTime = false) => {
      const audio = audioRef.current;
      if (!audio || !track) {
        return;
      }

      const nextUrl = buildTrackUrl(track);
      if (audio.src !== nextUrl) {
        audio.src = nextUrl;
        audio.load();
        setCurrentTime(0);
        setDuration(0);
      }

      if (!preserveTime) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }

      if (!autoplay) {
        setIsRadioPlaying(false);
        return;
      }

      try {
        await audio.play();
        setIsRadioPlaying(true);
      } catch (error) {
        setIsRadioPlaying(false);
        showError(extractApiErrorMessage(error, "Nao foi possivel iniciar a radio."));
      }
    },
    [buildTrackUrl, showError]
  );

  const goToTrack = useCallback(
    async (trackIndex: number, autoplay: boolean) => {
      if (!selectedRadio) {
        return;
      }

      const normalizedIndex =
        ((trackIndex % selectedRadio.tracks.length) + selectedRadio.tracks.length) %
        selectedRadio.tracks.length;

      setCurrentTrackIndex(normalizedIndex);
      await loadTrack(selectedRadio.tracks[normalizedIndex], autoplay);
    },
    [loadTrack, selectedRadio]
  );

  useEffect(() => {
    isRadioPlayingRef.current = isRadioPlaying;
  }, [isRadioPlaying]);

  useEffect(() => {
    wasRadioPlayingBeforeAlarmRef.current = wasRadioPlayingBeforeAlarm;
  }, [wasRadioPlayingBeforeAlarm]);

  useEffect(() => {
    selectedRadioRef.current = selectedRadio;
  }, [selectedRadio]);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    goToTrackRef.current = goToTrack;
  }, [goToTrack]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handleEnded = () => {
      if (!selectedRadioRef.current || selectedRadioRef.current.tracks.length === 0) {
        return;
      }

      void goToTrackRef.current(currentTrackIndexRef.current + 1, true);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const loadRadios = async () => {
      try {
        const data = await getLofiRadios();
        setRadios(data);

        if (data.length > 0) {
          setSelectedRadioId(data[0].id);
          setCurrentTrackIndex(0);
        }
      } catch (error) {
        showError(extractApiErrorMessage(error, "Nao foi possivel carregar as radios lofi."));
      } finally {
        setIsLoadingRadios(false);
      }
    };

    void loadRadios();
  }, [showError]);

  const goToNextPanel = () => {
    setActivePanel((current) => PANEL_ORDER[(PANEL_ORDER.indexOf(current) + 1) % PANEL_ORDER.length]);
  };

  const goToPreviousPanel = () => {
    setActivePanel((current) => {
      const nextIndex = PANEL_ORDER.indexOf(current) - 1;
      return PANEL_ORDER[(nextIndex + PANEL_ORDER.length) % PANEL_ORDER.length];
    });
  };

  const openPomodoroPanel = useCallback(() => {
    setActivePanel("pomodoro");
    setIsMinimized(false);
  }, []);

  const minimizeWidget = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const expandWidget = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const toggleWidgetMinimized = useCallback(() => {
    setIsMinimized((current) => !current);
  }, []);

  const selectRadio = useCallback(
    async (radioId: string) => {
      const radio = radios.find((item) => item.id === radioId);
      if (!radio) {
        return;
      }

      const shouldAutoplay = isRadioPlayingRef.current;
      setSelectedRadioId(radio.id);
      setCurrentTrackIndex(0);
      await loadTrack(radio.tracks[0] ?? null, shouldAutoplay);
    },
    [loadTrack, radios]
  );

  const toggleRadioPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      return;
    }

    if (isRadioPlayingRef.current) {
      audio.pause();
      setIsRadioPlaying(false);
      return;
    }

    await loadTrack(currentTrack, true, audio.src === buildTrackUrl(currentTrack));
  }, [buildTrackUrl, currentTrack, loadTrack]);

  const nextTrack = useCallback(async () => {
    if (!selectedRadio) {
      return;
    }

    await goToTrack(currentTrackIndex + 1, isRadioPlayingRef.current);
  }, [currentTrackIndex, goToTrack, selectedRadio]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const safeSeconds = Math.max(0, Math.min(seconds, Number.isFinite(audio.duration) ? audio.duration : seconds));
    audio.currentTime = safeSeconds;
    setCurrentTime(safeSeconds);
  }, []);

  const seekBy = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      seekTo(audio.currentTime + seconds);
    },
    [seekTo]
  );

  const previousTrack = useCallback(async () => {
    if (!selectedRadio) {
      return;
    }

    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    await goToTrack(currentTrackIndex - 1, isRadioPlayingRef.current);
  }, [currentTime, currentTrackIndex, goToTrack, seekTo, selectedRadio]);

  const setRadioVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.max(0, Math.min(nextVolume, 1));
    setVolume(safeVolume);
  }, []);

  const interruptRadioForAlarm = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isRadioPlayingRef.current) {
      setWasRadioPlayingBeforeAlarm(true);
      audio.pause();
      setIsRadioPlaying(false);
    } else {
      setWasRadioPlayingBeforeAlarm(false);
    }
  }, []);

  const resumeRadioAfterAlarm = useCallback(async () => {
    if (!wasRadioPlayingBeforeAlarmRef.current || !currentTrack) {
      setWasRadioPlayingBeforeAlarm(false);
      return;
    }

    try {
      await loadTrack(currentTrack, true, true);
    } finally {
      setWasRadioPlayingBeforeAlarm(false);
    }
  }, [currentTrack, loadTrack]);

  const value = useMemo<WidgetMediaContextValue>(
    () => ({
      activePanel,
      goToNextPanel,
      goToPreviousPanel,
      openPomodoroPanel,
      isMinimized,
      minimizeWidget,
      expandWidget,
      toggleWidgetMinimized,
      radios,
      selectedRadio,
      currentTrack,
      isLoadingRadios,
      isRadioPlaying,
      volume,
      currentTime,
      duration,
      selectRadio,
      toggleRadioPlayback,
      nextTrack,
      previousTrack,
      seekBy,
      seekTo,
      setRadioVolume,
      interruptRadioForAlarm,
      resumeRadioAfterAlarm,
    }),
    [
      activePanel,
      expandWidget,
      isMinimized,
      minimizeWidget,
      currentTime,
      currentTrack,
      duration,
      openPomodoroPanel,
      interruptRadioForAlarm,
      isLoadingRadios,
      isRadioPlaying,
      nextTrack,
      previousTrack,
      radios,
      resumeRadioAfterAlarm,
      seekBy,
      seekTo,
      selectRadio,
      selectedRadio,
      toggleRadioPlayback,
      toggleWidgetMinimized,
      volume,
      setRadioVolume,
    ]
  );

  return <WidgetMediaContext.Provider value={value}>{children}</WidgetMediaContext.Provider>;
}

export function useWidgetMedia() {
  const context = useContext(WidgetMediaContext);

  if (!context) {
    throw new Error("useWidgetMedia must be used within WidgetMediaProvider");
  }

  return context;
}
