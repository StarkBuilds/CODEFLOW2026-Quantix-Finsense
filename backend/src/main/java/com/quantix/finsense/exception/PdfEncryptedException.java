package com.quantix.finsense.exception;

/**
 * Thrown when the uploaded PDF is password-protected and the user
 * did not supply the correct decryption password.
 */
public class PdfEncryptedException extends RuntimeException {

    public PdfEncryptedException() {
        super("This PDF is password protected.");
    }

    public PdfEncryptedException(String message) {
        super(message);
    }

    public PdfEncryptedException(String message, Throwable cause) {
        super(message, cause);
    }
}
