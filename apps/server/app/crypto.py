import base64
import logging
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.config import settings

logger = logging.getLogger(__name__)

PUBLIC_KEY_PATH = Path(settings.rsa_key_dir) / "public_key.pem"
PRIVATE_KEY_PATH = Path(settings.rsa_key_dir) / "private_key.pem"

_public_key_pem: str | None = None
_private_key: rsa.RSAPrivateKey | None = None


def generate_rsa_key_pair() -> None:
    Path(settings.rsa_key_dir).mkdir(parents=True, exist_ok=True)
    if PUBLIC_KEY_PATH.exists() and PRIVATE_KEY_PATH.exists():
        logger.info("RSA key pair already exists, skipping generation")
        return

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_pem = (
        private_key.public_key()
        .public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
    )

    PRIVATE_KEY_PATH.write_bytes(private_pem)
    PUBLIC_KEY_PATH.write_bytes(public_pem)
    logger.info("Generated new RSA-2048 key pair in %s", settings.rsa_key_dir)


def _load_keys() -> None:
    global _public_key_pem, _private_key
    if not PUBLIC_KEY_PATH.exists() or not PRIVATE_KEY_PATH.exists():
        generate_rsa_key_pair()
    _public_key_pem = PUBLIC_KEY_PATH.read_text()
    _private_key = serialization.load_pem_private_key(
        PRIVATE_KEY_PATH.read_bytes(),
        password=None,
    )


def get_public_key_pem() -> str:
    if _public_key_pem is None:
        _load_keys()
    return _public_key_pem


def get_private_key() -> rsa.RSAPrivateKey:
    global _private_key
    if _private_key is None:
        _load_keys()
    return _private_key


def rsa_decrypt(ciphertext: bytes) -> bytes:
    return get_private_key().decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )


def aes_decrypt(key: bytes, iv: bytes, ciphertext: bytes) -> bytes:
    return AESGCM(key).decrypt(iv, ciphertext, None)


def decrypt_payload(encrypted_body: dict) -> bytes:
    encrypted_key = base64.b64decode(encrypted_body["key"])
    iv = base64.b64decode(encrypted_body["iv"])
    ciphertext = base64.b64decode(encrypted_body["data"])

    aes_key = rsa_decrypt(encrypted_key)
    plaintext = aes_decrypt(aes_key, iv, ciphertext)
    return plaintext
