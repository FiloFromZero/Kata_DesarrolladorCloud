package com.coedesarrollo.backKata.controller;

import com.coedesarrollo.backKata.dto.UserSummary;
import com.coedesarrollo.backKata.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository repository;

    @GetMapping
    public ResponseEntity<List<UserSummary>> all() {
        var list = repository.findAll().stream()
                .map(u -> new UserSummary(u.getUsername()))
                .toList();
        return ResponseEntity.ok(list);
    }
}
