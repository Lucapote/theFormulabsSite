import { useState, useEffect } from "react";
import IntakePhase from "./IntakePhase";
import EmailPhase from "./EmailPhase";
import BoilingPhase from "./BoilingPhase";
import ResultPhase from "./ResultPhase";

export default function InteractiveDiagnosticForm({ email: initialEmail }) {
  const [phase, setPhase] = useState("intake");
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState(initialEmail || "");

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  return (
    <div className="w-full flex justify-center mt-8 relative z-10 min-h-[400px]">
      {phase === "intake" && (
        <IntakePhase
          onComplete={(a) => {
            setAnswers(a);
            if (email) {
              setPhase("boiling");
            } else {
              setPhase("email");
            }
          }}
        />
      )}
      {phase === "email" && (
        <EmailPhase
          onComplete={(capturedEmail) => {
            setEmail(capturedEmail);
            setPhase("boiling");
          }}
        />
      )}
      {phase === "boiling" && <BoilingPhase answers={answers} onComplete={() => setPhase("result")} />}
      {phase === "result" && (
        <ResultPhase
          answers={answers}
          onReset={() => {
            setAnswers({});
            setPhase("intake");
            if (!initialEmail) {
              setEmail("");
            }
          }}
          email={email}
        />
      )}
    </div>
  );
}
