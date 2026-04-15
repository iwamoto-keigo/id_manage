from fastapi import FastAPI

from .routers import events, roles, sessions, users

app = FastAPI(
    title="ID Manage Demo API",
    description="FastAPI backend for the ID management demo app",
    version="0.1.0",
)

app.include_router(users.router)
app.include_router(roles.router)
app.include_router(sessions.router)
app.include_router(events.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
