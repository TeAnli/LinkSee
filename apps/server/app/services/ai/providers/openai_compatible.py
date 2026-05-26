from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.embeddings import Embeddings
from langchain_core.language_models import BaseChatModel

from app.services.ai.providers.base import BaseLLMProvider


class OpenAICompatibleProvider(BaseLLMProvider):

    def __init__(self, settings):
        self._settings = settings

    def get_chat_model(self, **kwargs) -> BaseChatModel:
        return ChatOpenAI(
            model=self._settings.llm_model,
            api_key=self._settings.llm_api_key,
            base_url=self._settings.llm_base_url or None,
            temperature=kwargs.get("temperature", self._settings.llm_temperature),
            max_tokens=kwargs.get("max_tokens", self._settings.llm_max_tokens),
            timeout=self._settings.llm_timeout,
            streaming=kwargs.get("streaming", False),
        )

    def get_embeddings(self) -> Embeddings:
        return OpenAIEmbeddings(
            model=self._settings.llm_embedding_model,
            api_key=self._settings.llm_api_key,
            base_url=self._settings.llm_base_url or None,
        )

    def get_model_name(self) -> str:
        return self._settings.llm_model
