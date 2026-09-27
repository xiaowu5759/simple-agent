import { Message, Tool, AgentConfig, LLMResponse } from '../core/types';
import { LLM } from '../llm/base';
import { logger } from '../utils/logger';

interface AgentConfigWithDefaults extends Required<AgentConfig> {
  enableLogging: boolean;
}

export class Agent {
  private llm: LLM;
  private tools: Map<string, Tool>;
  private messages: Message[];
  private config: AgentConfigWithDefaults;

  constructor(llm: LLM, config: AgentConfig = {}) {
    this.llm = llm;
    this.tools = new Map();
    this.messages = [];

    this.config = {
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.',
      maxIterations: config.maxIterations || 10,
      model: config.model || 'gpt-4',
      temperature: config.temperature ?? 0.7,
      enableLogging: true,
    };

    if (this.config.systemPrompt) {
      this.messages.push({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }
  }

  addTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
    logger.debug(`Tool registered: ${tool.name}`);
  }

  async run(userInput: string): Promise<string> {
    logger.info(`\n${'='.repeat(50)}`);
    logger.info('🚀 Agent starting');
    logger.info(`📝 User input: ${userInput}`);
    logger.info('='.repeat(50));

    this.messages.push({ role: 'user', content: userInput });

    for (let i = 0; i < this.config.maxIterations; i++) {
      logger.info(`\n${'='.repeat(50)}`);
      logger.info(`🔄 Iteration ${i + 1}/${this.config.maxIterations}`);
      logger.info('='.repeat(50));

      const response = await this.callLLM(i + 1);

      this.messages.push({ role: 'assistant', content: response.content });
      logger.info(`💬 Assistant response (${response.content.length} chars)`, {
        toolCallsCount: response.toolCalls?.length || 0,
      });

      if (!response.toolCalls || response.toolCalls.length === 0) {
        logger.info('✅ Agent finished successfully\n');
        return response.content;
      }

      for (const toolCall of response.toolCalls) {
        logger.info(`========== 🔧 Executing Tool: ${toolCall.name} ==========`);
        logger.info(`📥 Tool arguments:`, toolCall.arguments);
        
        const result = await this.executeTool(toolCall.name, toolCall.arguments);
        
        logger.info(`========== ✅ Tool ${toolCall.name} Result ==========`);
        logger.info(`📤 Result: ${result}`);

        this.messages.push({
          role: 'tool',
          content: result,
          toolCallId: toolCall.id,
        });
      }
    }

    logger.warn('⚠️  Max iterations reached without final response');
    return 'Max iterations reached without final response.';
  }

  private async callLLM(iteration: number): Promise<LLMResponse> {
    const toolsArray = this.tools.size > 0 ? Array.from(this.tools.values()) : undefined;
    logger.debug(`Sending ${this.messages.length} messages to LLM, iteration ${iteration}`);
    return this.llm.chat(this.messages, toolsArray);
  }

  private async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      const errorMsg = `Error: Tool ${name} not found.`;
      logger.error(errorMsg);
      return errorMsg;
    }

    try {
      return await tool.execute(args);
    } catch (error) {
      const errorMsg = `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMsg);
      return errorMsg;
    }
  }

  clearHistory(): void {
    const systemMessages = this.messages.filter(m => m.role === 'system');
    this.messages = systemMessages;
    logger.debug('Conversation history cleared');
  }

  getHistory(): Message[] {
    return [...this.messages];
  }
}
