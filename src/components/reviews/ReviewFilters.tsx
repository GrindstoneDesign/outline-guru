import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewFiltersProps {
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterMessageType: string;
  setFilterMessageType: (value: string) => void;
}

export function ReviewFilters({
  filterCategory,
  setFilterCategory,
  filterMessageType,
  setFilterMessageType,
}: ReviewFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="w-full sm:w-1/2">
        <Select
          value={filterCategory}
          onValueChange={setFilterCategory}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-1/2">
        <Select
          value={filterMessageType}
          onValueChange={setFilterMessageType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by message type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Message Types</SelectItem>
            <SelectItem value="complaint">Complaints</SelectItem>
            <SelectItem value="suggestion">Suggestions</SelectItem>
            <SelectItem value="question">Questions</SelectItem>
            <SelectItem value="praise">Praise</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
