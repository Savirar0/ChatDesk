"""SQLite persistence boundary for the local application."""

import os
from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    inspect,
    text,
)
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./echo_mind.db")
engine = create_engine(
    DATABASE_URL,
    connect_args=(
        {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    ),
    future=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    website_domain = Column(String(255), default="")
    industry = Column(String(120), default="")
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    kind = Column(String(30), default="text")
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class BotSettings(Base):
    __tablename__ = "bot_settings"
    id = Column(Integer, primary_key=True)
    company_id = Column(
        Integer, ForeignKey("companies.id"), unique=True, nullable=False, index=True
    )
    avoid_topics = Column(Text, default="")
    tone = Column(String(100), default="helpful and concise")
    escalation_rules = Column(Text, default="refunds, legal matters, angry customers")
    never_promise = Column(Text, default="")
    bot_name = Column(String(100), default="Support Assistant")
    welcome_message = Column(Text, default="Hi! How can I help today?")
    fallback_message = Column(
        Text,
        default="I don't have enough information to answer that. Our team can help.",
    )
    general_questions_enabled = Column(Boolean, default=False, nullable=False)


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    visitor_id = Column(String(80), nullable=False, index=True)
    status = Column(String(30), default="open")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    conversation_id = Column(
        Integer, ForeignKey("conversations.id"), nullable=False, index=True
    )
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Issue(Base):
    __tablename__ = "issues"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    conversation_id = Column(
        Integer, ForeignKey("conversations.id"), unique=True, nullable=False
    )
    summary = Column(Text, nullable=False)
    status = Column(String(30), default="open")
    created_at = Column(DateTime, default=datetime.utcnow)


class HandoffRequest(Base):
    __tablename__ = "handoff_requests"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    conversation_id = Column(
        Integer, ForeignKey("conversations.id"), nullable=False, index=True
    )
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), default="")
    status = Column(String(30), default="open")
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)
    if "general_questions_enabled" not in {
        column["name"] for column in inspect(engine).get_columns("bot_settings")
    }:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE bot_settings ADD COLUMN general_questions_enabled BOOLEAN NOT NULL DEFAULT 0"
                )
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
