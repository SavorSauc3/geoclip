import React, { useState, useCallback } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';

interface FileUploadStepProps {
    onNext: (locations: { latitude: number; longitude: number; confidence: number }[]) => void;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({ onNext }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // New state for loading

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            if (selectedFile.type.startsWith('image/')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError("Only image files are allowed.");
                setFile(null);
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': []
        },
        maxFiles: 1,
    });

    const handleSubmit = async () => {
        if (file) {
            setLoading(true); // Start the loading spinner
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://127.0.0.1:8000/predict-locations/', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    const locations = data.predictions;
                    onNext(locations);
                } else {
                    setError("Failed to upload image or process inference.");
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                setError("An error occurred during file upload.");
            } finally {
                setLoading(false); // Stop the loading spinner
            }
        } else {
            alert("Please select a file before proceeding.");
        }
    };

    return (
        <div className="d-flex flex-column align-items-center">
            <h3 className="mb-4">Step 1: Upload an Image File</h3>
            <div 
                {...getRootProps()} 
                className={`p-5 border border-2 rounded ${isDragActive ? 'bg-light' : ''}`}
                style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', textAlign: 'center', cursor: 'pointer' }}
            >
                <input {...getInputProps()} />
                {
                    isDragActive ? 
                    <p>Drop the files here...</p> :
                    <p>Drag & drop an image file here, or click to select one</p>
                }
            </div>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {file && <Alert variant="success" className="mt-3">Selected file: {file.name}</Alert>}
            {loading && (
                <Spinner animation="border" role="status" className="mt-4">
                    <span className="visually-hidden">Uploading...</span>
                </Spinner>
            )}
            <Button 
                variant="primary" 
                onClick={handleSubmit} 
                className="mt-4"
                disabled={!file || loading} // Disable button if loading
            >
                {loading ? 'Uploading...' : 'Upload'} {/* Change button text during upload */}
            </Button>
        </div>
    );
};

export default FileUploadStep;
