package com.example.uavdockingmanagementsystem.repository;

import com.example.uavdockingmanagementsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository  extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    User findByAccount(String account);
}
