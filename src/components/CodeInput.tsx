import { ReactHTMLElement, useEffect, useRef, useState } from "react"

interface CodeInputProps{
    onCodeComplete?: (code: string) => void;
    maxLength?: number;
}

const CodeInput: React.FC<CodeInputProps> = ({onCodeComplete, maxLength = 6}) => {
    const [code, setCode] = useState(Array(maxLength).fill(''));
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, [])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if(value && index < maxLength -1){
            inputRefs.current[index + 1]?.focus();
        }

        if(newCode.every(digit => digit !== '') && onCodeComplete){
            onCodeComplete(newCode.join(''));
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Backspace'){
            if(code[index] === '' && index > 0){
                inputRefs.current[index - 1]?.focus();
            }else {
                const newCode = [...code];
                newCode[index] = '';
                setCode(newCode)
            }
        }
        if(e.key === "ArrowLeft" && index > 0 ){
            inputRefs.current[index -1]?.focus();
        }
        if(e.key ==="ArrowRight" && index < maxLength - 1){
            inputRefs.current[index + 1]?.focus();
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        const pastedData = e.clipboardData.getData('text');
        const digits =  pastedData.replace(/\D/g, '').slice(0, maxLength);

        const newCode = Array(maxLength).fill('');
        for(let i = 0; i < digits.length; i++){
            newCode[i] = digits[i];
        }
        setCode(newCode);
    
        const nextEmptyIndex = newCode.findIndex((digit) => digit === '');
        const focusIndex = nextEmptyIndex === -1 ? maxLength -1 : nextEmptyIndex;
        
        inputRefs.current[focusIndex]?.focus();

        if (newCode.every((digit) => digit !== '') && onCodeComplete) {
            onCodeComplete(newCode.join(''));
        }
    };

    return (
        <div className=" p-2 bg-gray-50 rounded-xl">
            <p className="text-xl">Código: </p>
            <div className="flex justify-center">
            {code.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 h-10 text-center border-1 border-black m-3 text-purple-600 font-bold"
                />
            ))}
            </div>
        </div>
    )
}

export default CodeInput;