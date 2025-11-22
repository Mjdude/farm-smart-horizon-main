import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
    Heart,
    Activity,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Video,
    Stethoscope,
    Apple,
    Droplet,
    Sun,
    Moon,
    Utensils
} from 'lucide-react';
import { toast } from 'sonner';
import { AdUnit } from '@/components/ui/ad-unit';

interface HealthData {
    age: number;
    weight: number;
    height: number;
    bloodPressure: string;
    lastCheckup: string;
    chronicConditions: string[];
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
    sleepHours: number;
    waterIntake: number;
}

interface HealthAssessment {
    bmi: number;
    bmiCategory: string;
    healthScore: number;
    riskLevel: 'low' | 'moderate' | 'high';
    suggestions: string[];
}

interface HealthVideo {
    id: string;
    title: string;
    description: string;
    duration: string;
    category: string;
    thumbnail: string;
    videoUrl: string;
}

const healthVideos: HealthVideo[] = [
    {
        id: '1',
        title: 'Nutrition for Women Farmers',
        description: 'Essential nutrients and balanced diet tips for women working in agriculture',
        duration: '12:30',
        category: 'Nutrition',
        thumbnail: '🥗',
        videoUrl: 'https://example.com/nutrition'
    },
    {
        id: '2',
        title: 'Preventing Back Pain in Farm Work',
        description: 'Proper posture and exercises to prevent back pain during farming activities',
        duration: '8:45',
        category: 'Physical Health',
        thumbnail: '🧘‍♀️',
        videoUrl: 'https://example.com/backpain'
    },
    {
        id: '3',
        title: 'Managing Stress and Mental Health',
        description: 'Techniques to manage stress and maintain mental well-being',
        duration: '15:20',
        category: 'Mental Health',
        thumbnail: '🧠',
        videoUrl: 'https://example.com/mental-health'
    },
    {
        id: '4',
        title: 'Sun Protection and Skin Care',
        description: 'Protecting your skin from sun damage while working outdoors',
        duration: '10:15',
        category: 'Skin Care',
        thumbnail: '☀️',
        videoUrl: 'https://example.com/skincare'
    },
    {
        id: '5',
        title: 'Reproductive Health Awareness',
        description: 'Important information about reproductive health for women farmers',
        duration: '18:00',
        category: 'Reproductive Health',
        thumbnail: '💗',
        videoUrl: 'https://example.com/reproductive'
    },
    {
        id: '6',
        title: 'Hydration and Heat Management',
        description: 'Staying hydrated and managing heat exposure during farm work',
        duration: '9:30',
        category: 'Physical Health',
        thumbnail: '💧',
        videoUrl: 'https://example.com/hydration'
    }
];

const YOUTUBE_API_KEY = 'AIzaSyDpeCQD6jixnn5cblRdwdmH3GVvNtpM7v8';

