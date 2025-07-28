import { Outlet } from "react-router-dom";
import { PomodoroTimer } from "../features/pomodoro/components/PomodoroTimer";

export function AppLayout(){
    return (
        <div className="relative">
            <Outlet />
            <PomodoroTimer/>
        </div>
    )
}