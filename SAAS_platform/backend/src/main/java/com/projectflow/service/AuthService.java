package com.projectflow.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectflow.dto.GoogleRegisterRequest;
import com.projectflow.dto.LoginRequest;
import com.projectflow.dto.LoginResponse;
import com.projectflow.dto.RegisterRequest;
import com.projectflow.entity.Role;
import com.projectflow.entity.User;
import com.projectflow.repository.UserRepository;
import com.projectflow.security.JwtTokenProvider;
import com.projectflow.entity.Channel;
import com.projectflow.repository.ChannelRepository;

import jakarta.annotation.PostConstruct;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostConstruct
    @Transactional
    public void seedDemoUsers() {
        if (!userRepository.existsByEmail("manager@projectflow.com")) {
            User manager = User.builder()
                    .email("manager@projectflow.com")
                    .password(passwordEncoder.encode("Manager@123"))
                    .fullName("Project Manager")
                    .role(Role.ROLE_MANAGER)
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100")
                    .build();
            userRepository.save(manager);
        }

        if (!userRepository.existsByEmail("employee@projectflow.com")) {
            User employee = User.builder()
                    .email("employee@projectflow.com")
                    .password(passwordEncoder.encode("Employee@123"))
                    .fullName("Developer Employee")
                    .role(Role.ROLE_EMPLOYEE)
                    .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100")
                    .build();
            userRepository.save(employee);
        }

        if (!userRepository.existsByEmail("admin@projectflow.com")) {
            User admin = User.builder()
                    .email("admin@projectflow.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("Super Admin")
                    .role(Role.ROLE_ADMIN)
                    .avatarUrl("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100")
                    .build();
            userRepository.save(admin);
        }

        // Seed default channels if they don't exist
        seedDefaultChannel("ch-general", "general", "Company-wide updates and announcements.");
        seedDefaultChannel("ch-website-redesign", "website-redesign", "Discussions related to the marketing website redesign.");
        seedDefaultChannel("ch-mobile-app-v2", "mobile-app-v2", "Syncing up on iOS & Android sprints.");
        seedDefaultChannel("ch-api-migration", "api-migration", "Refactoring REST endpoints to GraphQL.");
    }

    private void seedDefaultChannel(String id, String name, String description) {
        if (!channelRepository.existsById(id)) {
            channelRepository.save(new Channel(id, name, description));
        }
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .build();

        return userRepository.save(user);
    }

    private String sanitizeAvatarUrl(String url) {
        if (url == null) return null;
        if (url.length() > 255) {
            int idx = url.indexOf('=');
            if (idx != -1 && idx < 255) {
                return url.substring(0, idx);
            }
            return url.substring(0, 255);
        }
        return url;
    }

    @Transactional
    public LoginResponse loginOrRegisterGoogleUser(GoogleRegisterRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .map(existingUser -> {
                    if ("naledushyanth@gmail.com".equalsIgnoreCase(existingUser.getEmail())) {
                        if (existingUser.getRole() != Role.ROLE_MANAGER && existingUser.getRole() != Role.ROLE_ADMIN) {
                            existingUser.setRole(Role.ROLE_MANAGER);
                            return userRepository.save(existingUser);
                        }
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    Role assignedRole = Role.ROLE_EMPLOYEE;
                    if ("naledushyanth@gmail.com".equalsIgnoreCase(request.getEmail())) {
                        assignedRole = Role.ROLE_MANAGER;
                    }
                    User newUser = User.builder()
                            .email(request.getEmail())
                            .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                            .fullName(request.getFullName())
                            .role(assignedRole)
                            .avatarUrl(sanitizeAvatarUrl(request.getAvatarUrl()))
                            .build();
                    return userRepository.save(newUser);
                });

        String token = tokenProvider.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .avatarUrl(sanitizeAvatarUrl(user.getAvatarUrl()))
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = (User) authentication.getPrincipal();
        String token = tokenProvider.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
