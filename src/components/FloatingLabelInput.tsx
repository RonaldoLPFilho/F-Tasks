import { useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  className?: string;
  showPasswordToggle?: boolean;
  hasError? : boolean;
  errorMessage?: string
}

export function FloatingLabelInput({
  label,
  id,
  className,
  showPasswordToggle = false,
  type = "text",
  hasError = false,
  errorMessage,
  ...props
}: FloatingLabelInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;

  const baseBorder = hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-purple-500 focus:ring-purple-500";
  const labelColor = hasError ? "peer-focus:text-red-600" : "peer-focus:text-purple-600";

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={inputType}
        placeholder=" "
        className={`
          peer w-full rounded-lg border border-gray-300 bg-white px-3 pt-6.5 pb-2 
          text-sm text-gray-900 placeholder-transparent shadow-sm 
          focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500
          ${baseBorder}
          ${className ?? ""}
        `}
        {...props}
      />
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

      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700"
          tabIndex={-1}
          aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
      {hasError && errorMessage &&(
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );  
}
