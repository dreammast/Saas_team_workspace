package com.projectflow.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.Set;

public class ProjectRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String key;

    private String description;

    private Double budget;

    private String status;

    private LocalDateTime targetDate;

    private Set<Long> memberIds;

    public ProjectRequest() {}

    public ProjectRequest(String name, String key, String description, Double budget, String status, LocalDateTime targetDate, Set<Long> memberIds) {
        this.name = name;
        this.key = key;
        this.description = description;
        this.budget = budget;
        this.status = status;
        this.targetDate = targetDate;
        this.memberIds = memberIds;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDateTime targetDate) { this.targetDate = targetDate; }

    public Set<Long> getMemberIds() { return memberIds; }
    public void setMemberIds(Set<Long> memberIds) { this.memberIds = memberIds; }
}
