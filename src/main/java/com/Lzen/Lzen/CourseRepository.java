package com.Lzen.Lzen;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByUserId(Long userId);
    Optional<Course> findByIdAndUserId(Long id, Long userId);
}
