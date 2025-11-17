import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock, 
  Cloud, 
  TrendingUp, 
  Droplets,
  Bug,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  Volume2,
  Filter,
  Search,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'weather' | 'market' | 'pest' | 'irrigation' | 'scheme' | 'loan' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  location?: string;
  cropRelated?: string[];
}

interface AlertRule {
  id: string;
  name: string;
  type: 'weather' | 'market' | 'pest' | 'irrigation' | 'scheme';
  condition: string;
  threshold: number;
  enabled: boolean;
  channels: ('push' | 'sms' | 'email' | 'whatsapp')[];
  crops: string[];
  location: string;
}

interface NotificationSettings {
  pushNotifications: boolean;
  smsAlerts: boolean;
  emailNotifications: boolean;
  whatsappAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    weather: boolean;
    market: boolean;
    pest: boolean;
    irrigation: boolean;
    schemes: boolean;
    loans: boolean;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'weather',
    priority: 'critical',
    title: 'Heavy Rainfall Alert',
    message: 'Heavy rainfall expected in your area (150-200mm) in the next 24 hours. Secure your crops and equipment.',
    timestamp: '2024-10-31T08:00:00Z',
    read: false,
    actionRequired: true,
    location: 'Haryana, India',
    cropRelated: ['Rice', 'Wheat']
  },
  {
    id: '2',
    type: 'market',
    priority: 'high',
    title: 'Rice Price Surge',
    message: 'Rice prices have increased by 15% in Delhi Mandi. Current rate: ₹52/kg. Consider selling if you have stock.',
    timestamp: '2024-10-31T06:30:00Z',
    read: false,
    actionRequired: true,
    cropRelated: ['Rice']
  },
  {
    id: '3',
    type: 'pest',
    priority: 'high',
    title: 'Brown Plant Hopper Alert',
    message: 'Brown Plant Hopper infestation reported in nearby areas. Monitor your rice fields and apply preventive measures.',
    timestamp: '2024-10-30T18:45:00Z',
    read: true,
    actionRequired: true,
    location: 'Punjab, India',
    cropRelated: ['Rice']
  },
  {
    id: '4',
    type: 'irrigation',
    priority: 'medium',
    title: 'Irrigation Schedule Reminder',
    message: 'Your wheat field is scheduled for irrigation tomorrow at 6:00 AM. Ensure water availability.',
    timestamp: '2024-10-30T16:00:00Z',
    read: true,
    actionRequired: false,
    cropRelated: ['Wheat']
  },
  {
    id: '5',
    type: 'scheme',
    priority: 'medium',
    title: 'PM-KISAN Application Approved',
    message: 'Your PM-KISAN application has been approved. Next installment of ₹2000 will be credited on Nov 15, 2024.',
    timestamp: '2024-10-30T10:15:00Z',
    read: true,
    actionRequired: false
  },
  {
    id: '6',
    type: 'loan',
    priority: 'medium',
    title: 'KCC Loan EMI Due',
    message: 'Your Kisan Credit Card EMI of ₹8,500 is due on November 5, 2024. Ensure sufficient balance in your account.',
    timestamp: '2024-10-29T14:20:00Z',
    read: false,
    actionRequired: true
  }
];

const mockAlertRules: AlertRule[] = [
  {
    id: '1',
    name: 'Heavy Rainfall Warning',
    type: 'weather',
    condition: 'rainfall > threshold',
    threshold: 100,
    enabled: true,
    channels: ['push', 'sms'],
    crops: ['Rice', 'Wheat'],
    location: 'Haryana, India'
  },
  {
    id: '2',
    name: 'Rice Price Alert',
    type: 'market',
    condition: 'price_change > threshold',
    threshold: 10,
    enabled: true,
    channels: ['push', 'whatsapp'],
    crops: ['Rice'],
    location: 'Delhi Mandi'
  },
  {
    id: '3',
    name: 'Pest Outbreak Alert',
    type: 'pest',
    condition: 'pest_report_nearby',
    threshold: 5,
    enabled: true,
    channels: ['push', 'sms', 'whatsapp'],
    crops: ['Rice', 'Wheat', 'Sugarcane'],
    location: 'Punjab, India'
  }
];

