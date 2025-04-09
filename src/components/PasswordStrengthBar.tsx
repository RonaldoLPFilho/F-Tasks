interface Props {
  password: string;
}

const strengthColors = ["bg-red-500", "bg-yellow-400", "bg-green-500"];
const strengthLabels = ["Fraca", "Média", "Forte"] 

function calculateStrength(password: string): number {
  let score = 0;
  if (password.length > 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  return Math.min(score, 2); 
}

export function PasswordStrengthBar({ password }: Props) {
  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded transition-colors duration-300 ${
              i <= strength ? strengthColors[strength] : "bg-gray-300"
            }`}
          />
        ))}
      </div>
      <p className={`text-sm text-gray-500 mt-2 mb-2`}>
        Senha: {strengthLabels[strength]}
      </p>
    </div>
    
  );
}
