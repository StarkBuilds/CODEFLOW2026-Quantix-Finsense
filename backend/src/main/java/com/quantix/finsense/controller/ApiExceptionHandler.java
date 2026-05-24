package com.quantix.finsense.controller;

import com.quantix.finsense.dto.UploadResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<UploadResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(new UploadResponse("error", ex.getMessage(), 0, 0, 0, 0));
    }
}
