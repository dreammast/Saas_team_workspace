package com.projectflow.service;

import com.projectflow.dto.TaskRequest;
import com.projectflow.entity.Project;
import com.projectflow.entity.Task;
import com.projectflow.entity.User;
import com.projectflow.repository.ProjectRepository;
import com.projectflow.repository.TaskRepository;
import com.projectflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Task> getTasksForProject(Long projectId) {
        return taskRepository.findAllByProjectId(projectId);
    }

    public List<Task> getTasksForUser(User user) {
        if (user.getRole() == com.projectflow.entity.Role.ROLE_MANAGER || user.getRole() == com.projectflow.entity.Role.ROLE_ADMIN) {
            List<Project> projects = projectRepository.findAllByOwnerOrMember(user);
            if (projects.isEmpty()) {
                return java.util.Collections.emptyList();
            }
            List<Long> projectIds = projects.stream()
                    .map(Project::getId)
                    .collect(java.util.stream.Collectors.toList());
            return taskRepository.findAllByProjectIdIn(projectIds);
        }
        return taskRepository.findAllByAssignee(user);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + id));
    }

    @Transactional
    public Task createTask(Long projectId, TaskRequest request, User creator) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId()).orElse(null);
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "TODO")
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .storyPoints(request.getStoryPoints())
                .estimatedHours(request.getEstimatedHours())
                .actualHours(request.getActualHours())
                .dueDate(request.getDueDate())
                .project(project)
                .assignee(assignee)
                .creator(creator)
                .build();

        Task savedTask = taskRepository.save(task);

        if (assignee != null) {
            notificationService.createAndSendNotification(
                    assignee,
                    "You have been assigned to task: " + task.getTitle(),
                    "TASK_ASSIGNED"
            );
        }

        return savedTask;
    }

    @Transactional
    public Task updateTask(Long id, TaskRequest request) {
        Task task = getTaskById(id);
        
        User oldAssignee = task.getAssignee();
        User newAssignee = null;
        if (request.getAssigneeId() != null) {
            newAssignee = userRepository.findById(request.getAssigneeId()).orElse(null);
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        task.setStoryPoints(request.getStoryPoints());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setActualHours(request.getActualHours());
        task.setDueDate(request.getDueDate());
        task.setAssignee(newAssignee);

        Task savedTask = taskRepository.save(task);

        if (newAssignee != null && (oldAssignee == null || !oldAssignee.getId().equals(newAssignee.getId()))) {
            notificationService.createAndSendNotification(
                    newAssignee,
                    "You have been assigned to task: " + task.getTitle(),
                    "TASK_ASSIGNED"
            );
        } else if (newAssignee != null) {
            notificationService.createAndSendNotification(
                    newAssignee,
                    "Task updated: " + task.getTitle(),
                    "TASK_UPDATED"
            );
        }

        return savedTask;
    }

    @Transactional
    public Task updateTaskStatus(Long id, String status) {
        Task task = getTaskById(id);
        task.setStatus(status);
        Task savedTask = taskRepository.save(task);

        if (task.getAssignee() != null) {
            notificationService.createAndSendNotification(
                    task.getAssignee(),
                    "Task status changed to " + status + ": " + task.getTitle(),
                    "TASK_UPDATED"
            );
        }

        return savedTask;
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }
}
