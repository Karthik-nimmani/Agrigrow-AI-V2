
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  Sprout,
  Trash2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { AddFieldDialog } from '@/components/fields/add-field-dialog';

export default function FieldsPage() {
  const { firestore } = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const fieldsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'fields');
  }, [firestore, user]);

  const { data: fields, isLoading } = useCollection(fieldsQuery);

  const filteredFields = fields?.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleDelete = (fieldId: string) => {
    if (!user || !firestore) return;
    const fieldRef = doc(firestore, 'users', user.uid, 'fields', fieldId);
    deleteDocumentNonBlocking(fieldRef);
    toast({
      title: "Field deleted",
      description: `The field record has been removed.`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2 text-slate-900">My Fields</h1>
          <p className="text-muted-foreground text-lg">Manage and track your cultivation areas.</p>
        </div>
        <AddFieldDialog trigger={
          <Button className="rounded-xl flex items-center gap-2 h-11 px-6 bg-primary hover:bg-primary/90">
            <Plus className="w-5 h-5" /> Add New Field
          </Button>
        } />
      </div>

      {/* Search and Filter Section */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search fields..." 
            className="pl-12 h-14 rounded-xl border-none shadow-sm bg-white focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl bg-white shadow-sm border-none text-muted-foreground hover:text-primary">
          <Filter className="w-6 h-6" />
        </Button>
      </div>

      {/* Field List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Syncing your fields...</p>
          </div>
        ) : filteredFields.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center gap-4">
            <Sprout className="w-12 h-12 text-muted-foreground/30" />
            <div className="space-y-1">
              <h3 className="font-bold text-xl">No fields found</h3>
              <p className="text-muted-foreground">Start by adding your first cultivation area.</p>
            </div>
            <AddFieldDialog trigger={<Button variant="outline" className="rounded-xl">Add New Field</Button>} />
          </div>
        ) : (
          filteredFields.map((field) => (
            <Card key={field.id} className="border-none shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden">
              <CardContent className="p-0 flex">
                {/* Field Information Container */}
                <div className="flex-1 flex items-center p-6 gap-6">
                  {/* Icon Container */}
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Sprout className="w-8 h-8 text-primary" />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold font-headline text-slate-800">{field.name}</h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium px-3 py-1 rounded-lg border-none">
                          {field.areaAmount} {field.areaUnit}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium px-3 py-1 rounded-lg border-none">
                          pH {field.soilPH}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Crop: <span className="font-bold text-slate-900">{field.currentCropTypeId}</span>
                    </p>
                  </div>
                </div>

                {/* Actions Sidebar */}
                <div className="w-16 flex flex-col items-center justify-between py-4 border-l border-slate-50">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-transparent">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Field?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove "{field.name}" and all associated data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(field.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Link href={`/fields/${field.id}`}>
                    <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
