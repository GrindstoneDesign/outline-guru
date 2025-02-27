import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GoogleMapsReviewOptions } from "@/services/googleMapsReviewService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface GoogleMapsReviewFormProps {
  onSubmit: (keyword: string, options: GoogleMapsReviewOptions) => void;
  isLoading: boolean;
}

export const GoogleMapsReviewForm: React.FC<GoogleMapsReviewFormProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [sortType, setSortType] = useState<"relevent" | "newest" | "highest_rating" | "lowest_rating">("relevent");
  const [searchQuery, setSearchQuery] = useState("");
  const [pages, setPages] = useState<number>(3);
  const [maxResults, setMaxResults] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    onSubmit(keyword.trim(), {
      location: location.trim() || undefined,
      sortType,
      searchQuery: searchQuery.trim() || undefined,
      pages,
      maxResults,
      clean: true
    });
  };

  return (
    <div className="space-y-4">
      <Alert variant="info" className="bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Testing Mode</AlertTitle>
        <AlertDescription>
          Currently using mock data for testing. In production, this will search Google Maps and scrape real reviews.
        </AlertDescription>
      </Alert>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-maps-keyword">Search Keyword</Label>
            <Input
              id="google-maps-keyword"
              placeholder="Enter a business type or name (e.g., 'coffee shops', 'dentist')"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={isLoading}
              className="w-full"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter a keyword to search for businesses on Google Maps
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
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Narrow results to a specific location
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort-type">Sort Reviews By</Label>
              <Select
                value={sortType}
                onValueChange={(value: "relevent" | "newest" | "highest_rating" | "lowest_rating") => 
                  setSortType(value)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="sort-type">
                  <SelectValue placeholder="Select sort type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevent">Relevant</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="highest_rating">Highest Rating</SelectItem>
                  <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">Pages Per Business</Label>
              <Select
                value={pages.toString()}
                onValueChange={(value) => setPages(parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="pages">
                  <SelectValue placeholder="Select number of pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Page</SelectItem>
                  <SelectItem value="2">2 Pages</SelectItem>
                  <SelectItem value="3">3 Pages</SelectItem>
                  <SelectItem value="5">5 Pages</SelectItem>
                  <SelectItem value="10">10 Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-results">Number of Businesses</Label>
              <Select
                value={maxResults.toString()}
                onValueChange={(value) => setMaxResults(parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="max-results">
                  <SelectValue placeholder="Select number of businesses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Top 1 Business</SelectItem>
                  <SelectItem value="3">Top 3 Businesses</SelectItem>
                  <SelectItem value="5">Top 5 Businesses</SelectItem>
                  <SelectItem value="10">Top 10 Businesses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-query">Filter Reviews (Optional)</Label>
              <Input
                id="search-query"
                placeholder="Enter keywords to filter reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !keyword.trim()}
          >
            {isLoading ? "Searching & Scraping..." : "Search & Scrape Reviews"}
          </Button>
        </form>
      </Card>
    </div>
  );
}; 