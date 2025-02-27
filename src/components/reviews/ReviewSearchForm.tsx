import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ReviewSearchFormProps {
  keyword: string;
  setKeyword: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ReviewSearchForm({
  keyword,
  setKeyword,
  location,
  setLocation,
  onSubmit,
  isLoading
}: ReviewSearchFormProps) {
  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keyword">Business or Product</Label>
          <Input
            id="keyword"
            placeholder="Enter a business name or product (e.g., 'Starbucks', 'iPhone 13')"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={isLoading}
            required
          />
          <p className="text-sm text-muted-foreground">
            Enter the name of a business or product to analyze reviews for
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            placeholder="City, state, or country (e.g., 'New York', 'California')"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Narrow results to a specific location
          </p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Analyzing..." : "Analyze Reviews"}
        </Button>
      </form>
    </Card>
  );
}
