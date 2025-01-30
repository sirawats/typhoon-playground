from typing import List, Optional
from fastapi import Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import func

import app.db.orm as orm
from app.core.base_repository import BaseRepository
from app.db.session import get_async_session


class ChatRepo:
    def __init__(self, session: AsyncSession = Depends(get_async_session)) -> None:
        self.session = session
        self.chat_session_repo = BaseRepository[orm.ChatSession](orm.ChatSession, session)
        self.chat_message_repo = BaseRepository[orm.ChatMessage](orm.ChatMessage, session)
        self.feedback_repo = BaseRepository[orm.Feedback](orm.Feedback, session)

    async def create_session(self, user_id: int, title: Optional[str] = None) -> orm.ChatSession:
        """Create a new chat session for a user with optional title"""
        chat_session = orm.ChatSession(user_id=user_id, title=title or "New Chat")
        return await self.chat_session_repo.create(chat_session, ["user", "messages"])

    async def update_session_title(self, session_id: int, user_id: int, title: str) -> orm.ChatSession:
        """Update the title of a chat session"""
        return await self.chat_session_repo.update(session_id, {"title": title})

    async def get_user_sessions(self, user_id: int, skip: int = 0, limit: int = 50) -> List[orm.ChatSession]:
        """Get paginated chat sessions for a user with message counts"""
        result = await self.session.execute(
            select(orm.ChatSession)
            .where(orm.ChatSession.user_id == user_id)
            # .options(selectinload(orm.ChatSession.messages))
            .order_by(orm.ChatSession.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_session(self, session_id: int, user_id: Optional[int] = None) -> orm.ChatSession:
        """Get a specific chat session with its messages and feedback"""
        query = (
            select(orm.ChatSession)
            .where(orm.ChatSession.id == session_id)
            .options(
                joinedload(orm.ChatSession.messages).joinedload(orm.ChatMessage.feedback),
            )
        )

        if user_id is not None:
            query = query.where(orm.ChatSession.user_id == user_id)

        result = await self.session.execute(query)
        session = result.unique().scalar_one_or_none()

        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        return session

    async def create_message(
        self,
        session_id: int,
        content: str,
        sender: str,
        tokens: int = 0,
        tokens_per_second: int = 0,
        response_time_ms: Optional[float] = None,
    ) -> orm.ChatMessage:
        """Create a new chat message with performance metrics"""
        chat_message = orm.ChatMessage(
            session_id=session_id,
            content=content,
            sender=sender,
            tokens=tokens,
            tokens_per_second=tokens_per_second,
            response_time_ms=response_time_ms,
        )
        # Update session's updated_at timestamp
        await self.session.execute(update(orm.ChatSession).where(orm.ChatSession.id == session_id).values(updated_at=func.now()))
        return await self.chat_message_repo.create(chat_message)

    async def get_message(self, message_id: int) -> orm.ChatMessage:
        """Get a specific chat message with its feedback"""
        result = await self.session.execute(
            select(orm.ChatMessage).where(orm.ChatMessage.id == message_id).options(selectinload(orm.ChatMessage.feedback))
        )
        message = result.scalar_one_or_none()

        if not message:
            raise HTTPException(status_code=404, detail="Chat message not found")

        return message

    async def add_feedback(self, message_id: int, feedback_type: orm.FeedbackTypeEnum) -> orm.Feedback:
        """Add or update feedback for a message"""
        # Check if feedback exists
        result = await self.session.execute(select(orm.Feedback).where(orm.Feedback.message_id == message_id))
        existing_feedback = result.scalar_one_or_none()

        if existing_feedback:
            return await self.feedback_repo.update(existing_feedback.id, {"feedback_type": feedback_type})

        feedback = orm.Feedback(message_id=message_id, feedback_type=feedback_type)
        return await self.feedback_repo.create(feedback)

    async def delete_session(self, session_id: int) -> None:
        """Delete a chat session and all its messages"""
        await self.chat_session_repo.delete(session_id)

    async def get_session_metrics(self, session_id: int) -> dict:
        """Get aggregate metrics for a chat session"""
        result = await self.session.execute(
            select(
                func.count(orm.ChatMessage.id).label("total_messages"),
                func.sum(orm.ChatMessage.tokens).label("total_tokens"),
                func.avg(orm.ChatMessage.tokens_per_second).label("avg_tokens_per_second"),
                func.avg(orm.ChatMessage.response_time_ms).label("avg_response_time_ms"),
            )
            .where(orm.ChatMessage.session_id == session_id)
            .where(orm.ChatMessage.sender == "assistant")
        )
        metrics = result.one()

        return {
            "total_messages": metrics.total_messages,
            "total_tokens": metrics.total_tokens or 0,
            "avg_tokens_per_second": round(metrics.avg_tokens_per_second or 0, 2),
            "avg_response_time_ms": round(metrics.avg_response_time_ms or 0, 2),
        }
