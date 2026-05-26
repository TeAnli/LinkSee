import json
import time

from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, SystemMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import SysUser
from app.services.ai.agent import prompts
from app.services.ai.agent.tools import (
    build_user_context,
    create_get_category_info,
    create_read_post_content,
    create_search_forum_posts,
)
from app.services.ai.providers.base import BaseLLMProvider


class ForumAgent:

    def __init__(self, provider: BaseLLMProvider, db: AsyncSession):
        self._provider = provider
        self._db = db

    @property
    def model_name(self) -> str:
        return self._provider.get_model_name()

    # === 写作辅助（直接 LLM 调用） ===

    async def generate_titles(self, content: str, style: str | None = None, count: int = 5) -> dict:
        style_req = {
            "technical": "生成专业技术分析型标题",
            "question": "生成引发讨论的提问型标题",
            "story": "生成经验分享故事型标题",
            "data": "生成数据驱动的分析型标题",
            "suspense": "生成悬念揭秘型标题",
        }.get(style, "混合不同风格的标题")
        prompt_text = prompts.TITLE_GENERATE_PROMPT.format(
            content=content[:2000], style_requirement=style_req, count=count,
        )
        llm = self._provider.get_chat_model(temperature=0.8)
        resp = await llm.ainvoke([HumanMessage(content=prompt_text)])
        return self._parse_json_response(resp.content, {"titles": []})

    async def generate_outline(self, topic: str, detail_level: str = "standard") -> dict:
        prompt_text = prompts.OUTLINE_PROMPT.format(topic=topic, detail_level=detail_level)
        llm = self._provider.get_chat_model(temperature=0.7)
        resp = await llm.ainvoke([HumanMessage(content=prompt_text)])
        return self._parse_json_response(resp.content, {"outline": {}})

    async def polish_text(self, text: str, intensity: str = "medium", target_style: str = "formal") -> dict:
        prompt_text = prompts.POLISH_PROMPT.format(
            text=text, intensity=intensity, target_style=target_style,
        )
        llm = self._provider.get_chat_model(temperature=0.5)
        resp = await llm.ainvoke([HumanMessage(content=prompt_text)])
        return self._parse_json_response(resp.content, {"polishedText": text})

    async def continue_write(self, context: str, mode: str = "detail", max_length: int = 500) -> dict:
        prompt_text = prompts.CONTINUE_WRITE_PROMPT.format(
            context=context, mode=mode, max_length=max_length,
        )
        llm = self._provider.get_chat_model(temperature=0.7)
        resp = await llm.ainvoke([HumanMessage(content=prompt_text)])
        return {"continuedText": resp.content.strip()}

    async def translate(self, text: str, target_lang: str) -> dict:
        lang_names = {"en": "英文", "ja": "日文", "ko": "韩文", "fr": "法文", "de": "德文"}
        lang_display = lang_names.get(target_lang, target_lang)
        prompt_text = prompts.TRANSLATE_PROMPT.format(text=text, target_lang=lang_display)
        llm = self._provider.get_chat_model(temperature=0.3)
        resp = await llm.ainvoke([HumanMessage(content=prompt_text)])
        return self._parse_json_response(resp.content, {"translatedText": text})

    async def extract_summary(self, content: str, max_length: int = 200) -> dict:
        prompt_text = prompts.SUMMARY_PROMPT.format(content=content, max_length=max_length)
        llm = self._provider.get_chat_model(temperature=0.3)
        resp = await llm.ainvoke([HumanMessage(content=prompt_text)])
        return self._parse_json_response(resp.content, {"summary": content[:max_length], "keywords": []})

    async def recommend_tags(self, title: str, content: str, category_id: int | None = None, limit: int = 10) -> dict:
        category_name = "综合"
        if category_id:
            from app.models.category import ForumCategory
            cat = await self._db.get(ForumCategory, category_id)
            if cat:
                category_name = cat.name
        prompt_text = prompts.TAG_RECOMMEND_PROMPT.format(
            title=title, content=content[:2000], category_name=category_name, limit=limit,
        )
        llm = self._provider.get_chat_model(temperature=0.5)
        resp = await llm.ainvoke([HumanMessage(content=prompt_text)])
        return self._parse_json_response(resp.content, {"tags": []})

    async def inspire(self, topic: str, count: int = 5) -> dict:
        prompt_text = prompts.INSPIRE_PROMPT.format(topic=topic, count=count)
        llm = self._provider.get_chat_model(temperature=0.9)
        resp = await llm.ainvoke([HumanMessage(content=prompt_text)])
        return self._parse_json_response(resp.content, {"inspirations": []})

    # === 智能问答（完整 Agent） ===

    def _build_qa_agent(self, user_ctx: dict, chat_history: list | None = None):
        tools = [
            create_search_forum_posts(self._db),
            create_read_post_content(self._db),
            create_get_category_info(self._db),
        ]

        system_text = prompts.QA_SYSTEM_PROMPT.format(
            username=user_ctx.get("nickname", "用户"),
            level_name=user_ctx.get("levelName", "Lv.1"),
            level=user_ctx.get("level", 1),
            skills=", ".join(user_ctx.get("skillsTags", [])) or "未设置",
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_text),
            MessagesPlaceholder(variable_name="chat_history", optional=True),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])

        llm = self._provider.get_chat_model(temperature=0.7)
        agent = create_tool_calling_agent(llm, tools, prompt)
        return AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=False,
            max_iterations=3,
            handle_parsing_errors=True,
        )

    async def execute_chat(
        self, question: str, user: SysUser, chat_history: list | None = None
    ) -> dict:
        user_ctx = build_user_context(user)
        executor = self._build_qa_agent(user_ctx, chat_history)
        result = await executor.ainvoke({
            "input": question,
            "chat_history": chat_history or [],
        })
        return {
            "answer": result["output"],
            "sources": [],
            "followups": [],
        }

    async def execute_chat_stream(self, question: str, user: SysUser, chat_history: list | None = None):
        user_ctx = build_user_context(user)
        executor = self._build_qa_agent(user_ctx, chat_history)

        async for event in executor.astream_events(
            {"input": question, "chat_history": chat_history or []},
            version="v2",
        ):
            yield event

    # === 内容审核 ===

    async def moderate(self, title: str, content: str) -> tuple[float, str, str]:
        prompt_text = prompts.MODERATION_PROMPT.format(title=title, content=content[:3000])
        llm = self._provider.get_chat_model(temperature=0.1)
        resp = await llm.ainvoke([HumanMessage(content=prompt_text)])
        data = self._parse_json_response(resp.content, {})
        confidence = float(data.get("confidence", 0.5))
        violation_type = str(data.get("violation_type", ""))
        reason = str(data.get("reason", ""))
        return confidence, violation_type, reason

    # === 工具方法 ===

    @staticmethod
    def _parse_json_response(content: str, default: dict) -> dict:
        text = content.strip()
        # 尝试去除 markdown 代码块标记
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:]) if len(lines) > 1 else text
            if text.endswith("```"):
                text = text[:-3]
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return default
