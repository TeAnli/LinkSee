import json


def sse_event(data: dict) -> str:
    return f"event: message\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


async def stream_agent_response(agent, question: str, user, session_id: str, chat_history: list | None = None):
    yield sse_event({"type": "thinking", "content": "正在分析问题..."})

    full_response: list[str] = []
    sources: list[dict] = []
    tokens_input = 0
    tokens_output = 0

    try:
        async for event in agent.execute_chat_stream(question, user, chat_history):
            kind = event.get("event", "")

            if kind == "on_tool_start":
                tool_name = event.get("name", "")
                descriptions = {
                    "search_forum_posts": "正在检索相关帖子...",
                    "read_post_content": "正在阅读帖子内容...",
                    "get_category_info": "正在获取版块信息...",
                }
                yield sse_event({
                    "type": "thinking",
                    "content": descriptions.get(tool_name, f"正在调用 {tool_name}..."),
                })

            elif kind == "on_tool_end":
                output = event.get("data", {}).get("output", "")
                if event.get("name") == "search_forum_posts":
                    try:
                        sources = json.loads(output) if isinstance(output, str) else output
                        if isinstance(sources, list):
                            yield sse_event({"type": "sources", "items": sources})
                    except (json.JSONDecodeError, TypeError):
                        pass

            elif kind == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk", {})
                if hasattr(chunk, "content") and chunk.content:
                    delta = chunk.content
                    if isinstance(delta, str):
                        full_response.append(delta)
                        yield sse_event({"type": "content", "delta": delta})

                # 尝试提取 token 用量
                if hasattr(chunk, "response_metadata"):
                    usage = chunk.response_metadata.get("token_usage", {})
                    if usage:
                        tokens_input = usage.get("prompt_tokens", 0)
                        tokens_output = usage.get("completion_tokens", 0)

    except Exception:
        yield sse_event({"type": "content", "delta": "\n\n抱歉，处理过程中出现错误，请稍后重试。"})

    # 生成追问建议
    answer_text = "".join(full_response)
    followups = await _generate_followups(agent, question, answer_text)

    yield sse_event({"type": "followups", "suggestions": followups})
    yield sse_event({
        "type": "done",
        "sessionId": session_id,
        "tokensUsed": {"input": tokens_input, "output": tokens_output},
    })


async def _generate_followups(agent, question: str, answer: str) -> list[str]:
    try:
        from langchain_core.messages import HumanMessage

        prompt = f"""根据以下问答，生成 3 个用户可能追问的问题。
问题：{question}
回答：{answer[:1000]}

返回 JSON 数组格式，只返回 JSON："""
        llm = agent._provider.get_chat_model(temperature=0.4)
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        data = agent._parse_json_response(resp.content, [])
        if isinstance(data, list) and len(data) > 0:
            return [str(item) for item in data[:3]]
    except Exception:
        pass
    return ["能给我举个具体的例子吗？", "这个问题的深层原因是什么？", "有什么推荐的学习资料？"]
