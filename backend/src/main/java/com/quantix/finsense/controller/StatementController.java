package com.quantix.finsense.controller;

import com.quantix.finsense.dto.UploadResponse;
import com.quantix.finsense.exception.PdfEncryptedException;
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

    public StatementController(StatementUploadService uploadService) {
        this.uploadService = uploadService;
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
            uploadService.process(file, password);
            Object aiSummaryDataBundle = uploadService.getStatementSummaryFromFlask(file, password);
            return ResponseEntity.ok(aiSummaryDataBundle);
        } catch (PdfEncryptedException e) {
            return ResponseEntity.status(HttpStatus.LOCKED)
                    .body(Map.of("error", "LOCKED", "message", "This PDF is password protected."));
        }
    }
}
