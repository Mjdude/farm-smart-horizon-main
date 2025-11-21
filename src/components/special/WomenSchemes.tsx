import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, FileText, DollarSign, Users, Zap, AlertCircle, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface WomenScheme {
    id: string;
    name: string;
    description: string;
    eligibility: string[];
    benefits: string;
    applicationDeadline: string;
    category: string;
    matchScore: number;
    status: 'eligible' | 'partially-eligible' | 'not-eligible';
    documents: string[];
    applicationUrl?: string;
}

interface WomenFarmerProfile {
    name: string;
    location: string;
    farmSize: number;
    cropTypes: string[];
    farmingExperience: number;
    annualIncome: number;
    landOwnership: 'owned' | 'leased' | 'both';
    category: 'small' | 'marginal' | 'medium' | 'large';
    hasKCC: boolean;
    bankAccount: boolean;
    age: number;
    education: string;
    maritalStatus: string;
}

const mockWomenSchemes: WomenScheme[] = [
    {
        id: '1',
        name: 'Mahila Kisan Sashaktikaran Pariyojana (MKSP)',
        description: 'Empowerment scheme for women farmers through sustainable agriculture practices and skill development',
        eligibility: ['Women farmers', 'Age 18-60 years', 'Valid Aadhaar card', 'Land ownership or lease agreement'],
        benefits: 'Training, tools, and financial support up to ₹50,000 for sustainable farming',
        applicationDeadline: '2024-12-31',
        category: 'Empowerment',
        matchScore: 95,
        status: 'eligible',
        documents: ['Aadhaar Card', 'Bank Account Details', 'Land Records', 'Age Proof', 'Photograph'],
        applicationUrl: 'https://mksp.gov.in'
    },
    {
        id: '2',
        name: 'Women Farmer Entitlement (WFE)',
        description: 'Direct income support for women farmers with land holdings',
        eligibility: ['Women land owners', 'Small & Marginal farmers', 'Valid bank account'],
        benefits: '₹8000 per year in 4 installments of ₹2000 each',
        applicationDeadline: '2024-11-30',
        category: 'Income Support',
        matchScore: 92,
        status: 'eligible',
        documents: ['Aadhaar Card', 'Bank Account', 'Land Records', 'Mobile Number'],
        applicationUrl: 'https://wfe.gov.in'
    },
    {
        id: '3',
        name: 'National Rural Livelihood Mission - Women SHG',
        description: 'Support for women Self Help Groups in agricultural activities',
        eligibility: ['Women SHG members', 'Rural areas', 'Group formation certificate'],
        benefits: 'Revolving fund up to ₹1.5 lakh and credit linkage support',
        applicationDeadline: 'Ongoing',
        category: 'Group Support',
        matchScore: 88,
        status: 'eligible',
        documents: ['SHG Certificate', 'Member List', 'Bank Account', 'Project Proposal'],
        applicationUrl: 'https://nrlm.gov.in'
    },
    {
        id: '4',
        name: 'Women Agri-Entrepreneurship Development',
        description: 'Financial and technical support for women starting agri-businesses',
        eligibility: ['Women entrepreneurs', 'Age 21-55 years', 'Business plan', 'Basic education'],
        benefits: 'Subsidy up to 35% on project cost, maximum ₹10 lakh',
        applicationDeadline: '2024-12-15',
        category: 'Entrepreneurship',
        matchScore: 85,
        status: 'eligible',
        documents: ['Aadhaar Card', 'PAN Card', 'Business Plan', 'Educational Certificate', 'Bank Account'],
    },
    {
        id: '5',
        name: 'Organic Farming Promotion for Women',
        description: 'Special scheme promoting organic farming practices among women farmers',
        eligibility: ['Women farmers', 'Commitment to organic farming', 'Minimum 1 acre land'],
        benefits: 'Certification support, training, and ₹30,000 per acre for 3 years',
        applicationDeadline: '2024-11-25',
        category: 'Organic Farming',
        matchScore: 80,
        status: 'partially-eligible',
        documents: ['Land Records', 'Aadhaar Card', 'Organic Farming Commitment Letter', 'Bank Account'],
    },
    {
        id: '6',
        name: 'Women Dairy Farming Support Scheme',
        description: 'Support for women in dairy farming and milk production',
        eligibility: ['Women farmers', 'Interest in dairy farming', 'Space for cattle'],
        benefits: 'Subsidy up to 50% on cattle purchase, maximum ₹2 lakh',
        applicationDeadline: 'Ongoing',
        category: 'Livestock',
        matchScore: 78,
        status: 'eligible',
        documents: ['Aadhaar Card', 'Bank Account', 'Veterinary Certificate', 'Space Proof'],
    }
];

