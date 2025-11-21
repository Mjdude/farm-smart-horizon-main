<<<<<<< HEAD

import React from 'react';
import { Camera, MapPin, Calendar, TrendingUp } from 'lucide-react';

export const CropMonitoring: React.FC = () => {
=======
import React, { useState, useRef } from 'react';
import { Camera, MapPin, Calendar, TrendingUp, Upload, AlertCircle, CheckCircle, Loader, X } from 'lucide-react';

export const CropMonitoring: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
      setShowModal(true);
    }
  };

  const handlePrediction = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPrediction(result);
      } else {
        setError(result.error || 'Prediction failed');
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the API is running.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
    setError(null);
    setShowModal(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

>>>>>>> e2c87b8dc1a5ccccc58e721317455cd0e1d22578
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold font-poppins mb-2">Crop Monitoring System</h1>
        <p className="text-green-100 text-lg">AI-powered crop health analysis and field management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Camera className="text-green-500" size={24} />
<<<<<<< HEAD
            <h3 className="text-lg font-semibold">Photo Analysis</h3>
          </div>
          <p className="text-gray-600 mb-4">Upload crop images for AI-powered disease detection</p>
          <button className="farm-button w-full">Upload Photos</button>
=======
            <h3 className="text-lg font-semibold">Disease Detection</h3>
          </div>
          <p className="text-gray-600 mb-4">Upload crop images for AI-powered disease detection and treatment recommendations</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button 
            onClick={openFileDialog}
            className="farm-button w-full flex items-center justify-center space-x-2"
          >
            <Upload size={20} />
            <span>Upload Crop Photo</span>
          </button>
>>>>>>> e2c87b8dc1a5ccccc58e721317455cd0e1d22578
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold">Field Mapping</h3>
          </div>
<<<<<<< HEAD
          <p className="text-gray-600 mb-4">Interactive maps with crop status indicators</p>
          <button className="farm-button w-full">View Maps</button>
=======
          <p className="text-gray-600 mb-4">Interactive maps with crop status indicators and disease outbreak zones</p>
          <button className="farm-button w-full">View Disease Maps</button>
>>>>>>> e2c87b8dc1a5ccccc58e721317455cd0e1d22578
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="text-purple-500" size={24} />
<<<<<<< HEAD
            <h3 className="text-lg font-semibold">Growth Tracking</h3>
          </div>
          <p className="text-gray-600 mb-4">Monitor crop development and yield predictions</p>
          <button className="farm-button w-full">View Analytics</button>
        </div>
      </div>
    </div>
  );
};
=======
            <h3 className="text-lg font-semibold">Health Analytics</h3>
          </div>
          <p className="text-gray-600 mb-4">Monitor crop health trends, treatment effectiveness, and yield predictions</p>
          <button className="farm-button w-full">View Health Reports</button>
        </div>
      </div>

      {/* Recent Scans Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Health Scans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Placeholder for recent scans - you can populate this with actual data */}
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="text-sm text-gray-500 mb-1">Today, 2:30 PM</div>
            <div className="font-semibold text-green-700">Tomato - Healthy</div>
            <div className="text-sm text-gray-600">Confidence: 94%</div>
          </div>
          <div className="border rounded-lg p-4 bg-yellow-50">
            <div className="text-sm text-gray-500 mb-1">Yesterday, 4:15 PM</div>
            <div className="font-semibold text-yellow-700">Potato - Early Blight</div>
            <div className="text-sm text-gray-600">Confidence: 89%</div>
          </div>
          <div className="border rounded-lg p-4 bg-red-50">
            <div className="text-sm text-gray-500 mb-1">2 days ago, 1:20 PM</div>
            <div className="font-semibold text-red-700">Tomato - Late Blight</div>
            <div className="text-sm text-gray-600">Confidence: 96%</div>
          </div>
        </div>
      </div>

      {/* Disease Detection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Disease Detection Results</h2>
                <button onClick={resetModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {imagePreview && (
                <div className="mb-6 text-center">
                  <img
                    src={imagePreview}
                    alt="Uploaded crop"
                    className="max-w-md max-h-80 mx-auto rounded-lg shadow-md object-contain"
                  />
                </div>
              )}

              {!prediction && !loading && (
                <div className="text-center mb-6">
                  <button
                    onClick={handlePrediction}
                    disabled={loading}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Analyze Crop Health
                  </button>
                </div>
              )}

              {loading && (
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="animate-spin text-green-600" size={24} />
                    <span className="text-lg font-medium text-gray-700">Analyzing crop health...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="text-red-500 mr-2" size={20} />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {prediction && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="text-green-500 mr-2" size={24} />
                      <h3 className="text-xl font-semibold">Analysis Complete</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Detected Condition:</h4>
                        <p className="text-lg font-bold text-gray-900 mb-4">
                          {prediction.disease.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        
                        <h4 className="font-semibold text-gray-700 mb-2">Confidence Level:</h4>
                        <div className="flex items-center mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-3 mr-3">
                            <div
                              className={`h-3 rounded-full ${
                                prediction.confidence > 80 ? 'bg-green-500' :
                                prediction.confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${prediction.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {prediction.confidence}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Recommended Treatment:</h4>
                        <p className="text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg">
                          {prediction.treatment}
                        </p>
                        
                        {prediction.recommendations && (
                          <>
                            <h4 className="font-semibold text-gray-700 mb-2">Additional Steps:</h4>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                              {prediction.recommendations.map((rec: string, index: number) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={resetModal}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Save to History
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
>>>>>>> e2c87b8dc1a5ccccc58e721317455cd0e1d22578
