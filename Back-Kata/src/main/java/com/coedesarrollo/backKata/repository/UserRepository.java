package com.coedesarrollo.backKata.repository;

import com.coedesarrollo.backKata.model.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    
    Optional<UserEntity> findByUsername(String username);
    boolean existsByUsername(String username);
    Page<UserEntity> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
    
    
    @Query("SELECT u.username FROM UserEntity u ORDER BY u.username")
    Page<String> findAllUsernames(Pageable pageable);
    
    @Query("SELECT u.username FROM UserEntity u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY u.username")
    Page<String> findUsernamesByQuery(String query, Pageable pageable);
}
