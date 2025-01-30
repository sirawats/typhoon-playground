import json
import time
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

import app.db.orm as orm
from app.api.chat.repo import ChatRepo
from app.api.chat.schema import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionMessagesResponse,
    ChatSessionMetrics,
    ChatSessionResponse,
    ChatSessionUpdate,
    FeedbackCreate,
    FeedbackResponse,
)
from app.api.chat.service import ChatService
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])


# Session Management
@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    data: ChatSessionCreate, current_user: orm.UserAccount = Depends(get_current_user), chat_repo: ChatRepo = Depends()
) -> ChatSessionResponse:
    """Create new chat session for current user"""
    session = await chat_repo.create_session(current_user.id, data.title)
    return ChatSessionResponse.model_validate(session)


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    skip: int = 0, limit: int = 50, current_user: orm.UserAccount = Depends(get_current_user), chat_repo: ChatRepo = Depends()
) -> List[ChatSessionResponse]:
    """Get paginated chat history"""
    sessions = await chat_repo.get_user_sessions(current_user.id, skip, limit)
    return [ChatSessionResponse.model_validate(session) for session in sessions]


@router.get("/sessions/{session_id}", response_model=ChatSessionMessagesResponse)
async def get_chat_session(
    session_id: int, current_user: orm.UserAccount = Depends(get_current_user), chat_repo: ChatRepo = Depends()
) -> ChatSessionMessagesResponse:
    """Get specific chat session with messages"""
    session = await chat_repo.get_session(session_id, current_user.id)
    return ChatSessionMessagesResponse.model_validate(session)


@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_chat_session(
    session_id: int,
    data: ChatSessionUpdate,
    current_user: orm.UserAccount = Depends(get_current_user),
    chat_repo: ChatRepo = Depends(),
) -> ChatSessionResponse:
    """Update session title"""
    session = await chat_repo.update_session_title(session_id, current_user.id, data.title)
    return ChatSessionResponse.model_validate(session)


@router.delete("/sessions/{session_id}", status_code=200)
async def delete_chat_session(
    session_id: int, current_user: orm.UserAccount = Depends(get_current_user), chat_repo: ChatRepo = Depends()
) -> None:
    """Delete chat session"""
    await chat_repo.get_session(session_id, current_user.id)
    await chat_repo.delete_session(session_id)


@router.post("/sessions/{session_id}/stream")
async def stream_chat_response(
    session_id: int,
    data: ChatMessageCreate,
    current_user: orm.UserAccount = Depends(get_current_user),
    chat_repo: ChatRepo = Depends(),
    chat_service: ChatService = Depends(),
):
    """Stream AI response via SSE"""
    try:
        # Verify session ownership
        session = await chat_repo.get_session(session_id, current_user.id)

        # Store user message first
        user_message = await chat_repo.create_message(session_id=session_id, content=data.content, sender="user")

        async def generate():
            try:
                start_time = time.time()
                total_tokens = 0
                full_content = []

                print(f"# model: {data.model}")

                # async for chunk in chat_service.mock_stream_response(session_id=session_id, model=data.model, prompt=data.content):
                async for chunk in chat_service.stream_response(
                    session=session,
                    model=data.model,
                    prompt=data.content,
                    max_tokens=data.output_length,
                    temperature=data.temperature,
                    top_p=data.top_p,
                    top_k=data.top_k,
                    repetition_penalty=data.repetition_penalty,
                ):
                    total_tokens += 1
                    full_content.append(chunk)
                    # Proper SSE format
                    yield f"data: {json.dumps({'content': chunk})}\n\n"

                # Calculate metrics
                end_time = time.time()
                response_time = (end_time - start_time) * 1000
                content = "".join(full_content)
                tokens_per_second = int(total_tokens / (response_time / 1000))

            except Exception as e:
                # Send error event
                yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
                raise

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Feedback System
@router.post("/messages/{message_id}/feedback", response_model=FeedbackResponse)
async def add_message_feedback(
    message_id: int,
    data: FeedbackCreate,
    current_user: orm.UserAccount = Depends(get_current_user),
    chat_repo: ChatRepo = Depends(),
) -> FeedbackResponse:
    """Add/update message feedback"""
    # Verify ownership
    message = await chat_repo.get_message(message_id)
    await chat_repo.get_session(message.session_id, current_user.id)

    feedback = await chat_repo.add_feedback(message_id, data.feedback_type)
    return FeedbackResponse.model_validate(feedback)


@router.get("/sessions/{session_id}/metrics", response_model=ChatSessionMetrics)
async def get_session_metrics(
    session_id: int, current_user: orm.UserAccount = Depends(get_current_user), chat_repo: ChatRepo = Depends()
) -> ChatSessionMetrics:
    """Get session analytics"""
    await chat_repo.get_session(session_id, current_user.id)
    metrics = await chat_repo.get_session_metrics(session_id)
    return ChatSessionMetrics(**metrics)
