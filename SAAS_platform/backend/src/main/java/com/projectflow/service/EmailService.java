package com.projectflow.service;

import com.projectflow.entity.EmailLog;
import com.projectflow.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailLogRepository emailLogRepository;

    private static final String SENDER_EMAIL = "dreammasterorigin@gmail.com";
    private static final String REDIRECT_TARGET = "dreammasterorigin@gmail.com";

    /**
     * Sends an email asynchronously and logs the result to the database.
     */
    @Async
    public void sendEmail(String to, String subject, String body, String type) {
        String finalRecipient = to;

        // Redirect logic for mock emails
        if (to == null || to.trim().isEmpty() || to.contains("@example.com") || to.contains("@projectflow.com")) {
            finalRecipient = REDIRECT_TARGET;
        }

        EmailLog log = EmailLog.builder()
                .recipient(finalRecipient)
                .subject(subject)
                .body(body)
                .type(type)
                .build();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(SENDER_EMAIL, "ProjectFlow Alerts");
            helper.setTo(finalRecipient);
            helper.setSubject(subject);
            helper.setText(body, true); // Set to true to enable HTML rendering

            mailSender.send(message);

            log.setStatus("SENT");
            emailLogRepository.save(log);
        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setErrorMessage(e.getMessage() != null ? e.getMessage() : "Unknown SMTP failure");
            emailLogRepository.save(log);
        }
    }

    /**
     * Retrieves all sent email logs.
     */
    public List<EmailLog> getEmailLogs() {
        return emailLogRepository.findAllByOrderBySentAtDesc();
    }

    /**
     * Builds a premium HTML template wrapper for notifications.
     */
    public String buildNotificationHtml(String recipientName, String title, String description, String actionButtonText, String actionUrl) {
        return "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #F4F5F7; padding: 40px 20px; color: #172B4D; line-height: 1.6;\">" +
               "  <div style=\"max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #DFE1E6; overflow: hidden; box-shadow: 0 4px 12px rgba(9,30,66,0.15);\">" +
               "    <div style=\"background-color: #0747A6; padding: 24px; text-align: center; color: #FFFFFF;\">" +
               "      <h1 style=\"margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;\">ProjectFlow</h1>" +
               "      <p style=\"margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.7);\">Real-Time Workspace alert</p>" +
               "    </div>" +
               "    <div style=\"padding: 32px 24px;\">" +
               "      <p style=\"font-size: 15px; font-weight: 600; margin-top: 0; color: #172B4D;\">Hello " + recipientName + ",</p>" +
               "      <p style=\"font-size: 14px; color: #6B778C; margin-bottom: 20px;\">" + title + "</p>" +
               "      <div style=\"background-color: #F4F5F7; border-left: 4px solid #0052CC; padding: 16px; border-radius: 4px; margin-bottom: 24px;\">" +
               "        <p style=\"margin: 0; font-size: 14px; color: #172B4D; font-weight: 500;\">" + description + "</p>" +
               "      </div>" +
               "      <div style=\"text-align: center; margin: 32px 0;\">" +
               "        <a href=\"" + actionUrl + "\" style=\"background-color: #0052CC; color: #FFFFFF; text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 14px; border-radius: 4px; display: inline-block; box-shadow: 0 2px 4px rgba(0,82,204,0.24);\">" + actionButtonText + "</a>" +
               "      </div>" +
               "      <hr style=\"border: none; border-top: 1px solid #DFE1E6; margin: 24px 0;\" />" +
               "      <p style=\"font-size: 11px; color: #97A0AF; margin-bottom: 0;\">" +
               "        If you're having trouble clicking the button, copy and paste this URL into your browser:<br/>" +
               "        <a href=\"" + actionUrl + "\" style=\"color: #0052CC; text-decoration: none;\">" + actionUrl + "</a>" +
               "      </p>" +
               "    </div>" +
               "    <div style=\"background-color: #EBECF0; padding: 16px; text-align: center; font-size: 11px; color: #6B778C;\">" +
               "      This is an automated workspace notification. <br/>" +
               "      Need help? Reach out to support@projectflow.com" +
               "    </div>" +
               "  </div>" +
               "</div>";
    }
}
