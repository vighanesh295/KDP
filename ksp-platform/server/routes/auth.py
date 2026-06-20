import json
import os
from datetime import datetime, timedelta

import jwt
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_PATH = os.path.join(BASE_DIR, "data", "users.json")
JWT_ALGORITHM = "HS256"
SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret")

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserInfo(BaseModel):
    username: str
    role: str
    name: str
    exp: int | None = None


def load_users() -> list[dict]:
    try:
        with open(USERS_PATH, "r", encoding="utf-8") as users_file:
            return json.load(users_file)
    except FileNotFoundError:
        return []


def authenticate_user(username: str, password: str) -> dict | None:
    users = load_users()
    return next(
        (
            user
            for user in users
            if user.get("username") == username and user.get("password") == password
        ),
        None,
    )


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=1))
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_bearer_token(authorization: str | None = Header(None)) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    user = authenticate_user(payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = {
        "username": user["username"],
        "role": user["role"],
        "name": user["name"],
    }
    access_token = create_access_token(token_data)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserInfo)
def me(token: str = Depends(get_bearer_token)):
    decoded = decode_access_token(token)
    return {
        "username": decoded.get("username"),
        "role": decoded.get("role"),
        "name": decoded.get("name"),
        "exp": decoded.get("exp"),
    }
