import { ChevronLeft, ChevronRight, Clock3, Headphones, Minimize2, Timer } from "lucide-react";
import { useLocation } from "react-router-dom";
import { LofiRadioPlayer } from "../../lofi-radio/components/LofiRadioPlayer";
import { PomodoroTimer } from "../../pomodoro/components/PomodoroTimer";
import { useWidgetMedia } from "../context/WidgetMediaProvider";
import { shouldHideWidget } from "../utils/widgetVisibility";

export function ProductivityWidget() {
  const {
    activePanel,
    goToNextPanel,
    goToPreviousPanel,
    isMinimized,
    expandWidget,
    minimizeWidget,
  } = useWidgetMedia();
  const location = useLocation();

  if (shouldHideWidget(location.pathname)) {
    return null;
  }

  const title = activePanel === "pomodoro" ? "Pomodoro" : "Lofi Radio";
  const Icon = activePanel === "pomodoro" ? Timer : Headphones;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <PomodoroTimer showUI={false} />
        <button
          type="button"
          onClick={expandWidget}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-2xl transition hover:scale-105 hover:bg-purple-700"
          aria-label="Expandir widget"
          title="Abrir widget"
        >
          <Clock3 className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[360px] rounded-3xl border border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/80 px-3 py-2">
        <button
          type="button"
          onClick={goToPreviousPanel}
          className="rounded-full p-2 text-gray-500 transition hover:bg-white hover:text-purple-700"
          aria-label="Painel anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Icon className="h-4 w-4 text-purple-700" />
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToNextPanel}
            className="rounded-full p-2 text-gray-500 transition hover:bg-white hover:text-purple-700"
            aria-label="Proximo painel"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={minimizeWidget}
            className="rounded-full p-2 text-gray-500 transition hover:bg-white hover:text-purple-700"
            aria-label="Minimizar widget"
            title="Minimizar"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PomodoroTimer showUI={activePanel === "pomodoro"} />
      {activePanel === "radio" ? <LofiRadioPlayer /> : null}
    </div>
  );
}
