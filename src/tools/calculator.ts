import { BaseTool } from './tool';

export class CalculatorTool extends BaseTool {
  name = 'calculator';
  description = 'Perform basic mathematical calculations';

  parameters = {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate (e.g., "2 + 2" or "10 * 5")',
      },
    },
    required: ['expression'],
  };

  async execute(params: Record<string, unknown>): Promise<string> {
    const expression = params.expression as string;
    try {
      const result = eval(expression);
      return String(result);
    } catch {
      return 'Error: Invalid expression';
    }
  }
}
