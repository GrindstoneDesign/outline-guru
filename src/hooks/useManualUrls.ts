
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useManualUrls = () => {
  const [manualMode, setManualMode] = useState(false);
  const [manualUrls, setManualUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAddManualUrl = (url: string) => {
    if (!url.startsWith('http')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    setManualUrls([...manualUrls, url]);
  };

  const handleRemoveManualUrl = (index: number) => {
    setManualUrls(manualUrls.filter((_, i) => i !== index));
  };

  const resetManualUrls = () => {
    setManualUrls([]);
    setManualMode(false);
  };

  return {
    manualMode,
    manualUrls,
    setManualMode,
    handleAddManualUrl,
    handleRemoveManualUrl,
    resetManualUrls
  };
};