export const WomenSchemes: React.FC = () => {
    const navigate = useNavigate();
    const [schemes, setSchemes] = useState<WomenScheme[]>(mockWomenSchemes);
    const [selectedScheme, setSelectedScheme] = useState<WomenScheme | null>(null);
    const [farmerProfile, setFarmerProfile] = useState<WomenFarmerProfile>({
        name: '',
        location: '',
        farmSize: 0,
        cropTypes: [],
        farmingExperience: 0,
        annualIncome: 0,
        landOwnership: 'owned',
        category: 'small',
        hasKCC: false,
        bankAccount: true,
        age: 0,
        education: '',
        maritalStatus: ''
    });
    const [profileComplete, setProfileComplete] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('all');

    useEffect(() => {
        // Check if profile is complete
        const isComplete = farmerProfile.name && farmerProfile.location && farmerProfile.farmSize > 0;
        setProfileComplete(isComplete);

        if (isComplete) {
            // Recalculate match scores based on profile
            const updatedSchemes = schemes.map(scheme => ({
                ...scheme,
                matchScore: calculateMatchScore(scheme, farmerProfile)
            })).sort((a, b) => b.matchScore - a.matchScore);
            setSchemes(updatedSchemes);
        }
    }, [farmerProfile]);

    const calculateMatchScore = (scheme: WomenScheme, profile: WomenFarmerProfile): number => {
        let score = 70; // Base score

        // Farm size matching
        if (scheme.eligibility.some(e => e.includes('Small & Marginal')) && profile.category === 'small') {
            score += 15;
        }

        // Income matching
        if (profile.annualIncome < 200000 && scheme.category === 'Income Support') {
            score += 10;
        }

        // Experience matching
        if (profile.farmingExperience > 3 && scheme.category === 'Empowerment') {
            score += 10;
        }

        // Age matching
        if (profile.age >= 18 && profile.age <= 60) {
            score += 5;
        }

        return Math.min(score, 100);
    };

    const handleEasyApply = (scheme: WomenScheme) => {
        if (!profileComplete) {
            toast.error('Please complete your farmer profile first');
            return;
        }

        // Navigate to application page with scheme data
        navigate('/women-scheme-application', { state: { scheme, farmerProfile } });
    };

    const filteredSchemes = filterCategory === 'all'
        ? schemes
        : schemes.filter(scheme => scheme.category === filterCategory);

    const categories = ['all', ...Array.from(new Set(schemes.map(s => s.category)))];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="h-8 w-8" />
                    <h1 className="text-3xl font-bold font-poppins">SheFarms - Women Empowerment Schemes</h1>
                </div>
                <p className="text-pink-100 text-lg">Dedicated schemes and support for women farmers across India</p>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Available Schemes for Women Farmers</h2>
                    <p className="text-gray-600 mt-2">AI-powered scheme recommendations based on your profile</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Update Profile
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Women Farmer Profile</DialogTitle>
                            <DialogDescription>
                                Complete your profile to get personalized scheme recommendations
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={farmerProfile.name}
                                    onChange={(e) => setFarmerProfile(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={farmerProfile.location}
                                    onChange={(e) => setFarmerProfile(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="Village, District, State"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={farmerProfile.age || ''}
                                    onChange={(e) => setFarmerProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                                    placeholder="Enter your age"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="farmSize">Farm Size (acres)</Label>
                                <Input
                                    id="farmSize"
                                    type="number"
                                    value={farmerProfile.farmSize || ''}
                                    onChange={(e) => setFarmerProfile(prev => ({ ...prev, farmSize: parseFloat(e.target.value) || 0 }))}
                                    placeholder="Enter farm size"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Farming Experience (years)</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    value={farmerProfile.farmingExperience || ''}
                                    onChange={(e) => setFarmerProfile(prev => ({ ...prev, farmingExperience: parseInt(e.target.value) || 0 }))}
                                    placeholder="Years of experience"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="income">Annual Income (₹)</Label>
                                <Input
                                    id="income"
                                    type="number"
                                    value={farmerProfile.annualIncome || ''}
                                    onChange={(e) => setFarmerProfile(prev => ({ ...prev, annualIncome: parseFloat(e.target.value) || 0 }))}
                                    placeholder="Annual income"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Farmer Category</Label>
                                <Select
                                    value={farmerProfile.category}
                                    onValueChange={(value: 'small' | 'marginal' | 'medium' | 'large') =>
                                        setFarmerProfile(prev => ({ ...prev, category: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="marginal">Marginal Farmer (&lt;1 acre)</SelectItem>
                                        <SelectItem value="small">Small Farmer (1-2 acres)</SelectItem>
                                        <SelectItem value="medium">Medium Farmer (2-10 acres)</SelectItem>
                                        <SelectItem value="large">Large Farmer (&gt;10 acres)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="education">Education</Label>
                                <Input
                                    id="education"
                                    value={farmerProfile.education}
                                    onChange={(e) => setFarmerProfile(prev => ({ ...prev, education: e.target.value }))}
                                    placeholder="Highest education level"
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {!profileComplete && (
                <Card className="border-pink-200 bg-pink-50">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <AlertCircle className="h-5 w-5 text-pink-600" />
                        <div>
                            <p className="text-pink-800 font-medium">Complete your profile for better recommendations</p>
                            <p className="text-pink-600 text-sm">Update your farmer profile to get AI-powered scheme suggestions</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-4 items-center">
                <Label>Filter by Category:</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6">
                {filteredSchemes.map((scheme) => (
                    <Card key={scheme.id} className="hover:shadow-lg transition-shadow border-pink-100">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CardTitle className="text-xl">{scheme.name}</CardTitle>
                                        <Badge
                                            variant={scheme.status === 'eligible' ? 'default' :
                                                scheme.status === 'partially-eligible' ? 'secondary' : 'destructive'}
                                            className="bg-pink-500"
                                        >
                                            {scheme.matchScore}% Match
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-base">{scheme.description}</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedScheme(scheme)}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>{scheme.name}</DialogTitle>
                                                <DialogDescription>{scheme.description}</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2">Eligibility Criteria:</h4>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {scheme.eligibility.map((criteria, index) => (
                                                            <li key={index} className="text-sm text-gray-600">{criteria}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-2">Benefits:</h4>
                                                    <p className="text-sm text-gray-600">{scheme.benefits}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-2">Required Documents:</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {scheme.documents.map((doc, index) => (
                                                            <Badge key={index} variant="outline">{doc}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        Deadline: {scheme.applicationDeadline}
                                                    </div>
                                                    <Badge className="bg-pink-500">{scheme.category}</Badge>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        className="bg-pink-500 hover:bg-pink-600"
                                        onClick={() => handleEasyApply(scheme)}
                                    >
                                        <Zap className="h-4 w-4 mr-2" />
                                        Easy Apply
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-green-600">
                                        <DollarSign className="h-4 w-4" />
                                        <span>{scheme.benefits.substring(0, 50)}...</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>Deadline: {scheme.applicationDeadline}</span>
                                </div>
                            </div>
                            {profileComplete && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Match Score</span>
                                        <span className="text-sm font-semibold text-pink-600">{scheme.matchScore}%</span>
                                    </div>
                                    <Progress value={scheme.matchScore} className="h-2" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
