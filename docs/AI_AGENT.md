# LinkSee 论坛 AI Agent 设计方案

## 背景

LinkSee 论坛当前已有完整的 AI 接口体系（8 个写作辅助 + 智能问答 + 内容审核），但全部使用 mock 实现（`ai_mock.py`）。本次改造的目标是：

- 使用 LangChain 框架接入真实大模型，替换所有 mock 逻辑
- 设计一个**论坛智能 Agent**，具备搜索帖子、问答、辅助写作、内容审核等能力
- 保持前端 API 接口协议不变，前端无需改动
- 支持多 LLM 提供商（OpenAI、DeepSeek、Qwen 等）
- 保留 `ai_mock_enabled` 开关，开发调试时可切回 mock 模式

---

## 一、新增目录结构

```
apps/server/app/
  services/
    ai/                              # 新增：LangChain AI 模块
      __init__.py
      providers/                     # LLM 提供商抽象层
        __init__.py
        base.py                      # 抽象基类 BaseLLMProvider
        openai_compatible.py         # OpenAI 兼容实现
        factory.py                   # ProviderFactory 工厂
      agent/                         # Agent 核心
        __init__.py
        forum_agent.py               # ForumAgent 主控类
        tools.py                     # LangChain @tool 工具定义
        prompts.py                   # 各任务类型的系统提示词
      memory/                        # 对话记忆
        __init__.py
        chat_memory.py               # 数据库对话记忆桥接
      streaming/                     # 流式输出
        __init__.py
        sse_adapter.py               # LangChain 事件 → SSE 格式转换
    ai_mock.py                       # 【保留】Mock 实现
    ai_service.py                    # 【小改】record_task 支持真实 token 和耗时
    moderation_service.py            # 【改造】_ai_moderate 使用真实 LLM

  models/
    ai_chat.py                       # 新增：AiChatSession + AiChatMessage
```

---

## 二、Agent 架构设计

### 2.1 核心模式

采用 LangChain 的 `create_tool_calling_agent` 模式，直接映射到 LLM 原生的 function-calling API，输出结构稳定。

### 2.2 Agent 工具集

| 工具名称 | 功能 | 使用场景 |
|---------|------|---------|
| `search_forum_posts` | 关键词搜索帖子 | 智能问答 |
| `read_post_content` | 读取指定帖子完整内容 | 智能问答 |
| `get_user_context` | 获取用户等级、技能信息 | 智能问答 |
| `get_category_info` | 获取版块详情及 AI 人设 | 智能问答、标签推荐 |
| `generate_titles` | 生成标题建议 | 写作辅助 |
| `generate_outline` | 生成结构化大纲 | 写作辅助 |
| `polish_text` | 润色/续写/翻译/摘要 | 写作辅助 |
| `recommend_tags` | 推荐帖子标签 | 写作辅助 |
| `moderate_content` | 内容安全评估 | 内容审核 |

### 2.3 请求路由

- **8 个写作辅助接口** → 直接 LLM 调用 + 专用提示词（不走 Agent 循环）
- **智能问答** → 完整 Agent，可调用搜索/读取等工具
- **内容审核** → 直接 LLM 调用 + 结构化 JSON 输出

---

## 三、LLM 提供商抽象

单一 `OpenAICompatibleProvider` 类覆盖所有兼容 OpenAI API 的提供商（OpenAI、DeepSeek、Qwen、智谱、Moonshot 等）。

新增配置项：
```env
LLM_PROVIDER=openai           # openai | deepseek | qwen | openai_compatible
LLM_API_KEY=sk-xxx
LLM_BASE_URL=                 # 代理/自部署地址（可选）
LLM_MODEL=gpt-4o
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=4096
LLM_TIMEOUT=30
```

---

## 四、对话记忆

- `AiChatSession` / `AiChatMessage` 两张新表存储对话历史
- `DatabaseBackedChatMemory` 将 DB 中的历史消息转为 LangChain 消息格式
- 每次对话加载最近 20 条消息作为上下文

---

## 五、RAG 检索

- **首期**：关键词搜索（SQL ILIKE），LLM 二次排序
- **后续**：pgvector 语义搜索（增量改造）

---

## 六、SSE 流式输出

LangChain `astream_events()` → SSE 格式，与现有 mock 输出完全一致：

```
event: message
data: {"type":"content","delta":"关于 JVM 垃圾回收..."}
```

---

## 七、路由层改造

依赖注入模式切换 mock / 真实 LLM：

```python
def get_ai_executor():
    if settings.ai_mock_enabled:
        return MockAIExecutor()
    return RealAIExecutor(forum_agent)
```

前端 API 协议完全不变，`AiChatPage` 无需任何改动。

---

## 八、实施顺序

1. 依赖与配置 — langchain 系列包 + config.py 扩展
2. 数据库模型 — ai_chat.py（AiChatSession + AiChatMessage）
3. LLM 提供商 — base.py → openai_compatible.py → factory.py
4. 提示词与工具 — prompts.py + tools.py
5. ForumAgent 主控 — forum_agent.py
6. 对话记忆 + SSE — chat_memory.py + sse_adapter.py
7. 路由 + 审核 — routers/ai.py + moderation_service.py + ai_service.py

---

## 九、验证

1. `AI_MOCK_ENABLED=true` → 所有接口与改造前一致
2. `AI_MOCK_ENABLED=false` → 真实 LLM 调用正常
3. 前端 `AiChatPage` 不受影响
4. 配额系统正常扣减
