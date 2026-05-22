package com.projectflow.controller;

import com.projectflow.entity.Channel;
import com.projectflow.repository.ChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    @Autowired
    private ChannelRepository channelRepository;

    @GetMapping
    public ResponseEntity<List<Channel>> getChannels() {
        return ResponseEntity.ok(channelRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createChannel(@RequestBody Channel channel) {
        if (channel.getId() == null || channel.getId().trim().isEmpty()) {
            channel.setId("ch-" + channel.getName().trim().toLowerCase().replace("\\s+", "-"));
        }
        if (channelRepository.existsById(channel.getId()) || channelRepository.existsByName(channel.getName())) {
            return ResponseEntity.badRequest().body("Channel with that name or ID already exists");
        }
        Channel saved = channelRepository.save(channel);
        return ResponseEntity.ok(saved);
    }
}
