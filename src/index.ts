import * as dotenv from 'dotenv';
import { Agent } from './agent';
import { createLLM } from './llm';
import { CalculatorTool, WeatherTool } from './tools';
import { loadConfig } from './config/config';

dotenv.config();

async function main() {
  const config = loadConfig();
  const llm = createLLM(config.llm);

  const agent = new Agent(llm, {
    systemPrompt: 'You are a helpful assistant that can use tools to answer questions.',
  });

  agent.addTool(new CalculatorTool());
  agent.addTool(new WeatherTool());

  const input = 'What is 15 * 23? And what is the weather in Tokyo?';
  console.log(`\nUser: ${input}\n`);

  const response = await agent.run(input);
  console.log(`\nAgent: ${response}`);
}

main().catch(console.error);
