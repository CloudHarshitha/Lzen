package com.Lzen.Lzen;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long> {
    List<ScheduleEntry> findBySubjectId(Long subjectId);
    List<ScheduleEntry> findBySubjectUserId(Long userId);
}
