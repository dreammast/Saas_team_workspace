package com.projectflow.repository;

import com.projectflow.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop20ByOrderByCreatedAtDesc();
    List<ActivityLog> findAllByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
}
