package com.projectflow.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String channelId;

    @Column(nullable = false)
    private String senderEmail;

    @Column(nullable = false)
    private String senderName;

    private String senderAvatar;

    private String senderColor;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public ChatMessage() {}

    public ChatMessage(Long id, String channelId, String senderEmail, String senderName, String senderAvatar, String senderColor, String content, LocalDateTime createdAt) {
        this.id = id;
        this.channelId = channelId;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.senderAvatar = senderAvatar;
        this.senderColor = senderColor;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderAvatar() { return senderAvatar; }
    public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }

    public String getSenderColor() { return senderColor; }
    public void setSenderColor(String senderColor) { this.senderColor = senderColor; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String channelId;
        private String senderEmail;
        private String senderName;
        private String senderAvatar;
        private String senderColor;
        private String content;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder channelId(String channelId) { this.channelId = channelId; return this; }
        public Builder senderEmail(String senderEmail) { this.senderEmail = senderEmail; return this; }
        public Builder senderName(String senderName) { this.senderName = senderName; return this; }
        public Builder senderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; return this; }
        public Builder senderColor(String senderColor) { this.senderColor = senderColor; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ChatMessage build() {
            return new ChatMessage(id, channelId, senderEmail, senderName, senderAvatar, senderColor, content, createdAt);
        }
    }
}
