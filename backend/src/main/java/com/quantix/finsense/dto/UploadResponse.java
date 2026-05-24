package com.quantix.finsense.dto;

public record UploadResponse(
        String status,
        String message,
        int parsedCount,
        int savedCount,
        int duplicateCount,
        int uncategorizedCount) {}
