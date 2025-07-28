import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getUserPomodoroPreferences } from "../services/PomodoroService";
import { PomodoroPreferences } from "../types/PomodoroPreferences";
import { BellRing, Cog, Pause, Play, RotateCw, Timer } from "lucide-react";
import clsx from "clsx";

export function PomodoroTimer(){

    const [preferences, setPreferences] = useState<PomodoroPreferences | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSession, setIsSession] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [alarmPlaying, setAlarmPlaying] = useState(false);

    const intervalRef = useRef<number| null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const location = useLocation();
    const hideOnRoutes =["/login", "/register", "/reset-password"]

    if(hideOnRoutes.includes(location.pathname)) return null;

    useEffect(() => {
        getUserPomodoroPreferences()
            .then((prefs) => {
                setPreferences(prefs);
                setTimeLeft(prefs.sessionDuration * 60);
            })
            .catch((err) => console.error("Erro ao buscar prefs pomodoro", err));
    }, []);

    useEffect(() => {
        if (isRunning && timeLeft > 0){
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(intervalRef.current!);
    }, [isRunning, timeLeft])

    useEffect(() => {
        if(timeLeft === 0 && isRunning && preferences){
            playAlarm();
        }
    }, [timeLeft, isRunning, preferences])

    const formatTime = (seconds: number) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        return `${m}:${s}`;
    }

    const playAlarm = () => {
        const url = `http://localhost:8080/alarms/${preferences?.alarmSound}`;
        audioRef.current = new Audio(url);
        audioRef.current.loop = true;
        audioRef.current.play();
        setAlarmPlaying(true);
        setIsRunning(false);
    }

    const stopAlarmAndSwitch = () => {
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
        audioRef.current!.loop = false; 
        setAlarmPlaying(false);

        if(!preferences) return;

        const nextIsSession = !isSession;
        setIsSession(nextIsSession);
        setTimeLeft(
            (nextIsSession ? preferences.sessionDuration : preferences.breakDuration) * 60
        );
        setIsRunning(true);
    }

    const toggleRunning = () => {
        if(!preferences) return;

        setIsRunning((prev) => !prev );
    }

    const reset = () => {
        if (!preferences) return;

        setIsRunning(false);
        setTimeLeft((isSession ? preferences.sessionDuration : preferences.breakDuration) * 60)
    }

    if(!preferences) return null;

    return (
        <div className="fixed bottom-6 left-6 bg-white rounded-2xl shadow-md p-6 w-[300px] text-center space-y-2 z-50">
            <div className="flex justify-between items-center text-gray-600 font-semibold mb-4">
                <span className="flex items-center gap-1">
                    <Timer size={30}/> {isSession ? "Sessão" : "Pausa"}
                </span>
                {/* <button className="hover:opacity-70 transition-all">
                    <span className="sr-only">Configurações</span> <Cog size={30} className="cursor-pointer"/>
                </button> */}
            </div>
            
            <h2 className="text-3xl font-bold text-purple-600">{formatTime(timeLeft)}</h2>

            <div className="flex justify-between mt-4">
                {alarmPlaying ? (
                    <button
                        onClick={stopAlarmAndSwitch}
                        className={clsx(
                            "w-full flex justify-center bg-purple-500 text-white-600 animate-bounce p-2 rounded-lg",
                            "hover:scale-105 transition-transform"
                        )}
                    >
                        <BellRing  size={30}/>
                    </button>
                ) : (
                    <div className="flex w-full text-center">
                        <button
                            onClick={toggleRunning}
                            className="bg-purple-500  text-white p-2 rounded-lg w-full hover:bg-purple-600 transition flex items-center justify-center"
                        >
                            {isRunning ? <Pause size={20}/> : <Play size={20}/>}
                        </button>
                    </div>

                )}
                <button
                    onClick={reset}
                    className="bg-white border border-gray-300 p-2 ml-2 rounded-lg hover:bg-gray-50"
                >
                    <RotateCw size={16}/>
                </button>
            </div>
        </div>
    )
}