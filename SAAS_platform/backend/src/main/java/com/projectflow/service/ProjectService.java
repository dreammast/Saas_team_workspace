package com.projectflow.service;

import com.projectflow.dto.ProjectRequest;
import com.projectflow.entity.Project;
import com.projectflow.entity.User;
import com.projectflow.repository.ProjectRepository;
import com.projectflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Project> getProjectsForUser(User user) {
        return projectRepository.findAllByOwnerOrMember(user);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + id));
    }

    @Transactional
    public Project createProject(ProjectRequest request, User creator) {
        if (projectRepository.existsByKey(request.getKey())) {
            throw new RuntimeException("Project key already exists");
        }

        Set<User> members = new HashSet<>();
        if (request.getMemberIds() != null) {
            members.addAll(userRepository.findAllById(request.getMemberIds()));
        }

        Project project = Project.builder()
                .name(request.getName())
                .key(request.getKey().toUpperCase())
                .description(request.getDescription())
                .budget(request.getBudget())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .targetDate(request.getTargetDate())
                .owner(creator)
                .members(members)
                .build();

        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, ProjectRequest request) {
        Project project = getProjectById(id);
        
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setBudget(request.getBudget());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        project.setTargetDate(request.getTargetDate());

        if (request.getMemberIds() != null) {
            Set<User> members = new HashSet<>(userRepository.findAllById(request.getMemberIds()));
            project.setMembers(members);
        }

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }
}
