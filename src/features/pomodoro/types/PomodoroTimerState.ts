export type PomodoroMode = "SESSION" | "BREAK";
export type PomodoroStatus = "IDLE" | "RUNNING" | "PAUSED" | "ALARM";

export type PomodoroTimerState = {
  id: string;
  mode: PomodoroMode;
  status: PomodoroStatus;
  startedAt: string | null;
  endsAt: string | null;
  remainingSeconds: number;
  alarmAcknowledged: boolean;
};
