
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KeywordInputProps {
  onSubmit: (keyword: string, searchEngine: "google" | "duckduckgo") => void;
  isLoading: boolean;
}

export const KeywordInput: React.FC<KeywordInputProps> = ({ onSubmit, isLoading }) => {
  const [keyword, setKeyword] = React.useState("");
  const [searchEngine, setSearchEngine] = React.useState<"google" | "duckduckgo">("duckduckgo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSubmit(keyword.trim(), searchEngine);
    }
  };

  return (
    <Card className="p-6 glass animate-fade-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="keyword" className="text-sm font-medium">
            Enter your keyword
          </label>
          <Input
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., content marketing, SEO strategies"
            className="w-full transition-shadow duration-200"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="search-engine" className="text-sm font-medium">
            Search Engine
          </label>
          <Select
            value={searchEngine}
            onValueChange={(value: "google" | "duckduckgo") => setSearchEngine(value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select search engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="duckduckgo">DuckDuckGo (Free - No API Required)</SelectItem>
              <SelectItem value="google">Google (Requires SERP API Credits)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          className="w-full transition-all duration-200"
          disabled={isLoading || !keyword.trim()}
        >
          {isLoading ? "Generating outline..." : "Generate Outline"}
        </Button>
      </form>
    </Card>
  );
};
