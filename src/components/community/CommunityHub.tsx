import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  BookOpen,
  Video,
  Phone,
  Star,
  ThumbsUp,
  MessageCircle,
  Send,
  UserPlus,
  Search,
  Filter,
  Clock,
  Eye,
  Trash2,
  Edit,
  MoreVertical,
  Bell,
  Settings,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    location: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  category: string;
  read: boolean;
}

interface SuccessStory {
  id: string;
  name: string;
  location: string;
  avatar: string;
  title: string;
  story: string;
  achievement: string;
  image: string;
  likes: number;
  featured: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'workshop' | 'webinar' | 'meetup' | 'training';
  attendees: number;
  maxAttendees: number;
  organizer: string;
  description: string;
  registered: boolean;
}

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  experience: number;
  location: string;
  rating: number;
  mentees: number;
  availability: 'available' | 'busy' | 'offline';
  connected: boolean;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Priya Sharma',
      avatar: 'PS',
      location: 'Punjab',
      verified: true
    },
    content: 'Just harvested my first organic wheat crop! The yield is amazing. Thank you to all the mentors who guided me through this journey. 🌾',
    image: '🌾',
    likes: 234,
    comments: 45,
    shares: 12,
    timestamp: '2024-11-21T10:00:00Z',
    category: 'Success Story',
    read: false
  },
  {
    id: '2',
    author: {
      name: 'Lakshmi Devi',
      avatar: 'LD',
      location: 'Tamil Nadu',
      verified: true
    },
    content: 'Looking for advice on drip irrigation systems. Has anyone installed one recently? What are the costs and benefits?',
    likes: 89,
    comments: 23,
    shares: 5,
    timestamp: '2024-11-21T07:00:00Z',
    category: 'Question',
    read: true
  },
  {
    id: '3',
    author: {
      name: 'Anita Patel',
      avatar: 'AP',
      location: 'Gujarat',
      verified: false
    },
    content: 'Attended the women farmers workshop today. Learned so much about sustainable farming practices. Highly recommend! 📚',
    likes: 156,
    comments: 31,
    shares: 8,
    timestamp: '2024-11-20T14:00:00Z',
    category: 'Event',
    read: true
  }
];

const mockSuccessStories: SuccessStory[] = [
  {
    id: '1',
    name: 'Savitri Bai',
    location: 'Maharashtra',
    avatar: 'SB',
    title: 'From 2 Acres to 20: My Journey',
    story: 'Started with just 2 acres of land and traditional farming. Today, I manage 20 acres with modern techniques and employ 15 women from my village.',
    achievement: 'Increased income by 400% in 3 years',
    image: '🌾',
    likes: 892,
    featured: true
  },
  {
    id: '2',
    name: 'Meena Kumari',
    location: 'Rajasthan',
    avatar: 'MK',
    title: 'Organic Farming Success',
    story: 'Switched to organic farming 2 years ago. Now supplying to 5 major cities and training other women farmers in organic practices.',
    achievement: 'Certified organic farmer with ₹15L annual revenue',
    image: '🥬',
    likes: 654,
    featured: true
  },
  {
    id: '3',
    name: 'Radha Krishna',
    location: 'Karnataka',
    avatar: 'RK',
    title: 'Dairy Farming Excellence',
    story: 'Built a successful dairy farm with 50 cattle. Providing employment to 8 women and supplying milk to local cooperatives.',
    achievement: 'Award-winning dairy entrepreneur',
    image: '🐄',
    likes: 523,
    featured: false
  }
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Sustainable Farming Workshop',
    date: '2024-11-25',
    time: '10:00 AM - 4:00 PM',
    location: 'Krishi Bhawan, Delhi',
    type: 'workshop',
    attendees: 45,
    maxAttendees: 50,
    organizer: 'Ministry of Agriculture',
    description: 'Learn about sustainable farming practices, organic certification, and modern techniques.',
    registered: false
  },
  {
    id: '2',
    title: 'Women in Agriculture Webinar',
    date: '2024-11-28',
    time: '3:00 PM - 5:00 PM',
    location: 'Online',
    type: 'webinar',
    attendees: 234,
    maxAttendees: 500,
    organizer: 'SheFarms Community',
    description: 'Panel discussion with successful women farmers sharing their experiences and insights.',
    registered: true
  },
  {
    id: '3',
    title: 'Organic Certification Training',
    date: '2024-12-02',
    time: '9:00 AM - 1:00 PM',
    location: 'Agricultural University, Pune',
    type: 'training',
    attendees: 28,
    maxAttendees: 30,
    organizer: 'NABARD',
    description: 'Complete guide to obtaining organic certification for your farm produce.',
    registered: false
  }
];

const mockMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Sunita Reddy',
    avatar: 'SR',
    expertise: ['Organic Farming', 'Soil Health', 'Crop Rotation'],
    experience: 15,
    location: 'Hyderabad',
    rating: 4.9,
    mentees: 45,
    availability: 'available',
    connected: false
  },
  {
    id: '2',
    name: 'Kavita Deshmukh',
    avatar: 'KD',
    expertise: ['Dairy Farming', 'Livestock Management', 'Business Planning'],
    experience: 12,
    location: 'Nagpur',
    rating: 4.8,
    mentees: 38,
    availability: 'available',
    connected: true
  },
  {
    id: '3',
    name: 'Asha Verma',
    avatar: 'AV',
    expertise: ['Agri-Business', 'Marketing', 'Financial Planning'],
    experience: 10,
    location: 'Jaipur',
    rating: 4.7,
    mentees: 52,
    availability: 'busy',
    connected: false
  }
];