export const AlertsNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    smsAlerts: true,
    emailNotifications: false,
    whatsappAlerts: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '06:00'
    },
    categories: {
      weather: true,
      market: true,
      pest: true,
      irrigation: true,
      schemes: true,
      loans: true
    }
  });
  
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReadStatus = !showUnreadOnly || !notification.read;
    
    return matchesType && matchesPriority && matchesSearch && matchesReadStatus;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'weather': return <Cloud className="h-5 w-5" />;
      case 'market': return <TrendingUp className="h-5 w-5" />;
      case 'pest': return <Bug className="h-5 w-5" />;
      case 'irrigation': return <Droplets className="h-5 w-5" />;
      case 'scheme': return <FileText className="h-5 w-5" />;
      case 'loan': return <DollarSign className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600 mt-2">Stay informed with real-time alerts and updates</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
                <DialogDescription>Configure your notification preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-semibold mb-4">Notification Channels</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <Label>Push Notifications</Label>
                      </div>
                      <Switch 
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <Label>SMS Alerts</Label>
                      </div>
                      <Switch 
                        checked={settings.smsAlerts}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, smsAlerts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <Label>Email Notifications</Label>
                      </div>
                      <Switch 
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Notification Categories</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(settings.categories).map(([category, enabled]) => (
                      <div key={category} className="flex items-center justify-between">
                        <Label className="capitalize">{category.replace('_', ' ')}</Label>
                        <Switch 
                          checked={enabled}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ 
                              ...prev, 
                              categories: { ...prev.categories, [category]: checked }
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Quiet Hours</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Enable Quiet Hours</Label>
                      <Switch 
                        checked={settings.quietHours.enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {settings.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Time</Label>
                          <Input 
                            type="time" 
                            value={settings.quietHours.start}
                            onChange={(e) => 
                              setSettings(prev => ({ 
                                ...prev, 
                                quietHours: { ...prev.quietHours, start: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input 
                            type="time" 
                            value={settings.quietHours.end}
                            onChange={(e) => 
                              setSettings(prev => ({ 
                                ...prev, 
                                quietHours: { ...prev.quietHours, end: e.target.value }
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
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
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
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
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.actionRequired && !n.read).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="alert-rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="pest">Pest</SelectItem>
                <SelectItem value="irrigation">Irrigation</SelectItem>
                <SelectItem value="scheme">Schemes</SelectItem>
                <SelectItem value="loan">Loans</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch 
                checked={showUnreadOnly}
                onCheckedChange={setShowUnreadOnly}
              />
              <Label>Unread only</Label>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                } ${getPriorityColor(notification.priority)}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <Badge className={getPriorityBadgeColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge variant="outline">Action Required</Badge>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.location && (
                            <span>{notification.location}</span>
                          )}
                          {notification.cropRelated && (
                            <div className="flex gap-1">
                              {notification.cropRelated.map(crop => (
                                <Badge key={crop} variant="secondary" className="text-xs">
                                  {crop}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alert-rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Custom Alert Rules</h2>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Create Alert Rule
            </Button>
          </div>

          <div className="grid gap-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <CardDescription>
                        {rule.condition} ({rule.threshold} threshold)
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={rule.enabled}
                        onCheckedChange={(checked) => 
                          setAlertRules(prev => 
                            prev.map(r => r.id === rule.id ? { ...r, enabled: checked } : r)
                          )
                        }
                      />
                      <Badge>{rule.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-gray-500">LOCATION</Label>
                      <div className="text-sm">{rule.location}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">CROPS</Label>
                      <div className="flex flex-wrap gap-1">
                        {rule.crops.map(crop => (
                          <Badge key={crop} variant="outline" className="text-xs">{crop}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">CHANNELS</Label>
                      <div className="flex gap-1">
                        {rule.channels.map(channel => (
                          <Badge key={channel} variant="secondary" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Weather Alerts</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Market Updates</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pest Alerts</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">40%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                  <div className="text-sm text-gray-600 mb-4">Average Response Rate</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Critical Alerts</span>
                      <span className="font-semibold">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High Priority</span>
                      <span className="font-semibold">88%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Priority</span>
                      <span className="font-semibold">75%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
