# AI Agent TypeScript 项目

基于 TypeScript 实现的 AI Agent，支持多种 LLM 提供商（OpenAI/Anthropic）、工具调用和多轮对话。



- 20260308，完成简单ReAct模式。



## 功能特性

- 🤖 多轮对话管理
- 🔧 工具调用系统（可扩展）
- 🌐 支持多种 LLM 提供商（OpenAI、Anthropic）
- ⚙️ 配置灵活（环境变量配置）
- 📝 完整的 TypeScript 类型定义
- 🎯 工厂模式创建 LLM 实例

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
# 复制示例配置
cp .env.example .env
```

编辑 `.env` 文件，配置你的 LLM：

```bash
LLM_API_KEY=your-api-key-here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4
LLM_PROVIDER=openai
LLM_TEMPERATURE=0.7
```

### 3. 运行示例

```bash
# 开发模式运行
npm run dev

# 或先编译再运行
npm run build
npm start
```

## 项目结构

```
src/
├── agent/          # Agent 核心模块
│   ├── agent.ts    # Agent 主类
│   └── index.ts
├── config/         # 配置模块
│   └── config.ts   # 配置加载
├── core/           # 核心类型定义
│   └── types.ts    # 全局类型接口
├── llm/            # LLM 提供商模块
│   ├── base.ts     # LLM 基础接口和配置
│   ├── openai.ts   # OpenAI SDK 实现
│   ├── anthropic.ts # Anthropic SDK 实现
│   └── index.ts
├── tools/          # 工具模块
│   ├── tool.ts     # 工具基类
│   ├── calculator.ts # 计算器工具
│   ├── weather.ts  # 天气工具
│   └── index.ts
├── utils/          # 工具模块
│   ├── logger.ts   # 日志工具
│   └── index.ts
└── index.ts        # 应用入口
```

## 使用方法

### 基本用法

```typescript
import { Agent } from './agent';
import { createLLM } from './llm';

// 使用工厂函数创建 LLM
const llm = createLLM({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
  provider: 'openai',
  temperature: 0.7,
});

// 创建 Agent
const agent = new Agent(llm, {
  systemPrompt: '你是一个有帮助的助手',
  maxIterations: 10,
});

// 运行对话
const response = await agent.run('你好，请介绍一下自己');
console.log(response);
```

### 添加自定义工具

```typescript
import { BaseTool } from './tools';

class MyTool extends BaseTool {
  name = 'my_tool';
  description = '自定义工具描述';

  parameters = {
    type: 'object',
    properties: {
      param: { type: 'string', description: '参数描述' }
    },
    required: ['param']
  };

  async execute(params: Record<string, unknown>): Promise<string> {
    // 执行逻辑
    return '执行结果';
  }
}

agent.addTool(new MyTool());
```

### 使用配置文件

```typescript
import { loadConfig } from './config/config';
import { createLLM } from './llm';

// 从环境变量加载配置
const config = loadConfig();
const llm = createLLM(config.llm);
```

## 环境变量说明

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| LLM_API_KEY | LLM API 密钥 | 必填 |
| LLM_BASE_URL | LLM API 地址 | https://api.openai.com/v1 |
| LLM_MODEL | 模型名称 | gpt-4 |
| LLM_PROVIDER | 提供商（openai/anthropic） | openai |
| LLM_TEMPERATURE | 温度参数 | 0.7 |
| LLM_MAX_TOKENS | 最大 token 数 | 4096 |
| LLM_TIMEOUT | 超时时间（毫秒） | 60000 |

## 支持的 LLM 提供商

### OpenAI
```typescript
const llm = createLLM({
  apiKey: 'xxx',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
  provider: 'openai',
});
```

### Anthropic
```typescript
const llm = createLLM({
  apiKey: 'xxx',
  baseUrl: 'https://api.anthropic.com',
  model: 'claude-3-opus-20240229',
  provider: 'anthropic',
});
```

### 兼容 OpenAI 标准的其他服务
```typescript
const llm = createLLM({
  apiKey: 'xxx',
  baseUrl: 'https://your-custom-api.com/v1',
  model: 'your-model-name',
  provider: 'openai',
});
```

## 命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式运行 |
| `npm run build` | 编译 TypeScript |
| `npm start` | 运行编译后的代码 |

## 许可证

MIT
