package com.Lzen.Lzen;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarkEntryRepository extends JpaRepository<MarkEntry, Long> {
    List<MarkEntry> findBySubjectId(Long subjectId);
    List<MarkEntry> findBySubjectUserId(Long userId);
}
