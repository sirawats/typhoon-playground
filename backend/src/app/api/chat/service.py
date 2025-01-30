import time
from typing import AsyncGenerator
import httpx
from fastapi import Depends
import asyncio
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from pydantic import SecretStr

from app.api.chat.repo import ChatRepo
from app.config import settings
from app.db import orm


class ChatService:
    def __init__(self, chat_repo: ChatRepo = Depends()):
        self.chat_repo = chat_repo
        self.client = httpx.AsyncClient(
            base_url=settings.TYPHOON_API_URL, headers={"Authorization": f"Bearer {settings.TYPHOON_API_KEY}"}
        )

    async def stream_response(
        self,
        session: orm.ChatSession,
        model: str,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        top_p: float = 0.9,
        top_k: int = 50,
        repetition_penalty: float = 1.0,
    ) -> AsyncGenerator[str, None]:
        """Stream response from LLM"""
        try:
            start_time = time.time()
            total_tokens = 0
            full_content = []

            # Initialize LangChain ChatOpenAI
            llm = ChatOpenAI(
                model=model,
                base_url=settings.TYPHOON_API_URL,
                api_key=SecretStr(settings.TYPHOON_API_KEY),
                streaming=True,
                max_completion_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                # top_k=top_k, # LangChain doesn't support top_k
                # repetition_penalty=repetition_penalty, # LangChain doesn't support repetition_penalty
            )

            # Create message history
            messages = [
                HumanMessage(content=str(m.content)) if m.sender == "user" else SystemMessage(content=str(m.content))
                for m in session.messages
            ]
            messages.append(HumanMessage(content=prompt))
            print(f"# len messages: {len(messages)}")
            print(f"# Params: {model}, {max_tokens}, {temperature}, {top_p}, {top_k}, {repetition_penalty}")

            # Stream the response
            async for chunk in llm.astream(messages):
                if chunk.content:
                    total_tokens += 1
                    full_content.append(chunk.content)
                    yield chunk.content

            # Calculate final metrics
            end_time = time.time()
            content = "".join(full_content)
            response_time = (end_time - start_time) * 1000
            tokens_per_second = int(total_tokens / (response_time / 1000))

            # Store complete response
            await self.chat_repo.create_message(
                session_id=session.id,
                content=content,
                sender="assistant",
                tokens=total_tokens,
                tokens_per_second=tokens_per_second,
                response_time_ms=response_time,
            )

        except Exception as e:
            print(f"LangChain streaming error: {str(e)}")
            raise

    async def mock_stream_response(
        self,
        session: orm.ChatSession,
        model: str,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        top_p: float = 0.9,
        top_k: int = 50,
    ) -> AsyncGenerator[str, None]:
        """Mock streaming response for testing"""
        try:
            start_time = time.time()
            total_tokens = 0
            full_content = []

            # Mock response text
            response_text = (
                "This is a mock response that will be streamed word by word. "
                "It simulates how the real AI would respond, but in a controlled way. "
                "This is useful for testing the streaming functionality."
            )

            # Stream each word with a small delay
            for word in response_text.split():
                await asyncio.sleep(0.2)  # Simulate thinking time
                word_with_space = word + " "
                total_tokens += 1
                full_content.append(word_with_space)
                yield word_with_space

            # Calculate final metrics
            end_time = time.time()
            content = "".join(full_content)
            response_time = (end_time - start_time) * 1000
            tokens_per_second = int(total_tokens / (response_time / 1000))

            # Store complete response
            await self.chat_repo.create_message(
                session_id=session.id,
                content=content,
                sender="assistant",
                tokens=total_tokens,
                tokens_per_second=tokens_per_second,
                response_time_ms=response_time,
            )

        except Exception as e:
            print(f"Mock streaming error: {str(e)}")
            raise
