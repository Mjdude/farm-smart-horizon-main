import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  Search,
  Camera,
  Brain,
  Sparkles,
  Send,
  Image as ImageIcon,
  Upload,
  Download,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Mic,
  Settings,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Lightbulb,
  FileText,
  BarChart3,
  Calendar,
  MapPin,
  Leaf,
  Droplet,
  Sun,
  CloudRain,
  Bug,
  Sprout,
  Share2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  helpful?: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  category: 'crop' | 'pest' | 'weather' | 'fertilizer' | 'irrigation';
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  createdAt: string;
  applied: boolean;
}

interface ImageAnalysis {
  id: string;
  imageUrl: string;
  analysisType: 'pest' | 'disease' | 'crop' | 'soil';
  result: {
    identified: string;
    confidence: number;
    severity?: string;
    recommendations: string[];
  };
  timestamp: string;
  saved: boolean;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  readTime: number;
  views: number;
  helpful: number;
  lastUpdated: string;
  bookmarked: boolean;
}

const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your AI Farm Assistant. How can I help you today?',
    timestamp: '2024-11-21T09:00:00Z'
  },
  {
    id: '2',
    role: 'user',
    content: 'What is the best time to plant wheat in Punjab?',
    timestamp: '2024-11-21T09:01:00Z'
  },
  {
    id: '3',
    role: 'assistant',
    content: 'The best time to plant wheat in Punjab is from mid-October to mid-November. This timing ensures optimal growth conditions with cooler temperatures and adequate moisture. Key considerations:\n\n1. Soil temperature should be around 20-25°C\n2. Ensure proper soil preparation before sowing\n3. Use certified seeds for better yield\n4. Apply recommended fertilizers at the time of sowing\n\nWould you like specific variety recommendations for your region?',
    timestamp: '2024-11-21T09:01:30Z',
    helpful: true
  }
];

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Apply Nitrogen Fertilizer to Wheat Crop',
    category: 'fertilizer',
    description: 'Based on soil analysis and crop stage, your wheat crop requires nitrogen fertilization. Apply 50kg/acre of urea for optimal growth.',
    priority: 'high',
    confidence: 92,
    actionable: true,
    createdAt: '2024-11-21T08:00:00Z',
    applied: false
  },
  {
    id: '2',
    title: 'Pest Alert: Monitor for Aphids',
    category: 'pest',
    description: 'Weather conditions are favorable for aphid infestation. Inspect your crops regularly and consider preventive measures.',
    priority: 'high',
    confidence: 85,
    actionable: true,
    createdAt: '2024-11-21T07:30:00Z',
    applied: false
  },
  {
    id: '3',
    title: 'Optimize Irrigation Schedule',
    category: 'irrigation',
    description: 'Reduce irrigation frequency by 20% based on upcoming rainfall forecast and current soil moisture levels.',
    priority: 'medium',
    confidence: 88,
    actionable: true,
    createdAt: '2024-11-20T15:00:00Z',
    applied: true
  },
  {
    id: '4',
    title: 'Consider Crop Rotation',
    category: 'crop',
    description: 'After current wheat harvest, consider planting legumes to improve soil nitrogen content naturally.',
    priority: 'low',
    confidence: 78,
    actionable: false,
    createdAt: '2024-11-19T10:00:00Z',
    applied: false
  }
];

const mockImageAnalyses: ImageAnalysis[] = [
  {
    id: '1',
    imageUrl: '🐛',
    analysisType: 'pest',
    result: {
      identified: 'Aphids (Aphis gossypii)',
      confidence: 94,
      severity: 'Moderate',
      recommendations: [
        'Apply neem oil spray (5ml per liter of water)',
        'Introduce natural predators like ladybugs',
        'Remove heavily infested leaves',
        'Monitor daily for 7 days'
      ]
    },
    timestamp: '2024-11-21T10:30:00Z',
    saved: true
  },
  {
    id: '2',
    imageUrl: '🍂',
    analysisType: 'disease',
    result: {
      identified: 'Leaf Blight',
      confidence: 87,
      severity: 'High',
      recommendations: [
        'Apply fungicide (Mancozeb 75% WP)',
        'Remove and destroy infected plant parts',
        'Improve air circulation between plants',
        'Avoid overhead irrigation'
      ]
    },
    timestamp: '2024-11-20T14:20:00Z',
    saved: true
  },
  {
    id: '3',
    imageUrl: '🌱',
    analysisType: 'crop',
    result: {
      identified: 'Wheat (Healthy)',
      confidence: 96,
      recommendations: [
        'Crop is in excellent condition',
        'Continue current care routine',
        'Monitor for any changes in growth pattern'
      ]
    },
    timestamp: '2024-11-19T09:15:00Z',
    saved: false
  }
];

