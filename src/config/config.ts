import { LLMConfig } from '../llm/base';

export interface AppConfig {
  llm: LLMConfig;
}

export function loadConfig(): AppConfig {
  return {
    llm: {
      apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL,
      model: process.env.LLM_MODEL || 'gpt-4',
      provider: (process.env.LLM_PROVIDER || 'openai') as 'openai' | 'anthropic',
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4096'),
      timeout: parseInt(process.env.LLM_TIMEOUT || '60000'),
    },
  };
}