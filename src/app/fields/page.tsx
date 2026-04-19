"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/app/dashboard/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ChevronRight,
  Droplets,
  Scale
} from 'lucide-react';
import Link from 'next/link';

const INITIAL_FIELDS = [
  { id: 1, name: 'North Wheat Field', crop: 'Wheat', area: 12, unit: 'Acres', ph: 6.8, lastYield: '2.5 tons/acre', status: 'Healthy' },
  { id: 2, name: 'South Apple Orchard', crop: 'Apple', area: 5, unit: 'Acres', ph: 6.2, lastYield: '10 tons total', status: 'Alert' },
  { id: 3, name: 'Riverside Corn', crop: 'Corn', area: 20, unit: 'Acres', ph: 7.1, lastYield: '180 bushels/acre', status: 'Healthy' },
];

export default function FieldsPage() {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [search, setSearch] = useState('');

  const filteredFields = fields.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.crop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Fields</h1>
          <p className="text-muted-foreground">Manage and track your crop health across all areas.</p>
        </div>
        <Button className="rounded-full flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Field
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search fields or crops..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFields.map((field) => (
          <Link key={field.id} href={`/fields/${field.id}`}>
            <Card className="hover:shadow-lg transition-all border-none bg-white group cursor-pointer h-full">
              <CardContent className="p-0">
                <div className="h-24 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPin className="w-8 h-8 text-primary/40" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-headline group-hover:text-primary transition-colors">{field.name}</h3>
                      <Badge variant="secondary" className="mt-1">{field.crop}</Badge>
                    </div>
                    <Badge className={field.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                      {field.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Scale className="w-4 h-4" />
                      <span>{field.area} {field.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Droplets className="w-4 h-4" />
                      <span>pH {field.ph}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Last yield: {field.lastYield}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