const mockKnowledgeBase: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'Complete Guide to Wheat Cultivation in North India',
    category: 'Crop Management',
    summary: 'Learn everything about wheat farming from soil preparation to harvesting, including best practices and common challenges.',
    readTime: 12,
    views: 2456,
    helpful: 234,
    lastUpdated: '2024-11-15',
    bookmarked: true
  },
  {
    id: '2',
    title: 'Integrated Pest Management Strategies',
    category: 'Pest Control',
    summary: 'Effective methods to control pests using biological, cultural, and chemical approaches while minimizing environmental impact.',
    readTime: 8,
    views: 1823,
    helpful: 189,
    lastUpdated: '2024-11-10',
    bookmarked: false
  },
  {
    id: '3',
    title: 'Water-Efficient Irrigation Techniques',
    category: 'Water Management',
    summary: 'Modern irrigation methods including drip and sprinkler systems to optimize water usage and improve crop yield.',
    readTime: 10,
    views: 3102,
    helpful: 312,
    lastUpdated: '2024-11-18',
    bookmarked: true
  },
  {
    id: '4',
    title: 'Soil Health and Fertilizer Management',
    category: 'Soil Science',
    summary: 'Understanding soil composition, testing methods, and optimal fertilizer application for sustainable farming.',
    readTime: 15,
    views: 1567,
    helpful: 145,
    lastUpdated: '2024-11-12',
    bookmarked: false
  }
];

