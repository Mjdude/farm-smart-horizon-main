import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Truck,
  DollarSign,
  BarChart3,
  Package,
  MapPin,
  Calendar,
  Search,
  Filter,
  Bell,
  Settings,
  Eye,
  Trash2,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Heart,
  Share2,
  Download,
  Upload,
  RefreshCw,
  MessageSquare,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface CropPrice {
  id: string;
  crop: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  market: string;
  unit: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  quality: string;
  watched: boolean;
}

interface MarketListing {
  id: string;
  seller: {
    name: string;
    location: string;
    rating: number;
    verified: boolean;
  };
  product: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  quality: string;
  category: string;
  image: string;
  availableFrom: string;
  minOrder: number;
  saved: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  seller: string;
  trackingId?: string;
}

interface PriceAlert {
  id: string;
  crop: string;
  targetPrice: number;
  condition: 'above' | 'below';
  market: string;
  enabled: boolean;
  notifyVia: ('push' | 'sms' | 'email')[];
}

const mockCropPrices: CropPrice[] = [
  {
    id: '1',
    crop: 'Rice (Basmati)',
    currentPrice: 5200,
    previousPrice: 4950,
    change: 250,
    changePercent: 5.05,
    market: 'Delhi Mandi',
    unit: 'quintal',
    lastUpdated: '2024-11-21T09:00:00Z',
    trend: 'up',
    quality: 'Grade A',
    watched: true
  },
  {
    id: '2',
    crop: 'Wheat',
    currentPrice: 2450,
    previousPrice: 2500,
    change: -50,
    changePercent: -2.0,
    market: 'Punjab Mandi',
    unit: 'quintal',
    lastUpdated: '2024-11-21T08:30:00Z',
    trend: 'down',
    quality: 'Grade A',
    watched: true
  },
  {
    id: '3',
    crop: 'Sugarcane',
    currentPrice: 3100,
    previousPrice: 3100,
    change: 0,
    changePercent: 0,
    market: 'UP Mandi',
    unit: 'quintal',
    lastUpdated: '2024-11-21T08:00:00Z',
    trend: 'stable',
    quality: 'Standard',
    watched: false
  },
  {
    id: '4',
    crop: 'Cotton',
    currentPrice: 7800,
    previousPrice: 7500,
    change: 300,
    changePercent: 4.0,
    market: 'Gujarat Mandi',
    unit: 'quintal',
    lastUpdated: '2024-11-21T07:45:00Z',
    trend: 'up',
    quality: 'Grade A',
    watched: false
  },
  {
    id: '5',
    crop: 'Tomato',
    currentPrice: 2800,
    previousPrice: 3200,
    change: -400,
    changePercent: -12.5,
    market: 'Maharashtra Mandi',
    unit: 'quintal',
    lastUpdated: '2024-11-21T09:15:00Z',
    trend: 'down',
    quality: 'Grade A',
    watched: true
  }
];

const mockMarketListings: MarketListing[] = [
  {
    id: '1',
    seller: {
      name: 'Rajesh Kumar',
      location: 'Punjab',
      rating: 4.8,
      verified: true
    },
    product: 'Organic Wheat',
    quantity: 500,
    unit: 'quintal',
    pricePerUnit: 2600,
    totalPrice: 1300000,
    quality: 'Grade A',
    category: 'Grains',
    image: '🌾',
    availableFrom: '2024-11-25',
    minOrder: 10,
    saved: false
  },
  {
    id: '2',
    seller: {
      name: 'Sunita Devi',
      location: 'Haryana',
      rating: 4.9,
      verified: true
    },
    product: 'Basmati Rice',
    quantity: 300,
    unit: 'quintal',
    pricePerUnit: 5300,
    totalPrice: 1590000,
    quality: 'Premium',
    category: 'Grains',
    image: '🌾',
    availableFrom: '2024-11-22',
    minOrder: 5,
    saved: true
  },
  {
    id: '3',
    seller: {
      name: 'Amit Patel',
      location: 'Gujarat',
      rating: 4.6,
      verified: false
    },
    product: 'Fresh Tomatoes',
    quantity: 200,
    unit: 'quintal',
    pricePerUnit: 2900,
    totalPrice: 580000,
    quality: 'Grade A',
    category: 'Vegetables',
    image: '🍅',
    availableFrom: '2024-11-21',
    minOrder: 2,
    saved: false
  }
];

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    product: 'Basmati Rice',
    quantity: 50,
    totalAmount: 265000,
    status: 'shipped',
    orderDate: '2024-11-18T10:00:00Z',
    expectedDelivery: '2024-11-23',
    seller: 'Sunita Devi',
    trackingId: 'TRK123456789'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    product: 'Organic Wheat',
    quantity: 100,
    totalAmount: 260000,
    status: 'confirmed',
    orderDate: '2024-11-20T14:30:00Z',
    expectedDelivery: '2024-11-26',
    seller: 'Rajesh Kumar'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    product: 'Fresh Tomatoes',
    quantity: 20,
    totalAmount: 58000,
    status: 'delivered',
    orderDate: '2024-11-15T09:00:00Z',
    expectedDelivery: '2024-11-20',
    seller: 'Amit Patel',
    trackingId: 'TRK987654321'
  }
];

