import { BaseTool } from './tool';

export class WeatherTool extends BaseTool {
  name = 'get_weather';
  description = 'Get weather information for a city';

  parameters = {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'City name to get weather for',
      },
    },
    required: ['city'],
  };

  async execute(params: Record<string, unknown>): Promise<string> {
    const city = params.city as string;
    return `The weather in ${city} is sunny, 25°C`;
  }
}
