
import React from "react";
import { KeywordInput } from "@/components/KeywordInput";
import { ManualUrlInput } from "@/components/ManualUrlInput";
import { Button } from "@/components/ui/button";

interface OutlineInputSectionProps {
  isLoading: boolean;
  manualMode: boolean;
  manualUrls: string[];
  onGenerateOutline: (keyword: string, searchEngine: "google" | "duckduckgo") => void;
  onAddUrl: (url: string) => void;
  onRemoveUrl: (index: number) => void;
  onManualAnalysis: () => void;
  onSwitchMode: () => void;
}

export const OutlineInputSection: React.FC<OutlineInputSectionProps> = ({
  isLoading,
  manualMode,
  manualUrls,
  onGenerateOutline,
  onAddUrl,
  onRemoveUrl,
  onManualAnalysis,
  onSwitchMode,
}) => {
  if (!manualMode) {
    return <KeywordInput onSubmit={onGenerateOutline} isLoading={isLoading} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manual URL Analysis</h2>
        <Button variant="outline" onClick={onSwitchMode}>
          Switch to Keyword Search
        </Button>
      </div>
      <ManualUrlInput
        urls={manualUrls}
        onAddUrl={onAddUrl}
        onRemoveUrl={onRemoveUrl}
        onSubmit={onManualAnalysis}
      />
    </div>
  );
};
