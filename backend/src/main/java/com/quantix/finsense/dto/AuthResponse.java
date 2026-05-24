package com.quantix.finsense.dto;

public record AuthResponse(String token, String email, String displayName, Long userId) {}
