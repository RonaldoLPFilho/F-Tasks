import {
  FastForward,
  Music4,
  Pause,
  Play,
  Rewind,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { FloatingLabelSelect } from "../../../components/FloatingLabelSelect";
import { useWidgetMedia } from "../../widget/context/WidgetMediaProvider";

function formatTime(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(seconds, 0) : 0;
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const secs = String(Math.floor(safeSeconds % 60)).padStart(2, "0");
  return `${minutes}:${secs}`;
}

export function LofiRadioPlayer() {
  const {
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
  } = useWidgetMedia();

  if (isLoadingRadios) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-gray-500">
        Carregando radios...
      </div>
    );
  }

  if (!selectedRadio || !currentTrack) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-gray-500">
        Nenhuma radio disponivel.
      </div>
    );
  }

  const radioOptions = radios.map((radio) => ({
    label: radio.name,
    value: radio.id,
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4">
        <div className="mb-3 flex items-center gap-2 text-purple-700">
          <Music4 className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Lofi Radio</span>
        </div>

        <FloatingLabelSelect
          id="lofi_radio_select"
          label="Selecione a radio"
          value={selectedRadio.id}
          onChange={(event) => {
            void selectRadio(event.target.value);
          }}
          options={radioOptions}
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Tocando agora
        </p>
        <h3 className="mt-1 text-lg font-semibold text-gray-900">{currentTrack.title}</h3>
        <p className="text-sm text-gray-500">{selectedRadio.name}</p>

        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seekTo(Number(event.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => {
              void previousTrack();
            }}
            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 transition hover:border-purple-300 hover:text-purple-700"
            aria-label="Faixa anterior"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => seekBy(-10)}
            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 transition hover:border-purple-300 hover:text-purple-700"
            aria-label="Voltar 10 segundos"
          >
            <Rewind className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              void toggleRadioPlayback();
            }}
            className="flex items-center justify-center rounded-xl bg-purple-600 p-2 text-white transition hover:bg-purple-700"
            aria-label={isRadioPlaying ? "Pausar radio" : "Tocar radio"}
          >
            {isRadioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => seekBy(10)}
            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 transition hover:border-purple-300 hover:text-purple-700"
            aria-label="Avancar 10 segundos"
          >
            <FastForward className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              void nextTrack();
            }}
            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 transition hover:border-purple-300 hover:text-purple-700"
            aria-label="Proxima faixa"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            onChange={(event) => setRadioVolume(Number(event.target.value) / 100)}
            className="w-full accent-purple-600"
          />
          <span className="w-10 text-right text-xs text-gray-500">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
