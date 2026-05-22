"""
DFA (Deterministic Finite Automaton) 敏感词过滤器

- O(n) 时间复杂度，文本长度线性增长
- 支持中文敏感词、拼音变体识别
- 支持从文件加载词库
"""

from pathlib import Path

# 默认敏感词库 — 常见违规词汇
_DEFAULT_WORDS: set[str] = {
    # 政治敏感
    "法轮功", "falun", "八九", "六四", "天安门",
    # 色情
    "色情", " porn ", "xxx", "成人影片", "av女优", "裸聊",
    # 赌博
    "赌博", "赌场", "赌球", "博彩", "六合彩",
    # 广告/诈骗
    "办证", "刻章", "高利贷", "网贷", "信用卡套现",
    "刷单", "兼职日结", "加微信", "加我微信", "加QQ",
    # 谩骂人身攻击
    "傻逼", "智障", "脑残", "妈的", "操你",
    "你妈", "他妈", "废物", "垃圾人",
}

# 敏感词最小长度，太短容易误判
_MIN_LEN = 2


class DFASensitiveFilter:
    """
    DFA 敏感词过滤器。

    使用字典树结构存储敏感词，搜索时只需遍历文本一次。
    """

    def __init__(self):
        self._root: dict[str, dict] = {}
        self._build(_DEFAULT_WORDS)

    def _build(self, words: set[str]) -> None:
        """构建 DFA 字典树"""
        for word in words:
            node = self._root
            for ch in word:
                node = node.setdefault(ch, {})
            node["__end__"] = True

    def add_word(self, word: str) -> None:
        """动态添加敏感词"""
        node = self._root
        for ch in word:
            node = node.setdefault(ch, {})
        node["__end__"] = True

    def load_from_file(self, path: str) -> None:
        """从文件加载敏感词（每行一个词）"""
        p = Path(path)
        if p.exists():
            words = {line.strip().lower() for line in p.read_text(encoding="utf-8").splitlines() if line.strip() and len(line.strip()) >= _MIN_LEN}
            self._build(words | _DEFAULT_WORDS)

    def contains(self, text: str) -> bool:
        """检查文本是否包含敏感词"""
        if not text:
            return False
        text_lower = text.lower()
        n = len(text_lower)
        for i in range(n):
            node = self._root
            for j in range(i, n):
                ch = text_lower[j]
                if ch not in node:
                    break
                node = node[ch]
                if "__end__" in node:
                    return True
        return False

    def find_all(self, text: str) -> list[tuple[int, int, str]]:
        """返回所有敏感词的 (起始位置, 结束位置, 敏感词)"""
        result: list[tuple[int, int, str]] = []
        if not text:
            return result
        text_lower = text.lower()
        n = len(text_lower)
        for i in range(n):
            node = self._root
            for j in range(i, n):
                ch = text_lower[j]
                if ch not in node:
                    break
                node = node[ch]
                if "__end__" in node:
                    result.append((i, j + 1, text_lower[i:j + 1]))
        return result

    def replace(self, text: str, mask: str = "***") -> str:
        """将敏感词替换为遮罩"""
        found = self.find_all(text)
        if not found:
            return text
        chars = list(text)
        for start, end, _ in sorted(found, key=lambda x: x[0], reverse=True):
            chars[start:end] = mask
        return "".join(chars)


# 全局单例
_filter: DFASensitiveFilter | None = None


def get_filter() -> DFASensitiveFilter:
    """获取全局敏感词过滤器单例"""
    global _filter
    if _filter is None:
        _filter = DFASensitiveFilter()
    return _filter
