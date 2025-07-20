package com.example.uavdockingmanagementsystem.repository;

import com.example.uavdockingmanagementsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface UserRepository  extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    boolean existsByAccount(String account);

    Optional<User> findByAccount(String account);
}
