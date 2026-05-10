from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=32)
    email: str | None = Field(default=None, max_length=100, pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    phone: str | None = Field(default=None, max_length=20)
    captchaId: str
    captchaValue: str


class LoginRequest(BaseModel):
    username: str
    password: str
    captchaId: str | None = None
    captchaValue: str | None = None


class RefreshTokenRequest(BaseModel):
    refreshToken: str


class UserInfoBrief(BaseModel):
    id: int
    username: str
    nickname: str
    avatarUrl: str
    level: int
    experience: int
    roles: list[str]

    model_config = {"from_attributes": True}


class LoginData(BaseModel):
    userId: int
    token: str
    refreshToken: str
    expiresIn: int
    userInfo: UserInfoBrief


class RegisterData(BaseModel):
    userId: int
    token: str
    refreshToken: str
    expiresIn: int


class TokenData(BaseModel):
    token: str
    refreshToken: str
    expiresIn: int


class CaptchaData(BaseModel):
    captchaId: str
    captchaImageBase64: str
