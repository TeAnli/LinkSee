from fastapi import HTTPException


class AppException(HTTPException):
    def __init__(self, code: int, message: str, status_code: int = 400):
        self.code = code
        super().__init__(status_code=status_code, detail={"code": code, "message": message})
