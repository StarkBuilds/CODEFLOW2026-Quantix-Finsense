package com.quantix.finsense.controller;

import com.quantix.finsense.dto.UploadResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StatementController {

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> upload(@RequestParam("file") MultipartFile file) {
        // PDF parsing and ML pipeline will be wired here later.
        return ResponseEntity.ok(
                new UploadResponse("success", "Statement uploaded and queued for ML processing"));
    }
}
