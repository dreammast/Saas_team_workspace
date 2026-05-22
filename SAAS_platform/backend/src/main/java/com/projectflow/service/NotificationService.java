package com.projectflow.service;

import com.projectflow.entity.Notification;
import com.projectflow.entity.User;
import com.projectflow.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private EmailService emailService;

    @Value("${projectflow.frontend.url}")
    private String frontendUrl;

    @Transactional
    public Notification createAndSendNotification(User recipient, String content, String type) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .content(content)
                .type(type)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Dispatch live WebSocket notification
        try {
            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/notifications",
                    saved
            );
        } catch (Exception e) {
            // Fail silently if WebSocket is not active
        }

        // Dispatch real-time SMTP Email notification asynchronously
        try {
            String subject = "🔔 ProjectFlow Update";
            String buttonText = "View Workspace";
            
            if ("TASK_ASSIGNED".equals(type)) {
                subject = "📋 Task Assigned to You";
                buttonText = "View Assigned Task";
            } else if ("COMMENT_ADDED".equals(type)) {
                subject = "💬 New Comment Added";
                buttonText = "View Comment";
            } else if ("TASK_UPDATED".equals(type)) {
                subject = "🔄 Task Status Updated";
                buttonText = "Check Progress";
            }

            String htmlBody = emailService.buildNotificationHtml(
                    recipient.getFullName(),
                    subject,
                    content,
                    buttonText,
                    frontendUrl
            );

            emailService.sendEmail(recipient.getEmail(), subject, htmlBody, type);
        } catch (Exception e) {
            // Fail silently so SMTP issues do not abort main workflow transactions
        }

        return saved;
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findAllByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findAllByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findAllByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
