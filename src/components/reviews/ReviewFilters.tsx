
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
  filterMessageType: string;
  onCategoryChange: (value: string) => void;
  onMessageTypeChange: (value: string) => void;
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  filterCategory,
  filterMessageType,
  onCategoryChange,
  onMessageTypeChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">
          Filter by Category
        </label>
        <Select
          value={filterCategory}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="motivation">Motivation</SelectItem>
            <SelectItem value="value">Value</SelectItem>
            <SelectItem value="anxiety">Anxiety</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">
          Filter by Message Type
        </label>
        <Select
          value={filterMessageType}
          onValueChange={onMessageTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select message type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Pain Point">Pain Point</SelectItem>
            <SelectItem value="Purchase Prompt">Purchase Prompt</SelectItem>
            <SelectItem value="Feature Request">Feature Request</SelectItem>
            <SelectItem value="Praise">Praise</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