const mockPriceAlerts: PriceAlert[] = [
  {
    id: '1',
    crop: 'Rice (Basmati)',
    targetPrice: 5500,
    condition: 'above',
    market: 'Delhi Mandi',
    enabled: true,
    notifyVia: ['push', 'sms']
  },
  {
    id: '2',
    crop: 'Wheat',
    targetPrice: 2300,
    condition: 'below',
    market: 'Punjab Mandi',
    enabled: true,
    notifyVia: ['push', 'email']
  }
];

export const MarketIntelligence: React.FC = () => {
  const [cropPrices, setCropPrices] = useState<CropPrice[]>(mockCropPrices);
  const [listings, setListings] = useState<MarketListing[]>(mockMarketListings);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(mockPriceAlerts);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTrend, setFilterTrend] = useState('all');
  const [showWatchedOnly, setShowWatchedOnly] = useState(false);

  const watchedCount = cropPrices.filter(c => c.watched).length;
  const upTrendCount = cropPrices.filter(c => c.trend === 'up').length;
  const downTrendCount = cropPrices.filter(c => c.trend === 'down').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  const filteredPrices = cropPrices.filter(price => {
    const matchesSearch = price.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrend = filterTrend === 'all' || price.trend === filterTrend;
    const matchesWatched = !showWatchedOnly || price.watched;
    return matchesSearch && matchesTrend && matchesWatched;
  });

  const filteredListings = listings.filter(listing => {
    const matchesCategory = filterCategory === 'all' || listing.category === filterCategory;
    const matchesSearch = listing.product.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleWatch = (priceId: string) => {
    setCropPrices(cropPrices.map(p =>
      p.id === priceId ? { ...p, watched: !p.watched } : p
    ));
    const price = cropPrices.find(p => p.id === priceId);
    toast.success(price?.watched ? 'Removed from watchlist' : 'Added to watchlist');
  };

  const handleToggleSave = (listingId: string) => {
    setListings(listings.map(l =>
      l.id === listingId ? { ...l, saved: !l.saved } : l
    ));
    const listing = listings.find(l => l.id === listingId);
    toast.success(listing?.saved ? 'Removed from saved' : 'Saved listing');
  };

  const handlePlaceOrder = (listingId: string) => {
    toast.success('Order placed successfully! Check Orders tab for details.');
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled' } : o
    ));
    toast.success('Order cancelled successfully');
  };

  const handleToggleAlert = (alertId: string) => {
    setPriceAlerts(priceAlerts.map(a =>
      a.id === alertId ? { ...a, enabled: !a.enabled } : a
    ));
    toast.success('Alert updated');
  };

  const handleDeleteAlert = (alertId: string) => {
    setPriceAlerts(priceAlerts.filter(a => a.id !== alertId));
    toast.success('Alert deleted');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-gray-900">Market Intelligence Hub</h1>
          <p className="text-gray-600 mt-2">Real-time pricing, trends, and marketplace access</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Watched Crops</p>
                <p className="text-2xl font-bold">{watchedCount}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Price Rising</p>
                <p className="text-2xl font-bold text-green-600">{upTrendCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Price Falling</p>
                <p className="text-2xl font-bold text-red-600">{downTrendCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-purple-600">{activeOrdersCount}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prices">Price Analytics</TabsTrigger>
          <TabsTrigger value="marketplace">E-Marketplace</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
        </TabsList>

        {/* Price Analytics Tab */}
        <TabsContent value="prices" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search crops or markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTrend} onValueChange={setFilterTrend}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Trends" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trends</SelectItem>
                <SelectItem value="up">Rising</SelectItem>
                <SelectItem value="down">Falling</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                checked={showWatchedOnly}
                onCheckedChange={setShowWatchedOnly}
              />
              <Label>Watched only</Label>
            </div>
          </div>

          {/* Price Cards */}
          <div className="space-y-3">
            {filteredPrices.map((price) => (
              <Card
                key={price.id}
                className={`transition-all hover:shadow-lg ${price.watched ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{price.crop}</h3>
                        <Badge variant="outline">{price.quality}</Badge>
                        {getTrendIcon(price.trend)}
                        {price.watched && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Watching
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {price.market}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {new Date(price.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-end gap-6">
                        <div>
                          <p className="text-sm text-gray-600">Current Price</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(price.currentPrice)}
                            <span className="text-sm font-normal text-gray-600">/{price.unit}</span>
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${price.change > 0 ? 'bg-green-100 text-green-800' :
                            price.change < 0 ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {price.change > 0 ? <ArrowUpRight className="h-4 w-4" /> :
                            price.change < 0 ? <ArrowDownRight className="h-4 w-4" /> :
                              <Minus className="h-4 w-4" />}
                          <span className="font-semibold">
                            {price.change > 0 ? '+' : ''}{formatCurrency(price.change)}
                          </span>
                          <span className="text-sm">
                            ({price.changePercent > 0 ? '+' : ''}{price.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant={price.watched ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleWatch(price.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {price.watched ? 'Watching' : 'Watch'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Chart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPrices.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No prices found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          )}
        </TabsContent>

        {/* E-Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Available Listings</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
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
                <SelectItem value="Grains">Grains</SelectItem>
                <SelectItem value="Vegetables">Vegetables</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings Grid */}
          <div className="grid gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-6">
                    <div className="text-6xl">{listing.image}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{listing.product}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-semibold">{listing.seller.name}</span>
                            {listing.seller.verified && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{listing.seller.location}</span>
                            <span>•</span>
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span>{listing.seller.rating}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSave(listing.id)}
                        >
                          <Heart className={`h-5 w-5 ${listing.saved ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Quantity Available</p>
                          <p className="font-semibold">{listing.quantity} {listing.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Price per {listing.unit}</p>
                          <p className="font-semibold text-green-600">{formatCurrency(listing.pricePerUnit)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quality</p>
                          <Badge variant="outline">{listing.quality}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Min. Order</p>
                          <p className="font-semibold">{listing.minOrder} {listing.unit}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Available from {formatDate(listing.availableFrom)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact Seller
                          </Button>
                          <Button onClick={() => handlePlaceOrder(listing.id)}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Place Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Order History</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{order.orderNumber}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{order.product} - {order.quantity} quintal</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold">{formatDate(order.orderDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Delivery</p>
                      <p className="font-semibold">{formatDate(order.expectedDelivery)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Seller</p>
                      <p className="font-semibold">{order.seller}</p>
                    </div>
                    {order.trackingId && (
                      <div>
                        <p className="text-sm text-gray-600">Tracking ID</p>
                        <p className="font-semibold text-blue-600">{order.trackingId}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    {order.trackingId && (
                      <Button variant="outline">
                        <Truck className="h-4 w-4 mr-2" />
                        Track Order
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <Button
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Price Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Price Alert Rules</h2>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>

          <div className="grid gap-4">
            {priceAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{alert.crop}</CardTitle>
                      <CardDescription>
                        Notify when price goes {alert.condition} {formatCurrency(alert.targetPrice)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={() => handleToggleAlert(alert.id)}
                      />
                      <Badge>{alert.market}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {alert.notifyVia.map(channel => (
                        <Badge key={channel} variant="secondary">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
