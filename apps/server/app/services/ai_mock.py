import asyncio
import random
import uuid

_MOCK_TITLES = {
    "technical": [
        {"text": "深入解析JVM垃圾回收机制：从理论到实战调优", "style": "technical"},
        {"text": "Kubernetes集群高可用架构设计与落地实践", "style": "technical"},
        {"text": "Rust异步编程模型详解：Tokio运行时原理分析", "style": "technical"},
        {"text": "PostgreSQL查询优化器内部机制与执行计划解读", "style": "technical"},
        {"text": "LLM推理加速技术全景：量化、蒸馏与投机解码", "style": "technical"},
    ],
    "question": [
        {"text": "为什么微服务架构比单体架构更难维护？", "style": "question"},
        {"text": "AI时代，前端工程师还需要学习CSS吗？", "style": "question"},
        {"text": "面试官问'你有什么缺点'，该如何回答？", "style": "question"},
        {"text": "30岁转行做程序员还来得及吗？", "style": "question"},
        {"text": "用了Docker就一定是云原生吗？", "style": "question"},
    ],
    "story": [
        {"text": "从外包到字节跳动：一个非科班程序员的三年", "style": "story"},
        {"text": "我如何用RAG技术拯救了一个濒临倒闭的项目", "style": "story"},
        {"text": "裸辞创业180天：我的AI产品从0到1全记录", "style": "story"},
        {"text": "深夜排查线上故障：一个诡异的OOM谜案", "style": "story"},
        {"text": "技术演讲恐惧症患者的一年蜕变之路", "style": "story"},
    ],
    "data": [
        {"text": "2025年编程语言趋势：Rust增速第一，Python稳居榜首", "style": "data"},
        {"text": "10组数据揭秘为什么你的K8s集群总是OOM", "style": "data"},
        {"text": "GitHub十万星项目分析：这些技术正在改变世界", "style": "data"},
        {"text": "一线互联网公司技术栈选择：一份千人问卷调查", "style": "data"},
        {"text": "AI编码工具效能对比：Copilot vs Cursor实测数据", "style": "data"},
    ],
    "suspense": [
        {"text": "这个被忽视的JVM参数，可能是你服务卡顿的元凶", "style": "suspense"},
        {"text": "99%的开发者都不知道的Git骚操作", "style": "suspense"},
        {"text": "你的API真的安全吗？这个漏洞让黑客轻松获取全部数据", "style": "suspense"},
        {"text": "面试官最怕你问的一个问题（不是薪资）", "style": "suspense"},
        {"text": "用了三年的设计模式，居然是反模式？", "style": "suspense"},
    ],
}


def mock_title_generate(content: str, style: str | None = None) -> dict:
    task_id = f"task_{uuid.uuid4().hex[:12]}"
    if style and style in _MOCK_TITLES:
        titles = _MOCK_TITLES[style][:5]
    else:
        titles = _MOCK_TITLES["technical"][:3] + _MOCK_TITLES["question"][:2]
    return {"taskId": task_id, "titles": titles}


