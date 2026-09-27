# AGENTS.md - AI 代理项目规范

## 项目概述

这是一个基于 TypeScript 实现的 AI Agent 项目，支持多种 LLM 提供商、工具调用和多轮对话。

## 代码规范

### TypeScript 规范

- 使用 `strict` 模式进行严格类型检查
- 启用 `esModuleInterop` 以支持 CommonJS 模块
- 所有源文件放在 `src/` 目录
- 编译输出到 `dist/` 目录

### 代码风格

- 使用 2 空格缩进
- 接口使用 PascalCase 命名
- 变量和函数使用 camelCase 命名
- 优先使用 `async/await` 异步编程
- 避免使用 `any` 类型

### 注释规范

- 公共 API 必须添加中文注释
- 复杂逻辑添加行内注释说明
- 类和方法使用 JSDoc 风格注释

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

## 核心模块说明

### Agent 模块 (src/agent/agent.ts)
- `Agent` 类：AI Agent 核心实现
  - `constructor(llm, config)`：创建 Agent 实例
  - `addTool(tool)`：添加工具
  - `run(userInput)`：运行对话
  - `clearHistory()`：清除对话历史
  - `getHistory()`：获取对话历史

### LLM 模块 (src/llm/)
- `base.ts`：LLM 基础接口和配置定义
- `openai.ts`：OpenAI SDK 实现
- `anthropic.ts`：Anthropic SDK 实现
- `createLLM(config)`：工厂函数，根据 provider 创建 LLM 实例

### Tools 模块 (src/tools/)
- `tool.ts`：工具基类 `BaseTool`
- `calculator.ts`：计算器工具示例
- `weather.ts`：天气查询工具示例

### Config 模块 (src/config/)
- `config.ts`：从环境变量加载配置

### Utils 模块 (src/utils/)
- `logger.ts`：日志工具，支持 DEBUG、INFO、WARN、ERROR 级别

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式运行 |
| `npm run build` | 编译 TypeScript |
| `npm start` | 运行编译后的代码 |

## 添加新功能的步骤

### 添加新的 LLM 提供商

1. 在 `src/llm/` 下创建新文件（如 `custom.ts`）
2. 实现 `LLM` 接口
3. 在 `src/llm/base.ts` 的 `Provider` 类型中添加新提供商
4. 在 `src/llm/base.ts` 的 `createLLM` 函数中添加 case 分支
5. 在 `src/llm/index.ts` 中导出新类
6. 运行 `npm run build` 确保编译通过

### 添加新的工具

1. 在 `src/tools/` 下创建新文件
2. 继承 `BaseTool` 类
3. 实现 `name`、`description`、`parameters` 属性
4. 实现 `execute` 方法
5. 在 `src/tools/index.ts` 中导出新工具类
6. 运行 `npm run build` 确保编译通过

### 添加新的配置项

1. 在 `src/config/config.ts` 的 `AppConfig` 接口中添加新字段
2. 在 `loadConfig()` 函数中从环境变量读取
3. 在 `.env.example` 中添加对应的环境变量
3. 运行 `npm run build` 确保编译通过

## 环境变量配置

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| LLM_API_KEY | LLM API 密钥 | 必填 |
| LLM_BASE_URL | LLM API 地址 | https://api.openai.com/v1 |
| LLM_MODEL | 模型名称 | gpt-4 |
| LLM_PROVIDER | 提供商（openai/anthropic） | openai |
| LLM_TEMPERATURE | 温度参数 | 0.7 |
| LLM_MAX_TOKENS | 最大 token 数 | 4096 |
| LLM_TIMEOUT | 超时时间（毫秒） | 60000 |

## 注意事项

- 不要提交 `.env` 文件到版本库
- API Key 等敏感信息使用环境变量
- 工具函数需要处理异常并返回错误信息
- 使用 `createLLM` 工厂函数创建 LLM 实例，不要直接 new
- 所有新增的公共 API 都需要添加中文注释
