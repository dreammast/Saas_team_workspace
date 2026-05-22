package com.projectflow.repository;

import com.projectflow.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    List<Notification> findAllByRecipientIdAndReadOrderByCreatedAtDesc(Long recipientId, boolean read);
}
