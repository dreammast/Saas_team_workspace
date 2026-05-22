package com.projectflow.repository;

import com.projectflow.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, String> {
    boolean existsByName(String name);
    Optional<Channel> findByName(String name);
}
