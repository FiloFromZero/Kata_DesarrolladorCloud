package com.coedesarrollo.backKata.repository;

import com.coedesarrollo.backKata.model.RequestHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RequestHistoryRepository extends JpaRepository<RequestHistory, UUID> {
    List<RequestHistory> findByRequest_IdOrderByTimestampDesc(UUID requestId);
    Page<RequestHistory> findByRequest_Id(UUID requestId, Pageable pageable);
}
