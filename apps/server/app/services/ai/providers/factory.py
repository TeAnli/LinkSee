from app.services.ai.providers.openai_compatible import OpenAICompatibleProvider
from app.services.ai.providers.base import BaseLLMProvider


class ProviderFactory:
    _registry: dict[str, type[BaseLLMProvider]] = {
        "openai": OpenAICompatibleProvider,
        "deepseek": OpenAICompatibleProvider,
        "qwen": OpenAICompatibleProvider,
        "openai_compatible": OpenAICompatibleProvider,
    }

    @classmethod
    def create(cls, settings) -> BaseLLMProvider:
        provider_cls = cls._registry.get(settings.llm_provider)
        if provider_cls is None:
            raise ValueError(f"不支持的 LLM 提供商: {settings.llm_provider}")
        return provider_cls(settings)
