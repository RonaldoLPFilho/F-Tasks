import { div } from "framer-motion/client";
import { SelectHTMLAttributes } from "react";

interface Option {
    label: string;
    value: string;
}

interface FloatingLabelSelectProps extends SelectHTMLAttributes<HTMLSelectElement>{
    label: string;
    id: string;
    className?: string;
    hasError?: boolean;
    errorMessage?: string;
    options: Option[];
}

export function FloatingLabelSelect({
    label,
    id,
    className,
    hasError = false,
    errorMessage, 
    options,
    ...props
}: FloatingLabelSelectProps){
    const baseBorder = hasError 
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:border-purple-500 focus:ring-purple-500";

    const labelColor = hasError
    ? "peer-focus:text-red-600"
    : "peer-focus:text-purple-600";

    return (
        <div className="relative w-full pt-1">
            <select
                id={id}
                className={`
                    peer w-full rounded-lg border border-gray-300 bg-white px-3 pt-6.5 pb-2 
                    text-sm text-gray-900 placeholder-transparent shadow-sm 
                    focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500
                    ${baseBorder} ${className ?? ""}
                `}
                    defaultValue=""
                    {...props}
            >
                <option value="" disabled hidden>
                    Selecione uma opção
                </option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <label
                htmlFor={id}
                className={`
                        absolute left-3 top-2 text-sm text-gray-500
                        transition-all
                        peer-placeholder-shown:top-4.5
                        peer-placeholder-shown:text-base
                        peer-placeholder-shown:text-gray-400
                        peer-focus:top-2
                        peer-focus:text-sm
                        ${labelColor}
                    `}
            >
                {label}
            </label>
            {hasError && errorMessage &&(
                <p className="mt-1 text-sm text-red-600">{errorMessage }</p>
            )}
        </div>
    )
}