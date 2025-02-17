
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface KeywordInputProps {
  onSubmit: (keyword: string) => void;
  isLoading: boolean;
}

export const KeywordInput: React.FC<KeywordInputProps> = ({ onSubmit, isLoading }) => {
  const [keyword, setKeyword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSubmit(keyword.trim());
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
