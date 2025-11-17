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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Phone, 
  Star, 
  ShoppingCart, 
  Package, 
  Truck,
  DollarSign,
  Calendar,
  Users,
  MessageCircle,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerRating: number;
  cropType: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalValue: number;
  harvestDate: string;
  location: string;
  description: string;
  images: string[];
  quality: 'Premium' | 'Grade A' | 'Grade B' | 'Standard';
  organic: boolean;
  negotiable: boolean;
  minOrder: number;
  availableUntil: string;
  contact: string;
}

interface BuyRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  cropType: string;
  quantity: number;
  maxPrice: number;
  location: string;
  deadline: string;
  requirements: string;
  contact: string;
}

interface MarketPrice {
  crop: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  market: string;
  date: string;
}

const mockListings: CropListing[] = [
  {
    id: '1',
    farmerId: 'F001',
    farmerName: 'Rajesh Kumar',
    farmerRating: 4.8,
    cropType: 'Rice',
    variety: 'Basmati 1121',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 45,
    totalValue: 22500,
    harvestDate: '2024-10-15',
    location: 'Haryana, India',
    description: 'Premium quality Basmati rice, freshly harvested. Excellent grain length and aroma.',
    images: ['/api/placeholder/300/200'],
    quality: 'Premium',
    organic: true,
    negotiable: true,
    minOrder: 50,
    availableUntil: '2024-11-30',
    contact: '+91-9876543210'
  },
  {
    id: '2',
    farmerId: 'F002',
    farmerName: 'Priya Sharma',
    farmerRating: 4.6,
    cropType: 'Wheat',
    variety: 'HD-2967',
    quantity: 1000,
    unit: 'kg',
    pricePerUnit: 28,
    totalValue: 28000,
    harvestDate: '2024-10-20',
    location: 'Punjab, India',
    description: 'High-quality wheat suitable for flour production. Good protein content.',
    images: ['/api/placeholder/300/200'],
    quality: 'Grade A',
    organic: false,
    negotiable: true,
    minOrder: 100,
    availableUntil: '2024-12-15',
    contact: '+91-9876543211'
  },
  {
    id: '3',
    farmerId: 'F003',
    farmerName: 'Suresh Patel',
    farmerRating: 4.9,
    cropType: 'Tomato',
    variety: 'Hybrid',
    quantity: 200,
    unit: 'kg',
    pricePerUnit: 35,
    totalValue: 7000,
    harvestDate: '2024-10-25',
    location: 'Maharashtra, India',
    description: 'Fresh tomatoes, perfect for retail and wholesale. Good shelf life.',
    images: ['/api/placeholder/300/200'],
    quality: 'Premium',
    organic: true,
    negotiable: false,
    minOrder: 25,
    availableUntil: '2024-11-05',
    contact: '+91-9876543212'
  }
];

const mockBuyRequests: BuyRequest[] = [
  {
    id: '1',
    buyerId: 'B001',
    buyerName: 'Fresh Mart Pvt Ltd',
    cropType: 'Rice',
    quantity: 2000,
    maxPrice: 42,
    location: 'Delhi, India',
    deadline: '2024-11-15',
    requirements: 'Premium quality Basmati rice for retail chain',
    contact: '+91-9876543220'
  },
  {
    id: '2',
    buyerId: 'B002',
    buyerName: 'Organic Foods Co.',
    cropType: 'Vegetables',
    quantity: 500,
    maxPrice: 40,
    location: 'Mumbai, India',
    deadline: '2024-11-10',
    requirements: 'Certified organic vegetables for premium stores',
    contact: '+91-9876543221'
  }
];

