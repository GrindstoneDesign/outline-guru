
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ReviewSearchFormProps {
  keyword: string;
  location: string;
  isLoading: boolean;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ReviewSearchForm: React.FC<ReviewSearchFormProps> = ({
  keyword,
  location,
  isLoading,
  onKeywordChange,
  onLocationChange,
  onSubmit,
}) => {
  return (
    <Card className="p-6 mb-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="keyword" className="text-sm font-medium">
              Business Type / Keyword
            </label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="e.g., coffee shop, dentist, gym"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location (optional)
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="e.g., New York, NY"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !keyword.trim()}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Reviews...
            </span>
          ) : (
            "Analyze Reviews"
          )}
        </Button>
      </form>
    </Card>
  );
};
