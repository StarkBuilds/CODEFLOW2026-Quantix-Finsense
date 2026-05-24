package com.quantix.finsense.controller;

import com.quantix.finsense.dto.UploadResponse;
import com.quantix.finsense.entity.User;
import com.quantix.finsense.exception.PdfEncryptedException;
import com.quantix.finsense.security.CurrentUserService;
import com.quantix.finsense.service.StatementUploadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StatementController {

    private final StatementUploadService uploadService;
    private final CurrentUserService currentUserService;

    public StatementController(StatementUploadService uploadService, CurrentUserService currentUserService) {
        this.uploadService = uploadService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "password", required = false) String password) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new UploadResponse("error", "Uploaded file is empty", 0, 0, 0, 0));
        }
        
        try {
            User user = currentUserService.requireCurrentUser();
            uploadService.process(file, password, user);
            Object aiSummaryDataBundle = uploadService.getStatementSummaryFromFlask(file, password);
            return ResponseEntity.ok(aiSummaryDataBundle);
        } catch (PdfEncryptedException e) {
            return ResponseEntity.status(HttpStatus.LOCKED)
                    .body(Map.of("error", "LOCKED", "message", "This PDF is password protected."));
        }
    }
}
