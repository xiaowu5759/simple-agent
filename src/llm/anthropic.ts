import Anthropic from '@anthropic-ai/sdk';
import { Message, Tool, LLMResponse } from '../core/types';
import { LLM, LLMConfig } from './base';
import { logger } from '../utils/logger';

export class AnthropicLLM implements LLM {
  private config: Required<LLMConfig>;
  private client: Anthropic;

  constructor(config: LLMConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.anthapi.com',
      model: config.model,
      provider: config.provider || 'anthropic',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 4096,
      timeout: config.timeout ?? 60000,
    } as Required<LLMConfig>;

    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
    });
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse> {
    const anthropicMessages = this.convertMessages(messages);
    const systemMessage = this.extractSystemMessage(messages);

    logger.info('Sending request to Anthropic LLM', {
      model: this.config.model,
      messageCount: anthropicMessages.length,
      hasTools: !!tools && tools.length > 0,
    });

    logger.debug('Request payload', {
      messages: anthropicMessages,
      system: systemMessage,
      tools: tools,
    });

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        messages: anthropicMessages,
        system: systemMessage,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        tools: this.convertTools(tools),
      });

      logger.debug('Response received', response);

      return this.parseResponse(response);
    } catch (error) {
      logger.error('Anthropic LLM API error', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private extractSystemMessage(messages: Message[]): string {
    const systemMsg = messages.find(m => m.role === 'system');
    return typeof systemMsg?.content === 'string' ? systemMsg.content : '';
  }

  private convertMessages(messages: Message[]): Anthropic.MessageParam[] {
    return messages
      .filter(m => m.role !== 'system')
      .map(msg => {
        if (msg.role === 'tool') {
          return {
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: msg.toolCallId || '',
              content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
            }],
          };
        }

        if (typeof msg.content === 'string') {
          return {
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          };
        }

        return {
          role: msg.role as 'user' | 'assistant',
          content: msg.content as Anthropic.MessageParam['content'],
        };
      });
  }

  private convertTools(tools?: Tool[]): Anthropic.Tool[] | undefined {
    if (!tools || tools.length === 0) {
      return undefined;
    }

    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters as Anthropic.Tool.InputSchema,
    }));
  }

  private parseResponse(response: Anthropic.Message): LLMResponse {
    logger.info('========== Anthropic LLM Response ==========', {
      responseId: response.id,
      model: response.model,
      stopReason: response.stop_reason,
      usage: response.usage,
    });

    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('');

    logger.info('Assistant message:', {
      contentLength: textContent.length,
    });

    const toolBlocks = response.content.filter(block => block.type === 'tool_use');
    if (toolBlocks.length > 0) {
      logger.info('Tool calls detected:', {
        toolCalls: toolBlocks.map(tb => ({
          id: (tb as Anthropic.ToolUseBlock).id,
          name: (tb as Anthropic.ToolUseBlock).name,
          input: (tb as Anthropic.ToolUseBlock).input,
        })),
      });
    }

    const toolCalls = toolBlocks.map(tb => {
      const toolBlock = tb as Anthropic.ToolUseBlock;
      return {
        id: toolBlock.id,
        name: toolBlock.name,
        arguments: toolBlock.input as Record<string, unknown>,
      };
    });

    return {
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
}
