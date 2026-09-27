import OpenAI from 'openai';
import { Message, Tool, LLMResponse } from '../core/types';
import { LLM, LLMConfig } from './base';
import { logger } from '../utils/logger';

export class OpenAILLM implements LLM {
  private config: Required<LLMConfig>;
  private client: OpenAI;

  constructor(config: LLMConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.openai.com/v/v1',
      model: config.model,
      provider: config.provider || 'openai',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 4096,
      timeout: config.timeout ?? 60000,
    } as Required<LLMConfig>;

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
    });
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse> {
    const openaiMessages = this.convertMessages(messages);
    const openaiTools = this.convertTools(tools);

    logger.info('Sending request to LLM', {
      model: this.config.model,
      messageCount: messages.length,
      hasTools: !!tools && tools.length > 0,
    });

    logger.debug('Request payload', {
      messages: openaiMessages,
      tools: openaiTools,
    });

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: openaiMessages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        tools: openaiTools,
      });

      logger.debug('Response received', response);

      return this.parseResponse(response);
    } catch (error) {
      logger.error('LLM API error', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private convertMessages(messages: Message[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map(msg => {
      if (msg.role === 'tool') {
        return {
          role: 'tool',
          tool_call_id: msg.toolCallId || '',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        } as OpenAI.Chat.ChatCompletionMessageParam;
      }

      if (msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant') {
        if (typeof msg.content === 'string') {
          return {
            role: msg.role,
            content: msg.content,
          } as OpenAI.Chat.ChatCompletionMessageParam;
        }

        return {
          role: msg.role,
          content: msg.content as Array<OpenAI.Chat.ChatCompletionContentPart>,
        } as OpenAI.Chat.ChatCompletionMessageParam;
      }

      return {
        role: 'user',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      } as OpenAI.Chat.ChatCompletionMessageParam;
    });
  }

  private convertTools(tools?: Tool[]): OpenAI.Chat.ChatCompletionTool[] | undefined {
    if (!tools || tools.length === 0) {
      return undefined;
    }

    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as Record<string, unknown>,
      },
    }));
  }

  private parseResponse(response: OpenAI.Chat.ChatCompletion): LLMResponse {
    const choice = response.choices[0];
    const message = choice.message;

    logger.info('========== LLM Response ==========', {
      responseId: response.id,
      model: response.model,
      finishReason: choice.finish_reason,
      usage: response.usage,
    });

    logger.info('Assistant message:', {
      role: message.role,
      content: message.content || '(empty)',
      contentLength: typeof message.content === 'string' ? message.content?.length || 0 : 0,
    });

    if (message.tool_calls && message.tool_calls.length > 0) {
      logger.info('Tool calls detected:', {
        toolCalls: message.tool_calls.map(tc => {
          if (tc.type === 'function') {
            return {
              id: tc.id,
              name: tc.function.name,
              arguments: tc.function.arguments,
            };
          }
          return {
            id: tc.id,
            type: tc.type,
          };
        }),
      });
    }

    const toolCalls = message.tool_calls
      ?.filter(tc => tc.type === 'function')
      .map(tc => {
        return {
          id: tc.id,
          name: (tc as any).function.name,
          arguments: JSON.parse((tc as any).function.arguments),
        };
      });

    return {
      content: typeof message.content === 'string' ? (message.content || '') : '',
      toolCalls,
    };
  }
}
