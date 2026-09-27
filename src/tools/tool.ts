export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(params: Record<string, unknown>): Promise<string>;
}

export abstract class BaseTool implements Tool {
  abstract name: string;
  abstract description: string;
  abstract parameters: Record<string, unknown>;

  abstract execute(params: Record<string, unknown>): Promise<string>;

  protected getSchema(properties: Record<string, unknown>, required: string[] = []): Record<string, unknown> {
    return {
      type: 'object',
      properties,
      required,
    };
  }
}
