package com.projectflow.controller;

import com.projectflow.entity.ChatMessage;
import com.projectflow.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/messages/{channelId}")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable String channelId) {
        return ResponseEntity.ok(chatMessageRepository.findAllByChannelIdOrderByCreatedAtAsc(channelId));
    }

    @MessageMapping("/chat/{channelId}")
    public void handleMessage(@DestinationVariable String channelId, ChatMessage message) {
        message.setChannelId(channelId);
        ChatMessage saved = chatMessageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/messages/" + channelId, saved);
    }
}
