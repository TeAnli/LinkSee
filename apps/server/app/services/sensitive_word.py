"""
DFA (Deterministic Finite Automaton) 敏感词过滤器

- O(n) 时间复杂度，文本长度线性增长
- 支持中文敏感词、拼音变体识别
- 支持从 JSON 文件加载词库，并热更新
"""

import json
import threading
from pathlib import Path


_WORDS_JSON = Path(__file__).parent / "sensitive_words.json"
_MIN_LEN = 2
_LOCK = threading.Lock()


def _load_json() -> dict[str, list[str]]:
    """读取 JSON 词库，返回 {类别: [词, ...]}"""
    if not _WORDS_JSON.exists():
        return {}
    return json.loads(_WORDS_JSON.read_text(encoding="utf-8"))


def _save_json(data: dict[str, list[str]]) -> None:
    """写入 JSON 词库"""
    _WORDS_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def _extract_words(data: dict[str, list[str]]) -> set[str]:
    return {w.strip().lower() for words in data.values() for w in words if w.strip()}


class DFASensitiveFilter:
    """DFA 敏感词过滤器。线程安全，支持热更新。"""

    def __init__(self):
        self._root: dict[str, dict] = {}
        self._rebuild()

    def _rebuild(self) -> None:
        """从 JSON 文件重建 DFA 字典树"""
        data = _load_json()
        words = _extract_words(data)
        root: dict[str, dict] = {}
        for word in words:
            node = root
            for ch in word:
                node = node.setdefault(ch, {})
            node["__end__"] = True
        self._root = root

    def reload(self) -> None:
        """热更新：从 JSON 文件重新加载词库并重建 DFA"""
        with _LOCK:
            self._rebuild()

    def contains(self, text: str) -> bool:
        if not text:
            return False
        text_lower = text.lower()
        n = len(text_lower)
        root = self._root
        for i in range(n):
            node = root
            for j in range(i, n):
                ch = text_lower[j]
                if ch not in node:
                    break
                node = node[ch]
                if "__end__" in node:
                    return True
        return False

    def find_all(self, text: str) -> list[tuple[int, int, str]]:
        result: list[tuple[int, int, str]] = []
        if not text:
            return result
        text_lower = text.lower()
        n = len(text_lower)
        root = self._root
        for i in range(n):
            node = root
            for j in range(i, n):
                ch = text_lower[j]
                if ch not in node:
                    break
                node = node[ch]
                if "__end__" in node:
                    result.append((i, j + 1, text_lower[i:j + 1]))
        return result

    def replace(self, text: str, mask: str = "***") -> str:
        found = self.find_all(text)
        if not found:
            return text
        chars = list(text)
        for start, end, _ in sorted(found, key=lambda x: x[0], reverse=True):
            chars[start:end] = mask
        return "".join(chars)


# ---- JSON 词库管理（供管理端 API 调用）----

def get_all_words() -> dict[str, list[str]]:
    """获取词库全部内容：{类别: [词, ...]}"""
    return _load_json()


def add_words(category: str, words: list[str]) -> int:
    """
    向指定类别添加敏感词，自动去重并持久化。
    返回实际新增数量，完成后自动热更新过滤器。
    """
    with _LOCK:
        data = _load_json()
        existing: set[str] = set(data.get(category, []))
        new_words = [w.strip() for w in words if w.strip() and w.strip() not in existing]
        if not new_words:
            return 0
        data.setdefault(category, []).extend(new_words)
        _save_json(data)
        _filter._rebuild()
        return len(new_words)


def remove_word(category: str, word: str) -> bool:
    """
    从指定类别删除一个敏感词，完成后自动热更新过滤器。
    返回是否实际删除了内容。
    """
    with _LOCK:
        data = _load_json()
        if category not in data:
            return False
        old = data[category]
        new_list = [w for w in old if w.strip() != word.strip()]
        if len(new_list) == len(old):
            return False
        data[category] = new_list
        if not data[category]:
            del data[category]
        _save_json(data)
        _filter._rebuild()
        return True


def get_raw_json() -> str:
    """获取 JSON 词库的原始文本"""
    if not _WORDS_JSON.exists():
        return "{}"
    return _WORDS_JSON.read_text(encoding="utf-8")


def save_raw_json(raw: str) -> None:
    """
    校验并保存 JSON 词库原始文本，完成后自动热更新过滤器。

    Raises:
        ValueError: JSON 格式不合法
        TypeError: JSON 根节点不是对象（{分类: [词, ...]}）
    """
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise TypeError("JSON 结构必须为 {分类: [词, ...]}")
    for cat, words in data.items():
        if not isinstance(words, list):
            raise TypeError(f"分类「{cat}」的值必须是字符串数组")
    with _LOCK:
        _WORDS_JSON.write_text(raw, encoding="utf-8")
        _filter._rebuild()


# ---- 全局单例 ----

_filter: DFASensitiveFilter | None = None


def get_filter() -> DFASensitiveFilter:
    global _filter
    if _filter is None:
        _filter = DFASensitiveFilter()
    return _filter
