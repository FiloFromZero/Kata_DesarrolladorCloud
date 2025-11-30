package com.coedesarrollo.backKata.repository;

import com.coedesarrollo.backKata.model.RequestHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RequestHistoryRepository extends JpaRepository<RequestHistory, UUID> {
    List<RequestHistory> findByRequest_IdOrderByTimestampDesc(UUID requestId);
}
