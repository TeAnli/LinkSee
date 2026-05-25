from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=32)
    email: str | None = Field(default=None, max_length=100, pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    emailCode: str | None = Field(default=None, max_length=6)
    captchaId: str
    captchaValue: str


class LoginRequest(BaseModel):
    username: str
    password: str
    captchaId: str | None = None
    captchaValue: str | None = None


class SendEmailCodeRequest(BaseModel):
    email: str
    type: str = "register"  # "register" or "reset-password"
    


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


class ResetPasswordRequest(BaseModel):
    email: str = Field(max_length=100, pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    code: str = Field(min_length=6, max_length=6)
    newPassword: str = Field(min_length=8, max_length=32)
    confirmPassword: str = Field(min_length=8, max_length=32)


class CaptchaData(BaseModel):
    captchaId: str
    captchaImageBase64: str


class OAuthLoginRequest(BaseModel):
    provider: str = Field(pattern=r"^(github|google|qq|discord)$")
    code: str
    state: str


class OAuthProviderInfo(BaseModel):
    provider: str
    name: str
    icon: str
    color: str
    enabled: bool


class OAuthBindItem(BaseModel):
    provider: str
    name: str
    icon: str
    bound: bool
    bindAt: str | None = None
