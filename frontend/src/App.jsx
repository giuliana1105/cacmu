import { useState } from 'react';
import UploadScreen from './components/UploadScreen';
import FieldSelector from './components/FieldSelector';
import DataTable from './components/DataTable';
import Header from './components/Header';
import './App.css';

function App() {
    const [currentStep, setCurrentStep] = useState(1);
    const [excelData, setExcelData] = useState(null);
    const [columns, setColumns] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [fileName, setFileName] = useState('');

    const handleFileLoaded = (data, cols, name) => {
        setExcelData(data);
        setColumns(cols);
        setFileName(name);
        setCurrentStep(2);
    };

    const handleFieldsSelected = (fields) => {
        setSelectedFields(fields);
        setCurrentStep(3);
    };

    const handleBack = () => {
        if (currentStep === 3) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(1);
            setExcelData(null);
            setColumns([]);
            setSelectedFields([]);
            setFileName('');
        }
    };

    const handleReset = () => {
        setCurrentStep(1);
        setExcelData(null);
        setColumns([]);
        setSelectedFields([]);
        setFileName('');
    };

    return (
        <div className="app-container">
            <Header
                currentStep={currentStep}
                fileName={fileName}
                onReset={handleReset}
            />

            <main className="app-main">
                <StepIndicator currentStep={currentStep} />

                <div className="screen-wrapper">
                    {currentStep === 1 && (
                        <UploadScreen onFileLoaded={handleFileLoaded} />
                    )}
                    {currentStep === 2 && (
                        <FieldSelector
                            columns={columns}
                            onAccept={handleFieldsSelected}
                            onBack={handleBack}
                        />
                    )}
                    {currentStep === 3 && (
                        <DataTable
                            data={excelData}
                            selectedFields={selectedFields}
                            columns={columns}
                            fileName={fileName}
                            onBack={handleBack}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

function StepIndicator({ currentStep }) {
    const steps = [
        { num: 1, label: 'Cargar Archivo', icon: '📁' },
        { num: 2, label: 'Seleccionar Campos', icon: '✅' },
        { num: 3, label: 'Ver Resultados', icon: '📊' },
    ];

    return (
        <div className="step-indicator">
            {steps.map((step, index) => (
                <div key={step.num} className="step-item-wrapper">
                    <div
                        className={`step-item ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''
                            }`}
                    >
                        <div className="step-circle">
                            {currentStep > step.num ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : (
                                <span>{step.num}</span>
                            )}
                        </div>
                        <span className="step-label">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`step-connector ${currentStep > step.num ? 'completed' : ''}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export default App;