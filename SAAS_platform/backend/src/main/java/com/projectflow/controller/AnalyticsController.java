package com.projectflow.controller;

import com.projectflow.entity.Project;
import com.projectflow.entity.Task;
import com.projectflow.entity.User;
import com.projectflow.repository.ProjectRepository;
import com.projectflow.repository.TaskRepository;
import com.projectflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        Map<String, Object> data = new HashMap<>();

        List<Project> projects = projectRepository.findAll();
        List<Task> tasks = taskRepository.findAll();
        List<User> users = userRepository.findAll();

        data.put("totalProjects", projects.size());
        data.put("totalTasks", tasks.size());
        data.put("totalTeamMembers", users.size());

        Map<String, Long> tasksByStatus = tasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        data.put("tasksByStatus", tasksByStatus);

        List<Map<String, Object>> budgetAllocations = projects.stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", p.getName());
                    map.put("key", p.getKey());
                    map.put("budget", p.getBudget() != null ? p.getBudget() : 0.0);
                    return map;
                })
                .collect(Collectors.toList());
        data.put("budgetAllocations", budgetAllocations);

        List<Map<String, Object>> developerProductivity = users.stream()
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", u.getFullName());
                    map.put("email", u.getEmail());
                    
                    List<Task> uDoneTasks = tasks.stream()
                            .filter(t -> t.getAssignee() != null && t.getAssignee().getId().equals(u.getId()) && "DONE".equalsIgnoreCase(t.getStatus()))
                            .collect(Collectors.toList());
                            
                    int completedPoints = uDoneTasks.stream()
                            .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                            .sum();

                    map.put("completedTasks", uDoneTasks.size());
                    map.put("storyPoints", completedPoints);
                    return map;
                })
                .collect(Collectors.toList());
        data.put("developerProductivity", developerProductivity);

        return ResponseEntity.ok(data);
    }
}
