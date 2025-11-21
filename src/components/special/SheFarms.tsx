import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Heart,
  Star,
  Users,
  FileText,
  Clock,
  Zap,
  AlertCircle,
  DollarSign,
  Activity,
  Video,
  Apple,
  TrendingUp,
  Stethoscope,
  Sun,
  Moon,
  Droplet,
  Utensils,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Import the schemes and health components' logic
import { WomenSchemes } from './WomenSchemes';
import { WomenHealthCare } from './WomenHealthCare';

export const SheFarms: React.FC = () => {
  return (


    <Tabs defaultValue="schemes" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="schemes" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Women Empowerment Schemes
        </TabsTrigger>
        <TabsTrigger value="health" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Health & Wellness
        </TabsTrigger>
      </TabsList>

      <TabsContent value="schemes">
        <WomenSchemes />
      </TabsContent>

      <TabsContent value="health">
        <WomenHealthCare />
      </TabsContent>
    </Tabs>

  );
};
