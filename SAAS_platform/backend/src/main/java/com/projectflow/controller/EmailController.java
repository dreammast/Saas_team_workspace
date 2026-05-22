package com.projectflow.controller;

import com.projectflow.entity.EmailLog;
import com.projectflow.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Value("${projectflow.frontend.url}")
    private String frontendUrl;

    @GetMapping("/logs")
    public ResponseEntity<List<EmailLog>> getEmailLogs() {
        return ResponseEntity.ok(emailService.getEmailLogs());
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTestEmail(@RequestBody CustomEmailRequest request) {
        if (request.getRecipient() == null || request.getRecipient().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Recipient email is required.");
        }
        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Subject is required.");
        }
        if (request.getBody() == null || request.getBody().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Body is required.");
        }

        // Build premium HTML wrapper if they choose to wrap it, or send direct HTML
        String htmlBody = emailService.buildNotificationHtml(
                "ProjectFlow Sandbox User",
                request.getSubject(),
                request.getBody(),
                "Open Workspace Dashboard",
                frontendUrl
        );

        emailService.sendEmail(request.getRecipient(), request.getSubject(), htmlBody, "TEST");

        return ResponseEntity.ok("Email dispatched asynchronously. Check logs below for status.");
    }

    public static class CustomEmailRequest {
        private String recipient;
        private String subject;
        private String body;

        public CustomEmailRequest() {}

        public CustomEmailRequest(String recipient, String subject, String body) {
            this.recipient = recipient;
            this.subject = subject;
            this.body = body;
        }

        public String getRecipient() { return recipient; }
        public void setRecipient(String recipient) { this.recipient = recipient; }

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }

        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
    }
}
