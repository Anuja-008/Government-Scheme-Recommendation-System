package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Scheme;

@Repository
public interface SchemeRepository extends JpaRepository<Scheme, Long> {

    List<Scheme> findByLevelIgnoreCase(String level);

    List<Scheme> findByLevelIgnoreCaseAndStateIgnoreCase(
            String level,
            String state
    );

    List<Scheme> findByNameContainingIgnoreCase(String name);
}