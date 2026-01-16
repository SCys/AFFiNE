import { Button } from '@affine/admin/components/ui/button';
import { Input } from '@affine/admin/components/ui/input';
import { Label } from '@affine/admin/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@affine/admin/components/ui/select';
import { Separator } from '@affine/admin/components/ui/separator';
import { useToast } from '@affine/admin/components/ui/use-toast';
import { useMutation } from '@affine/admin/use-mutation';
import { gqlFetcher, useQuery } from '@affine/admin/use-query';
import { appConfigQuery, updateAppConfigMutation } from '@affine/graphql';
import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

const listRemoteOpenAIModelsQuery = {
  id: 'listRemoteOpenAIModels',
  query: `
    query listRemoteOpenAIModels($baseURL: String, $apiKey: String!) {
      listRemoteOpenAIModels(baseURL: $baseURL, apiKey: $apiKey) {
        id
        name
      }
    }
  `,
};

export function Keys() {
  const { toast } = useToast();
  const { data: configData } = useQuery({ query: appConfigQuery });
  const [openAIKey, setOpenAIKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [fallbackModel, setFallbackModel] = useState('');
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const { trigger: updateConfig, isMutating: isSaving } = useMutation({
    mutation: updateAppConfigMutation,
  });

  useEffect(() => {
    if (configData?.appConfig?.copilot?.providers?.openai) {
      const openaiConfig = configData.appConfig.copilot.providers.openai;
      setOpenAIKey(openaiConfig.apiKey || '');
      setBaseURL(openaiConfig.baseURL || '');
      setFallbackModel(openaiConfig.fallbackModel || '');
      // If there is a fallback model but no list, add it to the list temporarily so it displays
      if (openaiConfig.fallbackModel) {
        setModels([{ id: openaiConfig.fallbackModel, name: openaiConfig.fallbackModel }]);
      }
    }
  }, [configData]);

  const fetchModels = async () => {
    if (!openAIKey) {
      toast({ title: 'Please enter an API Key first', variant: 'destructive' });
      return;
    }
    setLoadingModels(true);
    try {
      const result = await gqlFetcher({
        query: listRemoteOpenAIModelsQuery,
        variables: {
          baseURL: baseURL,
          apiKey: openAIKey,
        },
      });
      if (result?.listRemoteOpenAIModels) {
        setModels(result.listRemoteOpenAIModels);
        toast({ title: 'Models fetched successfully' });
      }
    } catch (e: any) {
      toast({
        title: 'Failed to fetch models',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingModels(false);
    }
  };

  const onSave = async () => {
    try {
      await updateConfig({
        updates: [
          {
            module: 'copilot',
            key: 'providers.openai',
            value: {
              apiKey: openAIKey,
              baseURL: baseURL,
              fallbackModel: fallbackModel,
            },
          },
        ],
      });
      toast({ title: 'Configuration saved successfully' });
    } catch (e: any) {
      toast({
        title: 'Failed to save configuration',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full gap-3 py-5 px-6 w-full">
      <div className="flex items-center">
        <span className="text-xl font-semibold">Keys</span>
      </div>
      <div className="flex-grow overflow-y-auto space-y-[10px]">
        <div className="flex flex-col rounded-md border py-4 gap-4">
          <div className="px-5 space-y-4">
            <h3 className="text-md font-medium">OpenAI Compatible Provider</h3>
            
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Base URL</Label>
              <Input
                type="text"
                className="py-2 px-3 text-base font-normal placeholder:opacity-50"
                value={baseURL}
                placeholder="https://api.openai.com/v1"
                onChange={e => setBaseURL(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">API Key</Label>
              <Input
                type="password"
                className="py-2 px-3 text-base font-normal placeholder:opacity-50"
                value={openAIKey}
                placeholder="sk-..."
                onChange={e => setOpenAIKey(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Fallback Model</Label>
              <div className="flex gap-2">
                <Select
                  value={fallbackModel}
                  onValueChange={setFallbackModel}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchModels}
                  disabled={loadingModels}
                  title="Fetch Models"
                >
                  <RefreshCcw className={`h-4 w-4 ${loadingModels ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click refresh to fetch available models from the provider.
              </p>
            </div>

            <div className="pt-2">
               <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="px-5 space-y-3 text-sm font-normal text-gray-500">
            Custom API keys may not perform as expected. AFFiNE does not
            guarantee results when using custom API keys.
          </div>
        </div>
      </div>
    </div>
  );
}
