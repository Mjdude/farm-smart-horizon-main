import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ArrowLeft,
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Heart,
    User,
    MapPin,
    Phone,
    Mail,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationFormData {
    // Personal Information
    fullName: string;
    fatherName: string;
    dateOfBirth: string;
    age: number;
    maritalStatus: string;

    // Contact Information
    mobileNumber: string;
    email: string;
    address: string;
    district: string;
    state: string;
    pincode: string;

    // Farm Information
    farmSize: number;
    landOwnership: string;
    cropTypes: string;
    farmingExperience: number;

    // Financial Information
    annualIncome: number;
    bankName: string;
    accountNumber: string;
    ifscCode: string;

    // Additional Information
    hasKCC: boolean;
    hasSHGMembership: boolean;
    previousSchemes: string;

    // Documents
    documents: {
        aadhaar: File | null;
        landRecords: File | null;
        bankPassbook: File | null;
        photograph: File | null;
        other: File | null;
    };

    // Declaration
    declaration: boolean;
}

export const WomenSchemeApplication: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { scheme, farmerProfile } = location.state || {};

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);

    const [formData, setFormData] = useState<ApplicationFormData>({
        fullName: farmerProfile?.name || '',
        fatherName: '',
        dateOfBirth: '',
        age: farmerProfile?.age || 0,
        maritalStatus: farmerProfile?.maritalStatus || '',
        mobileNumber: '',
        email: '',
        address: farmerProfile?.location || '',
        district: '',
        state: '',
        pincode: '',
        farmSize: farmerProfile?.farmSize || 0,
        landOwnership: farmerProfile?.landOwnership || 'owned',
        cropTypes: farmerProfile?.cropTypes?.join(', ') || '',
        farmingExperience: farmerProfile?.farmingExperience || 0,
        annualIncome: farmerProfile?.annualIncome || 0,
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        hasKCC: farmerProfile?.hasKCC || false,
        hasSHGMembership: false,
        previousSchemes: '',
        documents: {
            aadhaar: null,
            landRecords: null,
            bankPassbook: null,
            photograph: null,
            other: null,
        },
        declaration: false,
    });

    if (!scheme) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-16 w-16 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-700">No Scheme Selected</h2>
                <p className="text-gray-600">Please select a scheme from the SheFarms page</p>
                <Button onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const totalSteps = 4;
    const progressPercentage = (currentStep / totalSteps) * 100;

    const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (docType: keyof ApplicationFormData['documents'], file: File | null) => {
        setFormData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [docType]: file,
            },
        }));
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.fullName && formData.dateOfBirth && formData.age);
            case 2:
                return !!(formData.mobileNumber && formData.address && formData.district && formData.state);
            case 3:
                return !!(formData.farmSize && formData.bankName && formData.accountNumber && formData.ifscCode);
            case 4:
                return formData.declaration;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) {
            toast.error('Please fill all required fields');
            return;
        }
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!formData.declaration) {
            toast.error('Please accept the declaration');
            return;
        }

        setIsSubmitting(true);
        setSubmitProgress(0);

        // Simulate application submission
        const steps = [
            'Validating information...',
            'Uploading documents...',
            'Processing application...',
            'Submitting to department...',
            'Application submitted successfully!'
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitProgress(((i + 1) / steps.length) * 100);

            if (i === steps.length - 1) {
                toast.success(`Application for ${scheme.name} submitted successfully!`);
                setTimeout(() => {
                    navigate(-1);
                }, 2000);
            }
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <User className="h-5 w-5 text-pink-500" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fatherName">Father's/Husband's Name</Label>
                                <Input
                                    id="fatherName"
                                    value={formData.fatherName}
                                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                    placeholder="Enter father's/husband's name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age">Age *</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={formData.age || ''}
                                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                                    placeholder="Enter your age"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="maritalStatus">Marital Status</Label>
                                <Input
                                    id="maritalStatus"
                                    value={formData.maritalStatus}
                                    onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                                    placeholder="e.g., Married, Unmarried, Widow"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-pink-500" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                                <Input
                                    id="mobileNumber"
                                    type="tel"
                                    value={formData.mobileNumber}
                                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                                    placeholder="10-digit mobile number"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="address">Complete Address *</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="House No., Street, Village/Town"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">District *</Label>
                                <Input
                                    id="district"
                                    value={formData.district}
                                    onChange={(e) => handleInputChange('district', e.target.value)}
                                    placeholder="Enter district"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    placeholder="Enter state"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                    id="pincode"
                                    value={formData.pincode}
                                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                                    placeholder="6-digit pincode"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-pink-500" />
                            Farm & Financial Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="farmSize">Farm Size (acres) *</Label>
                                <Input
                                    id="farmSize"
                                    type="number"
                                    value={formData.farmSize || ''}
                                    onChange={(e) => handleInputChange('farmSize', parseFloat(e.target.value) || 0)}
                                    placeholder="Enter farm size"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="landOwnership">Land Ownership</Label>
                                <Input
                                    id="landOwnership"
                                    value={formData.landOwnership}
                                    onChange={(e) => handleInputChange('landOwnership', e.target.value)}
                                    placeholder="Owned/Leased/Both"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="cropTypes">Crop Types</Label>
                                <Input
                                    id="cropTypes"
                                    value={formData.cropTypes}
                                    onChange={(e) => handleInputChange('cropTypes', e.target.value)}
                                    placeholder="e.g., Rice, Wheat, Vegetables"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="farmingExperience">Farming Experience (years)</Label>
                                <Input
                                    id="farmingExperience"
                                    type="number"
                                    value={formData.farmingExperience || ''}
                                    onChange={(e) => handleInputChange('farmingExperience', parseInt(e.target.value) || 0)}
                                    placeholder="Years of experience"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="annualIncome">Annual Income (₹)</Label>
                                <Input
                                    id="annualIncome"
                                    type="number"
                                    value={formData.annualIncome || ''}
                                    onChange={(e) => handleInputChange('annualIncome', parseFloat(e.target.value) || 0)}
                                    placeholder="Annual income"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name *</Label>
                                <Input
                                    id="bankName"
                                    value={formData.bankName}
                                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                                    placeholder="Enter bank name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountNumber">Account Number *</Label>
                                <Input
                                    id="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                    placeholder="Bank account number"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ifscCode">IFSC Code *</Label>
                                <Input
                                    id="ifscCode"
                                    value={formData.ifscCode}
                                    onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                                    placeholder="Bank IFSC code"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="hasKCC"
                                            checked={formData.hasKCC}
                                            onCheckedChange={(checked) => handleInputChange('hasKCC', checked)}
                                        />
                                        <Label htmlFor="hasKCC">I have Kisan Credit Card</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="hasSHGMembership"
                                            checked={formData.hasSHGMembership}
                                            onCheckedChange={(checked) => handleInputChange('hasSHGMembership', checked)}
                                        />
                                        <Label htmlFor="hasSHGMembership">I am a member of SHG</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Upload className="h-5 w-5 text-pink-500" />
                            Document Upload & Declaration
                        </h3>

                        <div className="space-y-4">
                            <h4 className="font-medium">Required Documents:</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {scheme.documents.map((doc: string, index: number) => (
                                    <div key={index} className="space-y-2">
                                        <Label>{doc}</Label>
                                        <Input
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                const docKey = doc.toLowerCase().replace(/\s+/g, '') as keyof ApplicationFormData['documents'];
                                                handleFileUpload(docKey, file);
                                            }}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-3">
                            <h4 className="font-semibold text-pink-900">Declaration</h4>
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="declaration"
                                    checked={formData.declaration}
                                    onCheckedChange={(checked) => handleInputChange('declaration', checked)}
                                />
                                <Label htmlFor="declaration" className="text-sm text-gray-700 leading-relaxed">
                                    I hereby declare that all the information provided by me is true and correct to the best of my knowledge.
                                    I understand that any false information may lead to rejection of my application or cancellation of benefits.
                                    I authorize the concerned department to verify the information provided.
                                </Label>
                            </div>
                        </div>

                        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Application Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Scheme:</span>
                                    <span className="font-medium">{scheme.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Applicant:</span>
                                    <span className="font-medium">{formData.fullName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Farm Size:</span>
                                    <span className="font-medium">{formData.farmSize} acres</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-medium">{formData.district}, {formData.state}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">Scheme Application</h1>
                </div>
                <p className="text-pink-100">{scheme.name}</p>
            </div>

            {/* Progress Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Step {currentStep} of {totalSteps}</span>
                            <span>{Math.round(progressPercentage)}% Complete</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Personal Info</span>
                            <span>Contact</span>
                            <span>Farm Details</span>
                            <span>Documents</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Content */}
            <Card>
                <CardContent className="pt-6">
                    {renderStepContent()}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => currentStep === 1 ? navigate(-1) : handlePrevious()}
                    disabled={isSubmitting}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {currentStep === 1 ? 'Cancel' : 'Previous'}
                </Button>

                {currentStep < totalSteps ? (
                    <Button onClick={handleNext} className="bg-pink-500 hover:bg-pink-600">
                        Next
                        <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.declaration || isSubmitting}
                        className="bg-pink-500 hover:bg-pink-600"
                    >
                        {isSubmitting ? (
                            <>
                                <Progress value={submitProgress} className="w-20 h-4 mr-2" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Submit Application
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Scheme Info */}
            <Card className="bg-pink-50 border-pink-200">
                <CardHeader>
                    <CardTitle className="text-lg">Scheme Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700">{scheme.benefits}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Application Deadline: {scheme.applicationDeadline}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
