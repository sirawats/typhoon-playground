import typer
from pathlib import Path

app = typer.Typer()


# Helper function to create directories and files
def create_file(directory: Path, filename: str, content: str):
    directory.mkdir(parents=True, exist_ok=True)
    file_path = directory / filename
    if not file_path.exists():
        file_path.write_text(content)
        typer.echo(f"Created {file_path}")
    else:
        typer.echo(f"{file_path} already exists")


def read_file(file_path: Path):
    if file_path.exists():
        return file_path.read_text()
    else:
        typer.echo(f"{file_path} does not exist")
        return None


@app.command()
def create_model(name: str, version: str = "v1"):
    """
    Create a new model with the given NAME.
    Optionally specify the API version (default is v1).
    """
    model_content = f"""
from sqlalchemy import Column, Integer, String
from app.db.models import Base

class {name.capitalize()}(Base):
    __tablename__ = '{name.lower()}'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
"""
    create_file(Path(f"src/app/api/{version}/models"), f"{name.lower()}.py", model_content)
