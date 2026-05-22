package com.projectflow.service;

import com.projectflow.dto.CommentRequest;
import com.projectflow.entity.Comment;
import com.projectflow.entity.Task;
import com.projectflow.entity.User;
import com.projectflow.repository.CommentRepository;
import com.projectflow.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Comment> getCommentsForTask(Long taskId) {
        return commentRepository.findAllByTaskIdOrderByCreatedAtAsc(taskId);
    }

    @Transactional
    public Comment addComment(Long taskId, CommentRequest request, User author) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .author(author)
                .build();

        Comment saved = commentRepository.save(comment);

        if (task.getAssignee() != null && !task.getAssignee().getId().equals(author.getId())) {
            notificationService.createAndSendNotification(
                    task.getAssignee(),
                    author.getFullName() + " added a comment to: " + task.getTitle(),
                    "COMMENT_ADDED"
            );
        }

        if (!task.getCreator().getId().equals(author.getId()) && (task.getAssignee() == null || !task.getAssignee().getId().equals(task.getCreator().getId()))) {
            notificationService.createAndSendNotification(
                    task.getCreator(),
                    author.getFullName() + " added a comment to task you created: " + task.getTitle(),
                    "COMMENT_ADDED"
            );
        }

        return saved;
    }
}