const mockMarketPrices: MarketPrice[] = [
  { crop: 'Rice', currentPrice: 44, previousPrice: 42, change: 2, changePercent: 4.76, market: 'Delhi Mandi', date: '2024-10-30' },
  { crop: 'Wheat', currentPrice: 29, previousPrice: 30, change: -1, changePercent: -3.33, market: 'Punjab Mandi', date: '2024-10-30' },
  { crop: 'Tomato', currentPrice: 38, previousPrice: 35, change: 3, changePercent: 8.57, market: 'Mumbai Market', date: '2024-10-30' },
  { crop: 'Onion', currentPrice: 25, previousPrice: 28, change: -3, changePercent: -10.71, market: 'Nashik Market', date: '2024-10-30' },
];

export const CropTrading = () => {
  const [listings, setListings] = useState<CropListing[]>(mockListings);
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>(mockBuyRequests);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(mockMarketPrices);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterQuality, setFilterQuality] = useState('all');
  const [newListing, setNewListing] = useState<Partial<CropListing>>({
    cropType: '',
    variety: '',
    quantity: 0,
    pricePerUnit: 0,
    quality: 'Standard',
    organic: false,
    negotiable: true,
    minOrder: 1,
    description: '',
    location: '',
    contact: ''
  });

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = filterCrop === 'all' || listing.cropType === filterCrop;
    const matchesQuality = filterQuality === 'all' || listing.quality === filterQuality;
    
    return matchesSearch && matchesCrop && matchesQuality;
  });

  const cropTypes = Array.from(new Set(listings.map(l => l.cropType)));
  const qualityTypes = Array.from(new Set(listings.map(l => l.quality)));

  const handleCreateListing = () => {
    if (!newListing.cropType || !newListing.quantity || !newListing.pricePerUnit) {
      toast.error('Please fill in all required fields');
      return;
    }

    const listing: CropListing = {
      id: Date.now().toString(),
      farmerId: 'F' + Date.now(),
      farmerName: 'Current User', // This would come from auth
      farmerRating: 4.5,
      cropType: newListing.cropType!,
      variety: newListing.variety || 'Standard',
      quantity: newListing.quantity!,
      unit: 'kg',
      pricePerUnit: newListing.pricePerUnit!,
      totalValue: newListing.quantity! * newListing.pricePerUnit!,
      harvestDate: new Date().toISOString().split('T')[0],
      location: newListing.location || 'India',
      description: newListing.description || '',
      images: ['/api/placeholder/300/200'],
      quality: (newListing.quality as 'Premium' | 'Grade A' | 'Grade B' | 'Standard') || 'Standard',
      organic: newListing.organic || false,
      negotiable: newListing.negotiable || true,
      minOrder: newListing.minOrder || 1,
      availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact: newListing.contact || '+91-0000000000'
    };

    setListings(prev => [listing, ...prev]);
    setNewListing({
      cropType: '',
      variety: '',
      quantity: 0,
      pricePerUnit: 0,
      quality: 'Standard',
      organic: false,
      negotiable: true,
      minOrder: 1,
      description: '',
      location: '',
      contact: ''
    });
    toast.success('Crop listing created successfully!');
  };

  const handleContactSeller = (listing: CropListing) => {
    toast.success(`Contact initiated with ${listing.farmerName}. Phone: ${listing.contact}`);
  };

  const handlePlaceOrder = (listing: CropListing) => {
    toast.success(`Order placed for ${listing.quantity}kg of ${listing.cropType}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crop Trading Hub</h1>
          <p className="text-gray-600 mt-2">Direct market access - Connect farmers with buyers</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              List Your Crop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Crop Listing</DialogTitle>
              <DialogDescription>
                List your crops for direct sale to buyers
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type *</Label>
                <Select 
                  value={newListing.cropType} 
                  onValueChange={(value) => setNewListing(prev => ({ ...prev, cropType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rice">Rice</SelectItem>
                    <SelectItem value="Wheat">Wheat</SelectItem>
                    <SelectItem value="Tomato">Tomato</SelectItem>
                    <SelectItem value="Onion">Onion</SelectItem>
                    <SelectItem value="Potato">Potato</SelectItem>
                    <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="variety">Variety</Label>
                <Input
                  id="variety"
                  value={newListing.variety}
                  onChange={(e) => setNewListing(prev => ({ ...prev, variety: e.target.value }))}
                  placeholder="e.g., Basmati 1121"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newListing.quantity || ''}
                  onChange={(e) => setNewListing(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per kg (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={newListing.pricePerUnit || ''}
                  onChange={(e) => setNewListing(prev => ({ ...prev, pricePerUnit: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Quality Grade</Label>
                <Select 
                  value={newListing.quality} 
                  onValueChange={(value: 'Premium' | 'Grade A' | 'Grade B' | 'Standard') => setNewListing(prev => ({ ...prev, quality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Grade A">Grade A</SelectItem>
                    <SelectItem value="Grade B">Grade B</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrder">Minimum Order (kg)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={newListing.minOrder || ''}
                  onChange={(e) => setNewListing(prev => ({ ...prev, minOrder: parseInt(e.target.value) || 1 }))}
                  placeholder="Minimum order quantity"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newListing.location}
                  onChange={(e) => setNewListing(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Village, District, State"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newListing.description}
                  onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your crop quality, harvest details, etc."
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={newListing.contact}
                  onChange={(e) => setNewListing(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleCreateListing}>Create Listing</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="buy-requests">Buy Requests</TabsTrigger>
          <TabsTrigger value="market-prices">Market Prices</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search crops, varieties, or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCrop} onValueChange={setFilterCrop}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Crops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {cropTypes.map(crop => (
                  <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterQuality} onValueChange={setFilterQuality}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                {qualityTypes.map(quality => (
                  <SelectItem key={quality} value={quality}>{quality}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crop Listings */}
          <div className="grid gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="/api/placeholder/40/40" />
                        <AvatarFallback>{listing.farmerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{listing.cropType} - {listing.variety}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">{listing.farmerName}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{listing.farmerRating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">₹{listing.pricePerUnit}/kg</div>
                      <div className="text-sm text-gray-600">Total: ₹{listing.totalValue.toLocaleString()}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-gray-500">QUANTITY</Label>
                      <div className="font-semibold">{listing.quantity} {listing.unit}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">QUALITY</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={listing.quality === 'Premium' ? 'default' : 'secondary'}>
                          {listing.quality}
                        </Badge>
                        {listing.organic && <Badge variant="outline">Organic</Badge>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">LOCATION</Label>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{listing.location}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">HARVEST DATE</Label>
                      <div className="text-sm">{new Date(listing.harvestDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{listing.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Min Order: {listing.minOrder}kg</span>
                      {listing.negotiable && <Badge variant="outline">Negotiable</Badge>}
                      <span>Available until: {new Date(listing.availableUntil).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleContactSeller(listing)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button onClick={() => handlePlaceOrder(listing)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Place Order
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="buy-requests" className="space-y-6">
          <div className="grid gap-4">
            {buyRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.buyerName}</CardTitle>
                      <CardDescription>Looking for {request.cropType}</CardDescription>
                    </div>
                    <Badge>₹{request.maxPrice}/kg max</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-gray-500">QUANTITY NEEDED</Label>
                      <div className="font-semibold">{request.quantity} kg</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">LOCATION</Label>
                      <div>{request.location}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">DEADLINE</Label>
                      <div>{new Date(request.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{request.requirements}</p>
                  <div className="flex justify-end">
                    <Button>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Respond to Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market-prices" className="space-y-6">
          <div className="grid gap-4">
            {marketPrices.map((price) => (
              <Card key={`${price.crop}-${price.market}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{price.crop}</h3>
                      <p className="text-sm text-gray-600">{price.market}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">₹{price.currentPrice}/kg</div>
                      <div className={`flex items-center gap-1 ${price.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {price.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="text-sm">
                          {price.change >= 0 ? '+' : ''}{price.change} ({price.changePercent >= 0 ? '+' : ''}{price.changePercent}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-listings" className="space-y-6">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-4">Create your first crop listing to start selling directly to buyers</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Your First Listing</Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
