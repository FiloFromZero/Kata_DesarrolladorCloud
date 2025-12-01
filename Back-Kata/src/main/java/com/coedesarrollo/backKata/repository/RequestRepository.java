package com.coedesarrollo.backKata.repository;

import com.coedesarrollo.backKata.model.RequestEntity;
import com.coedesarrollo.backKata.model.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RequestRepository extends JpaRepository<RequestEntity, UUID> {
    Page<RequestEntity> findByApproverNameOrderByUpdatedAtDesc(String approverName, Pageable pageable);
    Page<RequestEntity> findByRequesterNameOrderByUpdatedAtDesc(String requesterName, Pageable pageable);
    long countByApproverNameAndStatus(String approverName, RequestStatus status);
    long countByApproverNameAndStatusNot(String approverName, RequestStatus status);
}
