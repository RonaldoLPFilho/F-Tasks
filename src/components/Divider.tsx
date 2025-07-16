interface DividerProps{
    text?: string;
    className?: string;
}

export function Divider({text, className = ""}: DividerProps){
    return(
        <div className={`flex items-center w-full my-4 ${className}`}>
            <div className="flex-grow border-t border-gray-300">
                {text && (
                    <span className="mx-4 text-sm text-gray-500 whitespace-nowtap">{text}</span>
                )}
                <div className="flex-grow border-t border-gray-300"/>
            </div>
        </div>
    );
}