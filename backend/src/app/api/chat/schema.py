from datetime import datetime
from typing import List, Optional
from pydantic import ConfigDict
from app.core.base_schema import CamelModel
from app.db.orm import FeedbackTypeEnum


# Input schemas
class ChatSessionCreate(CamelModel):
    title: Optional[str] = None  # Allow creating session without title


class ChatSessionUpdate(CamelModel):
    title: str  # Title is required when updating


class ChatMessageCreate(CamelModel):
    model: str = "typhoon-v1.5-instruct"
    output_length: int = 512
    temperature: float = 0.7
    top_p: float = 0.7
    top_k: int = 50
    repetition_penalty: float = 1.0
    content: str  # User's message content


class FeedbackCreate(CamelModel):
    feedback_type: FeedbackTypeEnum  # upvote/downvote only


# Response schemas
class FeedbackResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message_id: int
    feedback_type: FeedbackTypeEnum
    created_at: datetime


class ChatMessageResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    content: str
    sender: str  # user/assistant
    tokens: Optional[int] = None  # Token count for AI responses
    tokens_per_second: Optional[int] = None  # Generation speed
    response_time_ms: Optional[float] = None  # Total response time
    created_at: datetime
    feedback: Optional[FeedbackResponse] = None  # User feedback if any


class ChatSessionResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime


class ChatSessionMessagesResponse(CamelModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse]  # Include full message history


class ChatSessionMetrics(CamelModel):
    total_messages: int  # Total messages in session
    total_tokens: int  # Total tokens generated
    avg_tokens_per_second: float  # Average generation speed
    avg_response_time_ms: float  # Average response latency
