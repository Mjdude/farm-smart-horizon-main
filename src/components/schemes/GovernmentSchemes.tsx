import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, FileText, MapPin, DollarSign, Users, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Scheme {
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

interface FarmerProfile {
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
}

const mockSchemes: Scheme[] = [
  {
    id: '1',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    description: 'Income support scheme providing ₹6000 per year to small and marginal farmers',
    eligibility: ['Small & Marginal farmers', 'Land holding up to 2 hectares', 'Valid Aadhaar card'],
    benefits: '₹6000 per year in 3 installments of ₹2000 each',
    applicationDeadline: '2024-12-31',
    category: 'Income Support',
    matchScore: 95,
    status: 'eligible',
    documents: ['Aadhaar Card', 'Bank Account Details', 'Land Records', 'Mobile Number'],
    applicationUrl: 'https://pmkisan.gov.in'
  },
  {
    id: '2',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Crop insurance scheme providing financial support against crop loss',
    eligibility: ['All farmers', 'Enrolled crops', 'Premium payment within deadline'],
    benefits: 'Up to 100% sum insured for crop losses',
    applicationDeadline: '2024-11-30',
    category: 'Insurance',
    matchScore: 88,
    status: 'eligible',
    documents: ['Aadhaar Card', 'Bank Account', 'Land Records', 'Sowing Certificate'],
    applicationUrl: 'https://pmfby.gov.in'
  },
  {
    id: '3',
    name: 'Kisan Credit Card (KCC)',
    description: 'Credit facility for farmers to meet their agricultural needs',
    eligibility: ['All farmers', 'Valid land documents', 'Good credit history'],
    benefits: 'Credit up to ₹3 lakh at 7% interest rate',
    applicationDeadline: 'Ongoing',
    category: 'Credit',
    matchScore: 82,
    status: 'eligible',
    documents: ['Aadhaar Card', 'PAN Card', 'Land Documents', 'Income Certificate'],
    applicationUrl: 'https://kcc.gov.in'
  },
  {
    id: '4',
    name: 'Soil Health Card Scheme',
    description: 'Free soil testing and recommendations for optimal crop productivity',
    eligibility: ['All farmers', 'Valid land records'],
    benefits: 'Free soil testing and nutrient recommendations',
    applicationDeadline: 'Ongoing',
    category: 'Agricultural Support',
    matchScore: 90,
    status: 'eligible',
    documents: ['Land Records', 'Aadhaar Card', 'Mobile Number']
  },
  {
    id: '5',
    name: 'National Mission for Sustainable Agriculture',
    description: 'Promoting sustainable farming practices and climate resilience',
    eligibility: ['Progressive farmers', 'Adoption of sustainable practices', 'Group formation'],
    benefits: 'Subsidies up to 50% for sustainable farming equipment',
    applicationDeadline: '2024-12-15',
    category: 'Sustainability',
    matchScore: 75,
    status: 'partially-eligible',
    documents: ['Group Certificate', 'Project Proposal', 'Land Records', 'Bank Account']
  }
];

export const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState<Scheme[]>(mockSchemes);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>({
    name: '',
    location: '',
    farmSize: 0,
    cropTypes: [],
    farmingExperience: 0,
    annualIncome: 0,
    landOwnership: 'owned',
    category: 'small',
    hasKCC: false,
    bankAccount: true
  });
  const [profileComplete, setProfileComplete] = useState(false);
  const [applicationProgress, setApplicationProgress] = useState<{[key: string]: number}>({});
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

  const calculateMatchScore = (scheme: Scheme, profile: FarmerProfile): number => {
    let score = 70; // Base score

    // Farm size matching
    if (scheme.eligibility.some(e => e.includes('Small & Marginal')) && profile.category === 'small') {
      score += 20;
    }

    // KCC matching
    if (scheme.name.includes('Credit') && !profile.hasKCC) {
      score += 15;
    }

    // Income matching
    if (profile.annualIncome < 200000 && scheme.category === 'Income Support') {
      score += 10;
    }

    // Experience matching
    if (profile.farmingExperience > 5 && scheme.category === 'Sustainability') {
      score += 5;
    }

    return Math.min(score, 100);
  };

  const handleSmartApply = async (scheme: Scheme) => {
    if (!profileComplete) {
      toast.error('Please complete your farmer profile first');
      return;
    }

    setApplicationProgress(prev => ({ ...prev, [scheme.id]: 0 }));
    
    // Simulate application process
    const steps = [
      'Validating eligibility...',
      'Preparing documents...',
      'Submitting application...',
      'Processing...',
      'Application submitted successfully!'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApplicationProgress(prev => ({ ...prev, [scheme.id]: ((i + 1) / steps.length) * 100 }));
      
      if (i === steps.length - 1) {
        toast.success(`Application for ${scheme.name} submitted successfully!`);
        setTimeout(() => {
          setApplicationProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[scheme.id];
            return newProgress;
          });
        }, 2000);
      }
    }
  };

  const filteredSchemes = filterCategory === 'all' 
    ? schemes 
    : schemes.filter(scheme => scheme.category === filterCategory);

  const categories = ['all', ...Array.from(new Set(schemes.map(s => s.category)))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Government Schemes</h1>
          <p className="text-gray-600 mt-2">AI-powered scheme recommendations based on your profile</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Update Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Farmer Profile</DialogTitle>
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
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!profileComplete && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-orange-800 font-medium">Complete your profile for better recommendations</p>
              <p className="text-orange-600 text-sm">Update your farmer profile to get AI-powered scheme suggestions</p>
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
          <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{scheme.name}</CardTitle>
                    <Badge 
                      variant={scheme.status === 'eligible' ? 'default' : 
                              scheme.status === 'partially-eligible' ? 'secondary' : 'destructive'}
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
                          <Badge>{scheme.category}</Badge>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {applicationProgress[scheme.id] !== undefined ? (
                    <div className="flex items-center gap-2 min-w-32">
                      <Progress value={applicationProgress[scheme.id]} className="flex-1" />
                      <span className="text-sm">{Math.round(applicationProgress[scheme.id])}%</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleSmartApply(scheme)}
                      disabled={!profileComplete}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Smart Apply
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Benefits: {scheme.benefits.substring(0, 30)}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">Deadline: {scheme.applicationDeadline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Status: {scheme.status.replace('-', ' ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