export const AIAssistant: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [imageAnalyses, setImageAnalyses] = useState<ImageAnalysis[]>(mockImageAnalyses);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>(mockKnowledgeBase);

  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const totalRecommendations = recommendations.length;
  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
  const appliedCount = recommendations.filter(r => r.applied).length;
  const savedAnalysesCount = imageAnalyses.filter(a => a.saved).length;

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = filterCategory === 'all' || rec.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || rec.priority === filterPriority;
    return matchesCategory && matchesPriority;
  });

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages([...chatMessages, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Thank you for your question. I\'m analyzing your query and will provide detailed recommendations based on your farm data and current conditions.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleMarkHelpful = (messageId: string, helpful: boolean) => {
    setChatMessages(chatMessages.map(msg =>
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
    toast.success(helpful ? 'Marked as helpful' : 'Feedback recorded');
  };

  const handleApplyRecommendation = (recId: string) => {
    setRecommendations(recommendations.map(rec =>
      rec.id === recId ? { ...rec, applied: true } : rec
    ));
    toast.success('Recommendation marked as applied');
  };

  const handleToggleSaveAnalysis = (analysisId: string) => {
    setImageAnalyses(imageAnalyses.map(analysis =>
      analysis.id === analysisId ? { ...analysis, saved: !analysis.saved } : analysis
    ));
    const analysis = imageAnalyses.find(a => a.id === analysisId);
    toast.success(analysis?.saved ? 'Removed from saved' : 'Analysis saved');
  };

  const handleToggleBookmark = (articleId: string) => {
    setKnowledgeBase(knowledgeBase.map(article =>
      article.id === articleId ? { ...article, bookmarked: !article.bookmarked } : article
    ));
    toast.success('Bookmark updated');
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crop': return <Sprout className="h-4 w-4" />;
      case 'pest': return <Bug className="h-4 w-4" />;
      case 'weather': return <CloudRain className="h-4 w-4" />;
      case 'fertilizer': return <Leaf className="h-4 w-4" />;
      case 'irrigation': return <Droplet className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Farm Assistant</h1>
          <p className="text-gray-600 mt-2">Intelligent support for all your farming decisions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Recommendations</p>
                <p className="text-2xl font-bold">{totalRecommendations}</p>
              </div>
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{highPriorityCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applied Actions</p>
                <p className="text-2xl font-bold text-green-600">{appliedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Analyses</p>
                <p className="text-2xl font-bold text-purple-600">{savedAnalysesCount}</p>
              </div>
              <Camera className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="image">Image Analysis</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Farm Assistant Chat
              </CardTitle>
              <CardDescription>
                Ask questions about farming, get instant advice, and receive personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={message.role === 'user' ? 'bg-blue-100' : 'bg-indigo-100'}>
                          {message.role === 'user' ? '👤' : '🤖'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : ''}`}>
                        <div
                          className={`rounded-lg p-3 ${message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          {message.role === 'assistant' && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleCopyMessage(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 ${message.helpful === true ? 'text-green-600' : ''}`}
                                onClick={() => handleMarkHelpful(message.id, true)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 ${message.helpful === false ? 'text-red-600' : ''}`}
                                onClick={() => handleMarkHelpful(message.id, false)}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-indigo-100">🤖</AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Ask me anything about farming..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!currentMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Upload Image
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-3 w-3 mr-1" />
                    Share Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI-Powered Recommendations</h2>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New Insights
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="crop">Crop Management</SelectItem>
                <SelectItem value="pest">Pest Control</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="fertilizer">Fertilizer</SelectItem>
                <SelectItem value="irrigation">Irrigation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {filteredRecommendations.map((rec) => (
              <Card key={rec.id} className={rec.applied ? 'bg-green-50/50' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${rec.category === 'pest' ? 'bg-red-100' :
                            rec.category === 'fertilizer' ? 'bg-green-100' :
                              rec.category === 'irrigation' ? 'bg-blue-100' :
                                rec.category === 'weather' ? 'bg-purple-100' :
                                  'bg-yellow-100'
                          }`}>
                          {getCategoryIcon(rec.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{rec.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {rec.confidence}% Confidence
                            </Badge>
                            {rec.applied && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Applied
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{rec.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(rec.createdAt)}
                        </span>
                        {rec.actionable && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!rec.applied && rec.actionable && (
                        <Button onClick={() => handleApplyRecommendation(rec.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Applied
                        </Button>
                      )}
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecommendations.length === 0 && (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          )}
        </TabsContent>

        {/* Image Analysis Tab */}
        <TabsContent value="image" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI Image Analysis</h2>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload New Image
            </Button>
          </div>

          <div className="space-y-4">
            {imageAnalyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-6">
                    <div className="text-8xl">{analysis.imageUrl}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="capitalize">
                              {analysis.analysisType}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {analysis.result.confidence}% Confidence
                            </Badge>
                            {analysis.result.severity && (
                              <Badge className={
                                analysis.result.severity === 'High' ? 'bg-red-100 text-red-800' :
                                  analysis.result.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                              }>
                                {analysis.result.severity} Severity
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-1">{analysis.result.identified}</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Analyzed on {formatDate(analysis.timestamp)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSaveAnalysis(analysis.id)}
                        >
                          <Download className={`h-5 w-5 ${analysis.saved ? 'text-blue-600' : ''}`} />
                        </Button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {analysis.result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Farming Knowledge Base</h2>
            <div className="flex gap-2">
              <Input placeholder="Search articles..." className="w-64" />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {knowledgeBase.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{article.category}</Badge>
                        {article.bookmarked && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            ⭐ Bookmarked
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                      <CardDescription className="text-base">{article.summary}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleBookmark(article.id)}
                    >
                      <BookOpen className={`h-5 w-5 ${article.bookmarked ? 'text-yellow-600' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.readTime} min read
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {article.helpful} helpful
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Updated {formatDate(article.lastUpdated)}
                      </span>
                    </div>
                    <Button>
                      Read Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
