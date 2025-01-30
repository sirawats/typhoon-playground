#!/bin/bash

if [ -z "$1" ]; then
    echo "Missing revision message"
    echo "Usage: $0 <revision_message>"
    exit 1
fi

uv run alembic revision --autogenerate -m "$1"
