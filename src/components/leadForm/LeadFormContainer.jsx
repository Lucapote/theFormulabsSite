import { useState, useRef } from "react";
import { LEAD_FORM_STEPS } from "@/data/leadFormData";
import LeadFormProgress from "./LeadFormProgress";
import LeadQuestionCard from "./LeadQuestionCard";
import LeadContactCard from "./LeadContactCard";
import LeadSuccessCard from "./LeadSuccessCard";
import { submitLeadForm } from "@/services/leadService";

export default function LeadFormContainer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    objetivo: null,
    nicho: null,
    operacion: null,
    gestion: null,
    inversion: null
  });
  const [contactData, setContactData] = useState({
    nombre: "",
    instagram: "",
    whatsapp: "",
    ubicacion: "",
    cuando_iniciar: ""
  });
  const [bubbling, setBubbling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const containerRef = useRef(null);

  const scrollToTop = () => {
    // Evitar salto hacia abajo: solo hacer scroll al tope si la página realmente ha bajado
    if (typeof window !== "undefined" && window.scrollY > 80) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const triggerBubbleReaction = () => {
    setBubbling(true);
    setTimeout(() => setBubbling(false), 700);
  };

  const handleSelectOption = (questionKey, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: option
    }));
    triggerBubbleReaction();

    // Auto-advance after brief visual touch
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      scrollToTop();
    }, 240);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      scrollToTop();
    }
  };

  const handleChangeContact = (field, value) => {
    setContactData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmitContact = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitLeadForm({ answers, contactData });

    setIsSubmitting(false);
    if (res.success) {
      triggerBubbleReaction();
      setCurrentStep(7); // 7 is success state
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErrorMessage(res.error || "No se pudo procesar tu respuesta. Por favor intenta de nuevo.");
    }
  };

  const handleReset = () => {
    setAnswers({
      objetivo: null,
      nicho: null,
      operacion: null,
      gestion: null,
      inversion: null
    });
    setContactData({
      nombre: "",
      instagram: "",
      whatsapp: "",
      ubicacion: "",
      cuando_iniciar: ""
    });
    setCurrentStep(1);
    setErrorMessage(null);
    scrollToTop();
  };

  const activeQuestionConfig = LEAD_FORM_STEPS.find((q) => q.stepNumber === currentStep);

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-6">
      {/* Progress Tube & Steps Header (Steps 1 to 6) */}
      {currentStep <= 6 && (
        <LeadFormProgress
          currentStep={currentStep}
          totalSteps={6}
          bubbling={bubbling}
          onBack={currentStep > 1 ? handlePrevStep : null}
        />
      )}

      {/* Dynamic Question Card (Steps 1 to 5) */}
      {currentStep <= 5 && activeQuestionConfig && (
        <LeadQuestionCard
          question={activeQuestionConfig}
          selectedOption={answers[activeQuestionConfig.id]}
          onSelectOption={(opt) => handleSelectOption(activeQuestionConfig.id, opt)}
        />
      )}

      {/* Contact Screen (Step 6) */}
      {currentStep === 6 && (
        <LeadContactCard
          contactData={contactData}
          onChangeContact={handleChangeContact}
          onSubmit={handleSubmitContact}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      )}

      {/* Thank you / Success Screen (Step 7) */}
      {currentStep === 7 && (
        <LeadSuccessCard contactData={contactData} />
      )}
    </div>
  );
}
