package com.projectflow.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class TaskRequest {
    @NotBlank
    private String title;

    private String description;

    private String status;

    private String priority;

    private Integer storyPoints;

    private Double estimatedHours;

    private Double actualHours;

    private LocalDateTime dueDate;

    private Long assigneeId;

    public TaskRequest() {}

    public TaskRequest(String title, String description, String status, String priority, Integer storyPoints, Double estimatedHours, Double actualHours, LocalDateTime dueDate, Long assigneeId) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.storyPoints = storyPoints;
        this.estimatedHours = estimatedHours;
        this.actualHours = actualHours;
        this.dueDate = dueDate;
        this.assigneeId = assigneeId;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public Double getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Double estimatedHours) { this.estimatedHours = estimatedHours; }

    public Double getActualHours() { return actualHours; }
    public void setActualHours(Double actualHours) { this.actualHours = actualHours; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
}
