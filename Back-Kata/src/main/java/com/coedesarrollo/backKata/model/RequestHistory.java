package com.coedesarrollo.backKata.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "request_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "request_id")
    private RequestEntity request;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private String comments;
    private String actor;
    private LocalDateTime timestamp;
}
