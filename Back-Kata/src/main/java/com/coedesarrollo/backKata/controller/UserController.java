package com.coedesarrollo.backKata.controller;

import com.coedesarrollo.backKata.dto.UserSummary;
import com.coedesarrollo.backKata.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Tag(name = "Users", description = "Búsqueda y listado de usuarios")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository repository;

    @Operation(summary = "Listar todos los usuarios (solo username)")
    @GetMapping
    public ResponseEntity<List<UserSummary>> all() {
        var list = repository.findAll().stream()
                .map(u -> new UserSummary(u.getUsername()))
                .toList();
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "Buscar usuarios por texto (paginado)")
    @GetMapping("/search")
    public ResponseEntity<Page<UserSummary>> search(
            @RequestParam(name = "q", defaultValue = "") String q,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        PageRequest pr = PageRequest.of(Math.max(0, page), Math.max(1, size));
        
        Page<UserSummary> res = (q == null || q.isBlank())
                ? repository.findAllUsernames(pr).map(UserSummary::new)
                : repository.findUsernamesByQuery(q.trim(), pr).map(UserSummary::new);
        return ResponseEntity.ok(res);
    }
}