def mock_outline_assist(topic: str, detail_level: str = "standard") -> dict:
    word_counts = {"brief": 500, "standard": 1500, "detailed": 3000}
    total = word_counts.get(detail_level, 1500)
    div = total // 3
    return {
        "taskId": f"task_{uuid.uuid4().hex[:12]}",
        "outline": {
            "title": topic,
            "sections": [
                {"heading": f"一、{topic}的背景与意义", "suggestedWords": div // 3, "points": ["核心概念定义", "行业背景分析", "为什么这个话题很重要"]},
                {"heading": f"二、{topic}的实践要点", "suggestedWords": div, "points": ["关键方法论介绍", "典型实践案例分析", "常见误区与避坑指南"]},
                {"heading": f"三、{topic}的未来趋势", "suggestedWords": div // 2, "points": ["技术演进方向", "行业应用前景", "学习资源推荐"]},
            ],
        },
    }


def mock_polish_optimize(text: str, intensity: str = "medium", target_style: str = "formal") -> dict:
    polished = text.strip().capitalize()
    if not polished.endswith((".", "!", "?")):
        polished += "。"
    return {
        "taskId": f"task_{uuid.uuid4().hex[:12]}",
        "polishedText": polished,
        "diffHighlight": [{"original": text, "modified": polished}],
    }


def mock_continue_write(context: str, mode: str = "detail", max_length: int = 500) -> dict:
    continuations = {
        "detail": f"\n\n进一步深入分析，{context[:30]}这一主题涉及多个关键层面。首先从技术实现角度来看，我们需要关注性能、可维护性和扩展性三个维度。其次，在工程实践中，团队协作和代码规范同样至关重要...",
        "argument": f"\n\n然而，这个观点也需要从另一个角度审视。{context[:30]}虽然有显著的优势，但也存在一些潜在的问题。比如在极端场景下，该方案可能导致系统稳定性下降...",
        "counterpoint": f"\n\n但反过来看，{context[:30]}也面临着不可忽视的挑战。如果换一个角度思考——我们应该更关注长期收益而非短期效果...",
        "extend": f"\n\n在此基础上，我们可以进一步拓展思考。{context[:30]}不仅适用于当前场景，还可以推广到更广泛的应用领域，例如跨平台架构设计和微服务治理...",
    }
    return {
        "taskId": f"task_{uuid.uuid4().hex[:12]}",
        "continuedText": continuations.get(mode, continuations["detail"])[:max_length],
    }


def mock_translate(text: str, target_lang: str) -> dict:
    lang_names = {"en": "English", "ja": "日本語", "ko": "한국어", "fr": "Français", "de": "Deutsch"}
    lang = lang_names.get(target_lang, target_lang)
    return {
        "taskId": f"task_{uuid.uuid4().hex[:12]}",
        "translatedText": f"[{lang}] {text}",
        "detectedLang": "zh",
    }


def mock_summary_extract(content: str, max_length: int = 200) -> dict:
    summary = content[:max_length] if len(content) > max_length else content
    keywords = [
        {"word": w.strip(), "weight": round(random.uniform(0.6, 0.99), 2)}
        for w in ["核心技术", "实践方法", "行业趋势", "系统设计", "性能优化"]
    ]
    return {"taskId": f"task_{uuid.uuid4().hex[:12]}", "summary": summary, "keywords": keywords}


def mock_tag_recommend(title: str, content: str, category_id: int | None = None) -> dict:
    category_tags = {
        11: [{"name": "Java", "confidence": 0.95}, {"name": "Spring Boot", "confidence": 0.88}, {"name": "微服务", "confidence": 0.76}],
        12: [{"name": "LLM", "confidence": 0.95}, {"name": "深度学习", "confidence": 0.82}, {"name": "NLP", "confidence": 0.71}],
    }
    tags = category_tags.get(category_id or 11, [{"name": "通用技术", "confidence": 0.90}, {"name": "编程", "confidence": 0.85}])
    return {"taskId": f"task_{uuid.uuid4().hex[:12]}", "tags": tags}


def mock_inspire(topic: str, count: int = 5) -> dict:
    all_inspirations = [
        {"angle": "新手友好视角", "suggestion": f"从零开始理解{topic}的基础概念，分享初学者的学习路径和踩坑经历", "example": "刚接触时可能遇到的理解障碍和突破方法"},
        {"angle": "实战经验视角", "suggestion": f"分享你在{topic}实际项目中的应用案例和心得", "example": "在项目X中使用该技术解决了Y问题"},
        {"angle": "对比分析视角", "suggestion": f"对比{topic}与其他类似方案/工具的优劣势", "example": "性能、易用性、社区生态等维度的对比"},
        {"angle": "深度原理视角", "suggestion": f"深入{topic}的底层原理和设计哲学", "example": "为什么这样设计？背后的trade-off是什么？"},
        {"angle": "未来趋势视角", "suggestion": f"展望{topic}的未来发展方向和潜在变革", "example": "下一个版本/代际更新可能带来什么突破？"},
    ]
    return {"taskId": f"task_{uuid.uuid4().hex[:12]}", "inspirations": all_inspirations[:count]}


async def mock_chat_stream(question: str, session_id: str | None = None):
    """SSE stream generator for AI chat"""
    sid = session_id or f"sess_{uuid.uuid4().hex[:12]}"
    msg_id = f"msg_{uuid.uuid4().hex[:8]}"

    # thinking
    yield {"event": "message", "data": '{"type":"thinking","content":"正在检索相关帖子..."}'}
    await asyncio.sleep(0.3)

    # sources
    yield {"event": "message", "data": '{"type":"sources","items":[{"postId":100001,"title":"深入解析JVM垃圾回收机制","authorName":"李四","relevance":0.92},{"postId":100050,"title":"Java性能优化实战","authorName":"王五","relevance":0.85}]}'}
    await asyncio.sleep(0.2)

    # content deltas
    answer_parts = [
        f"关于「{question}」这个问题，根据社区中的相关讨论，我为你整理了以下要点：\n\n",
        "**1. 核心概念**\n",
        "首先需要理解其基本定义和应用场景。这一领域的专家们普遍认为，扎实的基础知识是解决复杂问题的前提。\n\n",
        "**2. 实践建议**\n",
        "从实践角度来看，建议从简单场景入手，逐步深入到生产级应用。社区中有大量的实战案例可以参考。\n\n",
        "**3. 常见误区**\n",
        "许多初学者容易陷入过度设计的陷阱。保持方案简洁、聚焦核心需求往往是最佳选择。\n\n",
        "> 来源: [深入解析JVM垃圾回收机制](/post/100001) — 作者: 李四\n",
        "> 来源: [Java性能优化实战](/post/100050) — 作者: 王五\n",
    ]
    for part in answer_parts:
        yield {"event": "message", "data": f'{{"type":"content","delta":"{part}"}}'}
        await asyncio.sleep(0.15)

    # followups
    yield {"event": "message", "data": '{"type":"followups","suggestions":["能给我举个具体的例子吗？","这个问题的深层原因是什么？","有什么推荐的学习资料？"]}'}
    await asyncio.sleep(0.1)

    # done
    yield {"event": "message", "data": f'{{"type":"done","sessionId":"{sid}","tokensUsed":{{"input":{random.randint(200,800)},"output":{random.randint(100,500)}}}}}'}


_MOCK_SESSIONS = [
    {"id": "sess_abc123", "title": "Spring Boot 4.0 新特性相关讨论", "lastMessageAt": "2026-05-08T10:30:00+08:00", "messageCount": 8, "firstQuestion": "Spring Boot 4.0 有哪些新特性？"},
    {"id": "sess_def456", "title": "Kubernetes 入门问题", "lastMessageAt": "2026-05-07T15:00:00+08:00", "messageCount": 5, "firstQuestion": "Kubernetes和Docker有什么区别？"},
    {"id": "sess_ghi789", "title": "Python异步编程", "lastMessageAt": "2026-05-06T09:00:00+08:00", "messageCount": 12, "firstQuestion": "Python asyncio 怎么用？"},
]

_MOCK_MESSAGES = {
    "sess_abc123": [
        {"role": "user", "content": "Spring Boot 4.0 有哪些新特性？", "createdAt": "2026-05-08T09:00:00+08:00"},
        {"role": "assistant", "content": "Spring Boot 4.0 带来了多项重大改进：\n1. **原生编译支持**（GraalVM）\n2. **虚拟线程集成**\n3. **全新自动配置机制**\n4. **可观测性增强**\n\n> 来源于社区相关帖子", "sources": [{"postId": 100001, "title": "Spring Boot 4.0 新特性", "authorName": "李四"}], "createdAt": "2026-05-08T09:00:05+08:00"},
        {"role": "user", "content": "虚拟线程具体有什么优势？", "createdAt": "2026-05-08T10:00:00+08:00"},
        {"role": "assistant", "content": "虚拟线程（Virtual Threads）是Java 21引入的革命性特性，主要优势：\n1. **轻量级**：可创建数百万虚拟线程而不会耗尽系统资源\n2. **简化编程模型**：write sync, run async\n3. **更好的吞吐量**：阻塞操作不再阻塞平台线程", "sources": [], "createdAt": "2026-05-08T10:00:05+08:00"},
    ],
}