export const WomenHealthCare: React.FC = () => {
    const [healthData, setHealthData] = useState<HealthData>({
        age: 0,
        weight: 0,
        height: 0,
        bloodPressure: '',
        lastCheckup: '',
        chronicConditions: [],
        activityLevel: 'moderate',
        sleepHours: 7,
        waterIntake: 2
    });

    const [assessment, setAssessment] = useState<HealthAssessment | null>(null);
    const [showAssessment, setShowAssessment] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);
    const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);

    const calculateBMI = (weight: number, height: number): number => {
        if (weight <= 0 || height <= 0) return 0;
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
    };

    const getBMICategory = (bmi: number): string => {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    const calculateHealthScore = (data: HealthData, bmi: number): number => {
        let score = 100;

        // BMI impact
        if (bmi < 18.5 || bmi >= 30) score -= 20;
        else if (bmi >= 25) score -= 10;

        // Age factor
        if (data.age > 50) score -= 5;

        // Activity level
        if (data.activityLevel === 'sedentary') score -= 15;
        else if (data.activityLevel === 'light') score -= 5;
        else if (data.activityLevel === 'active') score += 5;

        // Sleep
        if (data.sleepHours < 6 || data.sleepHours > 9) score -= 10;

        // Water intake
        if (data.waterIntake < 2) score -= 10;

        // Chronic conditions
        score -= data.chronicConditions.length * 10;

        return Math.max(0, Math.min(100, score));
    };

    const getRiskLevel = (score: number): 'low' | 'moderate' | 'high' => {
        if (score >= 80) return 'low';
        if (score >= 60) return 'moderate';
        return 'high';
    };

    const generateSuggestions = (data: HealthData, bmi: number, score: number): string[] => {
        const suggestions: string[] = [];

        // BMI-based suggestions
        if (bmi < 18.5) {
            suggestions.push('Your BMI indicates underweight. Consider increasing caloric intake with nutritious foods.');
            suggestions.push('Consult a nutritionist for a personalized meal plan to gain healthy weight.');
        } else if (bmi >= 25 && bmi < 30) {
            suggestions.push('Your BMI indicates overweight. Focus on balanced diet and regular physical activity.');
            suggestions.push('Aim for 30 minutes of moderate exercise daily, such as brisk walking.');
        } else if (bmi >= 30) {
            suggestions.push('Your BMI indicates obesity. Consult a healthcare provider for a weight management plan.');
            suggestions.push('Consider joining a support group or working with a dietitian.');
        }

        // Activity level suggestions
        if (data.activityLevel === 'sedentary') {
            suggestions.push('Increase physical activity gradually. Start with 15-20 minutes of walking daily.');
            suggestions.push('Take regular breaks during farm work to stretch and move around.');
        }

        // Sleep suggestions
        if (data.sleepHours < 6) {
            suggestions.push('You need more sleep. Aim for 7-8 hours of quality sleep each night.');
            suggestions.push('Establish a regular sleep schedule and create a relaxing bedtime routine.');
        } else if (data.sleepHours > 9) {
            suggestions.push('Excessive sleep may indicate underlying health issues. Consider consulting a doctor.');
        }

        // Water intake suggestions
        if (data.waterIntake < 2) {
            suggestions.push('Increase water intake to at least 2-3 liters daily, especially during farm work.');
            suggestions.push('Carry a water bottle and set reminders to drink water regularly.');
        }

        // Age-specific suggestions
        if (data.age > 40) {
            suggestions.push('Schedule regular health screenings including mammograms and bone density tests.');
            suggestions.push('Ensure adequate calcium and vitamin D intake for bone health.');
        }

        // General suggestions
        suggestions.push('Eat a balanced diet rich in fruits, vegetables, whole grains, and lean proteins.');
        suggestions.push('Practice stress management techniques like meditation or yoga.');
        suggestions.push('Schedule regular health check-ups at least once a year.');
        suggestions.push('Protect yourself from sun exposure with sunscreen and protective clothing.');

        return suggestions;
    };

    const handleAssessment = async () => {
        if (healthData.age <= 0 || healthData.weight <= 0 || healthData.height <= 0) {
            toast.error('Please fill in age, weight, and height to get assessment');
            return;
        }

        setIsLoadingAssessment(true);

        try {
            const bmi = calculateBMI(healthData.weight, healthData.height);
            const bmiCategory = getBMICategory(bmi);
            const healthScore = calculateHealthScore(healthData, bmi);
            const riskLevel = getRiskLevel(healthScore);

            // Initial local suggestions as fallback
            let suggestions = generateSuggestions(healthData, bmi, healthScore);

            // Call Gemini API for personalized suggestions
            try {
                const prompt = `
                    Act as a health expert for women farmers. Analyze the following health data and provide 4-5 specific, actionable health tips and suggestions.
                    
                    Profile:
                    - Age: ${healthData.age} years
                    - Weight: ${healthData.weight} kg
                    - Height: ${healthData.height} cm
                    - BMI: ${bmi.toFixed(1)} (${bmiCategory})
                    - Activity Level: ${healthData.activityLevel}
                    - Sleep: ${healthData.sleepHours} hours
                    - Water Intake: ${healthData.waterIntake} liters
                    - Chronic Conditions: ${healthData.chronicConditions.join(', ') || 'None'}
                    - Blood Pressure: ${healthData.bloodPressure || 'Not provided'}
                    
                    Format the response as a JSON array of strings, e.g., ["Tip 1", "Tip 2"]. Do not include any markdown formatting or explanations outside the array.
                `;

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${YOUTUBE_API_KEY}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: prompt
                                }]
                            }]
                        })
                    }
                );

                const data = await response.json();

                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    const text = data.candidates[0].content.parts[0].text;
                    // Clean up the text to ensure it's valid JSON
                    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    const apiSuggestions = JSON.parse(jsonStr);
                    if (Array.isArray(apiSuggestions) && apiSuggestions.length > 0) {
                        suggestions = apiSuggestions;
                    }
                }
            } catch (apiError) {
                console.error('Error fetching AI suggestions:', apiError);
                toast.error('Could not generate AI suggestions, showing standard recommendations.');
            }

            setAssessment({
                bmi: parseFloat(bmi.toFixed(1)),
                bmiCategory,
                healthScore,
                riskLevel,
                suggestions
            });

            setShowAssessment(true);
            toast.success('Health assessment completed!');
        } catch (error) {
            console.error('Error in assessment:', error);
            toast.error('Failed to complete assessment');
        } finally {
            setIsLoadingAssessment(false);
        }
    };

    const handleInputChange = (field: keyof HealthData, value: any) => {
        setHealthData(prev => ({ ...prev, [field]: value }));
        setShowAssessment(false);
    };

    const handleWatchVideo = async (videoTitle: string) => {
        setIsLoadingVideo(true);
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(videoTitle)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=1`
            );
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                setSelectedVideoId(data.items[0].id.videoId);
                setIsPlayerOpen(true);
            } else {
                toast.error('Video not found');
            }
        } catch (error) {
            console.error('Error fetching video:', error);
            toast.error('Failed to load video');
        } finally {
            setIsLoadingVideo(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="h-8 w-8" />
                    <h1 className="text-3xl font-bold font-poppins">Women's Health & Wellness</h1>
                </div>
                <p className="text-pink-100 text-lg">Track your health, get personalized suggestions, and learn about preventive care</p>
            </div>

            <AdUnit format="horizontal" slotId="women-health-header-ad" />

            <Tabs defaultValue="assessment" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assessment">Health Assessment</TabsTrigger>
                    <TabsTrigger value="videos">Health Awareness Videos</TabsTrigger>
                </TabsList>

                {/* Health Assessment Tab */}
                <TabsContent value="assessment" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-pink-500" />
                                Your Health Information
                            </CardTitle>
                            <CardDescription>
                                Enter your health data to receive personalized health assessment and suggestions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age (years) *</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        value={healthData.age || ''}
                                        onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                                        placeholder="Enter your age"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (kg) *</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.1"
                                        value={healthData.weight || ''}
                                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                                        placeholder="Enter your weight"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height">Height (cm) *</Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        value={healthData.height || ''}
                                        onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                                        placeholder="Enter your height"
                                    />
                                </div>
                            </div>

                            {/* Lifestyle Factors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="activityLevel">Activity Level</Label>
                                    <select
                                        id="activityLevel"
                                        value={healthData.activityLevel}
                                        onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="sedentary">Sedentary (Little to no exercise)</option>
                                        <option value="light">Light (Exercise 1-3 days/week)</option>
                                        <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                                        <option value="active">Active (Exercise 6-7 days/week)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bloodPressure">Blood Pressure (optional)</Label>
                                    <Input
                                        id="bloodPressure"
                                        value={healthData.bloodPressure}
                                        onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                                        placeholder="e.g., 120/80"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sleepHours" className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" />
                                        Sleep Hours per Night
                                    </Label>
                                    <Input
                                        id="sleepHours"
                                        type="number"
                                        value={healthData.sleepHours || ''}
                                        onChange={(e) => handleInputChange('sleepHours', parseInt(e.target.value) || 0)}
                                        placeholder="Average hours of sleep"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="waterIntake" className="flex items-center gap-2">
                                        <Droplet className="h-4 w-4" />
                                        Water Intake (liters/day)
                                    </Label>
                                    <Input
                                        id="waterIntake"
                                        type="number"
                                        step="0.5"
                                        value={healthData.waterIntake || ''}
                                        onChange={(e) => handleInputChange('waterIntake', parseFloat(e.target.value) || 0)}
                                        placeholder="Daily water intake"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastCheckup">Last Health Checkup</Label>
                                <Input
                                    id="lastCheckup"
                                    type="date"
                                    value={healthData.lastCheckup}
                                    onChange={(e) => handleInputChange('lastCheckup', e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleAssessment}
                                className="w-full bg-pink-500 hover:bg-pink-600"
                                size="lg"
                                disabled={isLoadingAssessment}
                            >
                                {isLoadingAssessment ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Analyzing Health Data...
                                    </>
                                ) : (
                                    <>
                                        <Activity className="h-5 w-5 mr-2" />
                                        Get Health Assessment
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Assessment Results */}
                    {showAssessment && assessment && (
                        <div className="space-y-6">
                            {/* Health Score Card */}
                            <Card className="border-2 border-pink-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-pink-500" />
                                        Your Health Assessment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* BMI */}
                                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                            <div className="text-3xl font-bold text-blue-600">{assessment.bmi}</div>
                                            <div className="text-sm text-gray-600 mt-1">BMI</div>
                                            <Badge className="mt-2" variant={
                                                assessment.bmiCategory === 'Normal weight' ? 'default' : 'secondary'
                                            }>
                                                {assessment.bmiCategory}
                                            </Badge>
                                        </div>

                                        {/* Health Score */}
                                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                            <div className="text-3xl font-bold text-green-600">{assessment.healthScore}</div>
                                            <div className="text-sm text-gray-600 mt-1">Health Score</div>
                                            <Progress value={assessment.healthScore} className="mt-2" />
                                        </div>

                                        {/* Risk Level */}
                                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                            <div className={`text-3xl font-bold ${assessment.riskLevel === 'low' ? 'text-green-600' :
                                                assessment.riskLevel === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {assessment.riskLevel.toUpperCase()}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">Risk Level</div>
                                            {assessment.riskLevel === 'low' && <CheckCircle className="h-6 w-6 text-green-600 mx-auto mt-2" />}
                                            {assessment.riskLevel !== 'low' && <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mt-2" />}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Health Suggestions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Apple className="h-5 w-5 text-pink-500" />
                                        Personalized Health Suggestions
                                    </CardTitle>
                                    <CardDescription>
                                        Based on your health data, here are recommendations to improve your well-being
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {assessment.suggestions.map((suggestion, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-gray-700">{suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Common Health Issues */}
                            <Card className="bg-gradient-to-br from-orange-50 to-pink-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-orange-500" />
                                        Common Health Issues for Women Farmers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-2">Musculoskeletal Problems</h4>
                                            <p className="text-sm text-gray-600">Back pain, joint pain from repetitive farm work</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-2">Skin Conditions</h4>
                                            <p className="text-sm text-gray-600">Sun damage, allergies from pesticides</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-2">Respiratory Issues</h4>
                                            <p className="text-sm text-gray-600">Dust exposure, chemical inhalation</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-2">Reproductive Health</h4>
                                            <p className="text-sm text-gray-600">Hormonal changes, pregnancy-related concerns</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* Health Videos Tab */}
                <TabsContent value="videos" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Video className="h-5 w-5 text-pink-500" />
                                Health Awareness Videos
                            </CardTitle>
                            <CardDescription>
                                Educational videos on health topics important for women farmers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {healthVideos.map((video) => (
                                    <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <div className="text-6xl text-center mb-4">{video.thumbnail}</div>
                                            <CardTitle className="text-lg">{video.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">{video.category}</Badge>
                                                <span className="text-sm text-gray-500">{video.duration}</span>
                                            </div>
                                            <Button
                                                className="w-full mt-4 bg-pink-500 hover:bg-pink-600"
                                                onClick={() => handleWatchVideo(video.title)}
                                                disabled={isLoadingVideo}
                                            >
                                                <Video className="h-4 w-4 mr-2" />
                                                {isLoadingVideo ? 'Loading...' : 'Watch Video'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Health Tips */}
                    <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sun className="h-5 w-5 text-yellow-500" />
                                Quick Health Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Utensils className="h-5 w-5 text-pink-500 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Eat Balanced Meals</h4>
                                        <p className="text-sm text-gray-600">Include proteins, vegetables, and whole grains in every meal</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Droplet className="h-5 w-5 text-blue-500 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Stay Hydrated</h4>
                                        <p className="text-sm text-gray-600">Drink at least 8-10 glasses of water daily</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Activity className="h-5 w-5 text-green-500 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Regular Exercise</h4>
                                        <p className="text-sm text-gray-600">30 minutes of physical activity daily</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Moon className="h-5 w-5 text-purple-500 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Quality Sleep</h4>
                                        <p className="text-sm text-gray-600">Get 7-8 hours of sleep every night</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {/* Video Player Dialog */}
            <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Health Awareness Video</DialogTitle>
                        <DialogDescription>
                            Watch this educational video to learn more about women's health in agriculture
                        </DialogDescription>
                    </DialogHeader>
                    <div className="aspect-video w-full">
                        {selectedVideoId && (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded-lg"
                            ></iframe>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
