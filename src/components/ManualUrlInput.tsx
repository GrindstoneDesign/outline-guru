
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManualUrlInputProps {
  urls: string[];
  onAddUrl: (url: string) => void;
  onRemoveUrl: (index: number) => void;
  onSubmit: () => void;
}

export const ManualUrlInput: React.FC<ManualUrlInputProps> = ({
  urls,
  onAddUrl,
  onRemoveUrl,
  onSubmit,
}) => {
  const [newUrl, setNewUrl] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl.trim()) {
      onAddUrl(newUrl.trim());
      setNewUrl("");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Enter competitor URL"
          className="flex-1"
        />
        <Button type="submit">Add URL</Button>
      </form>

      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        {urls.map((url, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <span className="text-sm truncate flex-1">{url}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveUrl(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </ScrollArea>

      <Button
        onClick={onSubmit}
        className="w-full"
        disabled={urls.length === 0}
      >
        Analyze URLs
      </Button>
    </div>
  );
};
