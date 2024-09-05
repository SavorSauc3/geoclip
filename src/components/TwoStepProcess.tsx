import React, { useState } from 'react';
import { ProgressBar, Button } from 'react-bootstrap';
import FileUploadStep from './FileUploadStep';
import MapStep from './MapStep';

const TwoStepProcess: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [locations, setLocations] = useState<{ latitude: number; longitude: number; confidence: number }[]>([]);

    const nextStep = () => setStep((prevStep) => Math.min(prevStep + 1, 2));
    const prevStep = () => setStep((prevStep) => Math.max(prevStep - 1, 1));

    const handleNextStep = (locationsData: { latitude: number; longitude: number; confidence: number }[]) => {
        setLocations(locationsData);
        nextStep();
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <FileUploadStep onNext={handleNextStep} />;
            case 2:
                return <MapStep locations={locations} />;
            default:
                return null;
        }
    };

    return (
        <div className="container mt-5">
            <ProgressBar now={(step / 2) * 100} animated label={`${(step / 2) * 100}%`} />
            <div className="mt-4">
                {renderStepContent()}
            </div>
            <div className="mt-4 d-flex justify-content-between">
                <Button variant="secondary" onClick={prevStep} disabled={step === 1}>
                    Previous
                </Button>
                <Button variant="primary" onClick={nextStep} disabled={step === 2}>
                    Next
                </Button>
            </div>
        </div>
    );
};

export default TwoStepProcess;
