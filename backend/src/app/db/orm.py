from datetime import datetime
from typing import Optional, List
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Float, Enum, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import enum


class Base(DeclarativeBase):
    pass


class UserAccount(Base):
    """
    User account model for authentication and security-related data
    """

    __tablename__ = "user_accounts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    password_salt: Mapped[str] = mapped_column(String(255), nullable=False)
    password_iterations: Mapped[int] = mapped_column(Integer, default=100000)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")
    is_superuser: Mapped[bool] = mapped_column(Boolean, server_default="false")
    last_login_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    profile: Mapped["UserProfile"] = relationship(back_populates="account", uselist=False, cascade="all, delete-orphan")
    chat_sessions: Mapped[List["ChatSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<UserAccount(id={self.id!r}, email={self.email!r})>"


class UserProfile(Base):
    """
    User profile model for personal information and preferences
    """

    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("user_accounts.id", ondelete="CASCADE"), unique=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    account: Mapped["UserAccount"] = relationship(back_populates="profile")

    def __repr__(self) -> str:
        return f"<UserProfile(id={self.id!r}, full_name={self.full_name!r}, account_id={self.account_id!r})>"


class ChatSession(Base):
    """
    Chat session model to group related chat messages
    """

    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user_accounts.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    user: Mapped["UserAccount"] = relationship(back_populates="chat_sessions")
    messages: Mapped[List["ChatMessage"]] = relationship(back_populates="session", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<ChatSession(id={self.id!r}, user_id={self.user_id!r})>"


class ChatMessage(Base):
    """
    Chat message model to store individual messages within a session
    """

    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"))
    sender: Mapped[str] = mapped_column(String(50))  # 'user' or 'llm'
    content: Mapped[Text] = mapped_column(Text, nullable=False)
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    tokens_per_second: Mapped[int] = mapped_column(Integer, default=0)
    response_time_ms: Mapped[Float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    session: Mapped["ChatSession"] = relationship(back_populates="messages")
    feedback: Mapped["Feedback"] = relationship(
        back_populates="message", uselist=False, cascade="all, delete-orphan", passive_deletes=True
    )

    def __repr__(self) -> str:
        return f"<ChatMessage(id={self.id!r}, sender={self.sender!r}, session_id={self.session_id!r})>"


class FeedbackTypeEnum(enum.Enum):
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"


class Feedback(Base):
    """
    Feedback model to store user feedback on chat messages
    """

    __tablename__ = "feedbacks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    message_id: Mapped[int] = mapped_column(ForeignKey("chat_messages.id", ondelete="CASCADE"), unique=True)
    feedback_type: Mapped[FeedbackTypeEnum] = mapped_column(Enum(FeedbackTypeEnum), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    message: Mapped["ChatMessage"] = relationship(back_populates="feedback")

    def __repr__(self) -> str:
        return f"<Feedback(id={self.id!r}, message_id={self.message_id!r}, feedback_type={self.feedback_type!r})>"
