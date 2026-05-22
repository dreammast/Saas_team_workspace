package com.projectflow.repository;

import com.projectflow.entity.Task;
import com.projectflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByProjectId(Long projectId);
    List<Task> findAllByAssignee(User assignee);
    List<Task> findAllByAssigneeId(Long assigneeId);
    List<Task> findAllByProjectIdIn(List<Long> projectIds);
}