export const CommunityHub: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [stories, setStories] = useState<SuccessStory[]>(mockSuccessStories);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [mentors, setMentors] = useState<Mentor[]>(mockMentors);

  const [newPost, setNewPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = posts.filter(p => !p.read).length;
  const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRead = !showUnreadOnly || !post.read;
    return matchesCategory && matchesSearch && matchesRead;
  });

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1, read: true } : post
    ));
    toast.success('Post liked!');
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) {
      toast.error('Please write something to post');
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        avatar: 'YO',
        location: 'Your Location',
        verified: false
      },
      content: newPost,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: new Date().toISOString(),
      category: 'General',
      read: true
    };

    setPosts([post, ...posts]);
    setNewPost('');
    toast.success('Post created successfully!');
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast.success('Post deleted');
  };

  const handleMarkAsRead = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, read: true } : p));
  };

  const handleRegisterEvent = (eventId: string) => {
    setEvents(events.map(e =>
      e.id === eventId ? { ...e, registered: !e.registered, attendees: e.registered ? e.attendees - 1 : e.attendees + 1 } : e
    ));
    const event = events.find(e => e.id === eventId);
    toast.success(event?.registered ? 'Unregistered from event' : 'Successfully registered for event!');
  };

  const handleConnectMentor = (mentorId: string) => {
    setMentors(mentors.map(m =>
      m.id === mentorId ? { ...m, connected: !m.connected } : m
    ));
    const mentor = mentors.find(m => m.id === mentorId);
    toast.success(mentor?.connected ? 'Disconnected from mentor' : 'Connection request sent to mentor!');
  };

  const handleLikeStory = (storyId: string) => {
    setStories(stories.map(s =>
      s.id === storyId ? { ...s, likes: s.likes + 1 } : s
    ));
    toast.success('Story liked!');
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'webinar': return 'bg-purple-100 text-purple-800';
      case 'meetup': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
          <p className="text-gray-600 mt-2">Connect, learn, and grow with fellow women farmers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button onClick={() => setPosts(posts.map(p => ({ ...p, read: true })))} disabled={unreadCount === 0}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Posts</p>
                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Engagement</p>
                <p className="text-2xl font-bold text-purple-600">{totalEngagement}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Mentors</p>
                <p className="text-2xl font-bold text-green-600">
                  {mentors.filter(m => m.availability === 'available').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
        </TabsList>

        {/* Community Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          {/* Create Post Card */}
          <Card>
            <CardHeader>
              <CardTitle>Share with the Community</CardTitle>
              <CardDescription>Post your questions, experiences, or achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What's on your mind? Share your farming journey, ask questions, or celebrate your achievements..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={4}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Photo/Video
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </Button>
                </div>
                <Button onClick={handleCreatePost}>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Success Story">Success Story</SelectItem>
                <SelectItem value="Question">Question</SelectItem>
                <SelectItem value="Event">Event</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className={`transition-all hover:shadow-lg ${!post.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar>
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {post.author.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{post.author.name}</h3>
                          {post.author.verified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              <Star className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge className="bg-purple-100 text-purple-800">{post.category}</Badge>
                          {!post.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="h-3 w-3" />
                          {post.author.location}
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(post.timestamp)}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{post.content}</p>
                        {post.image && (
                          <div className="text-6xl text-center py-4 bg-gray-50 rounded-lg mb-3">
                            {post.image}
                          </div>
                        )}
                        <div className="flex items-center gap-6 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-2"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Share2 className="h-4 w-4" />
                            <span>{post.shares}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!post.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(post.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new post</p>
            </div>
          )}
        </TabsContent>

        {/* Success Stories Tab */}
        <TabsContent value="stories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inspiring Success Stories</h2>
            <Button>
              <Award className="h-4 w-4 mr-2" />
              Share Your Story
            </Button>
          </div>

          <div className="grid gap-6">
            {stories.map((story) => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-green-100 text-green-700 text-lg">
                        {story.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{story.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="font-semibold">{story.name}</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        {story.location}
                      </CardDescription>
                    </div>
                    {story.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Award className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl text-center py-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    {story.image}
                  </div>
                  <p className="text-gray-700">{story.story}</p>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center gap-2 text-green-800 font-semibold">
                      <TrendingUp className="h-5 w-5" />
                      Achievement
                    </div>
                    <p className="text-green-700 mt-1">{story.achievement}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span>{story.likes} people inspired</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleLikeStory(story.id)}>
                        <Heart className="h-4 w-4 mr-2" />
                        Inspire Me
                      </Button>
                      <Button variant="outline">
                        Read Full Story
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>

          <div className="grid gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        {event.registered && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Registered
                          </Badge>
                        )}
                      </div>
                      <CardDescription>Organized by {event.organizer}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{event.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees}/{event.maxAttendees} registered</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {event.maxAttendees - event.attendees} spots remaining
                      </div>
                      <Button
                        onClick={() => handleRegisterEvent(event.id)}
                        variant={event.registered ? "outline" : "default"}
                      >
                        {event.registered ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Registered
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Register Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Mentor</CardTitle>
              <CardDescription>Connect with experienced women farmers and experts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search by name, expertise, or location..." className="pl-10" />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                            {mentor.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getAvailabilityColor(mentor.availability)}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{mentor.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3" />
                          {mentor.location}
                          <span>•</span>
                          <span>{mentor.experience} years experience</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{mentor.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Expertise:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mentor.expertise.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{mentor.mentees} mentees</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="capitalize">{mentor.availability}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      className="flex-1"
                      onClick={() => handleConnectMentor(mentor.id)}
                      disabled={mentor.availability === 'offline'}
                      variant={mentor.connected ? "outline" : "default"}
                    >
                      {mentor.connected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="icon">
                      <Phone className="h-4 w-4" />
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
