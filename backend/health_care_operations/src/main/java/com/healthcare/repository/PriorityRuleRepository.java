package com.healthcare.repository;

import com.healthcare.entity.PriorityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PriorityRuleRepository extends JpaRepository<PriorityRule, Long> {
    Optional<PriorityRule> findByCategoryName(String categoryName);
}
