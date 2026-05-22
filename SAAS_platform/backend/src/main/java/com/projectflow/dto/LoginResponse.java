package com.projectflow.dto;

import com.projectflow.entity.Role;

public class LoginResponse {
    private String token;
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private String avatarUrl;

    public LoginResponse() {}

    public LoginResponse(String token, Long id, String email, String fullName, Role role, String avatarUrl) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.avatarUrl = avatarUrl;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private String avatarUrl;

        public Builder token(String token) { this.token = token; return this; }
        public Builder id(Long id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder role(Role role) { this.role = role; return this; }
        public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }

        public LoginResponse build() {
            return new LoginResponse(token, id, email, fullName, role, avatarUrl);
        }
    }
}
