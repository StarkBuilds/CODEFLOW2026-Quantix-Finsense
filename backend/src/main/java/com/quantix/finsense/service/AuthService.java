package com.quantix.finsense.service;

import com.quantix.finsense.dto.AuthRequest;
import com.quantix.finsense.dto.AuthResponse;
import com.quantix.finsense.entity.User;
import com.quantix.finsense.repository.UserRepository;
import com.quantix.finsense.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        String displayName = request.displayName() == null || request.displayName().isBlank()
                ? request.email().split("@")[0]
                : request.displayName().trim();
        User user = userRepository.save(User.builder()
                .email(request.email().trim().toLowerCase())
                .displayName(displayName)
                .passwordHash(passwordEncoder.encode(request.password()))
                .build());
        return toResponse(user);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository
                .findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return toResponse(user);
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(jwtService.generateToken(user), user.getEmail(), user.getDisplayName(), user.getId());
    }
}
