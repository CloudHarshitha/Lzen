package com.Lzen.Lzen;

import com.Lzen.Lzen.dto.DashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SummaryService summaryService;
    private final SubjectRepository subjectRepository;
    private final MarkEntryRepository markEntryRepository;
    private final ScheduleEntryRepository scheduleEntryRepository;

    @GetMapping("/summary")
    public ResponseEntity<DashboardResponse> getDashboardSummary(@AuthenticationPrincipal User user) {
        
        String smartSummary = summaryService.generateSmartSummary(user.getId());
        
        var subjects = subjectRepository.findByUserId(user.getId()).stream()
                .map(s -> DashboardResponse.SubjectDto.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .build())
                .collect(Collectors.toList());

        var marks = markEntryRepository.findBySubjectUserId(user.getId()).stream()
                .map(m -> DashboardResponse.MarkEntryDto.builder()
                        .id(m.getId())
                        .subjectName(m.getSubject().getName())
                        .title(m.getTitle())
                        .obtainedScore(m.getObtainedScore())
                        .maxScore(m.getMaxScore())
                        .build())
                .collect(Collectors.toList());

        var schedules = scheduleEntryRepository.findBySubjectUserId(user.getId()).stream()
                .map(s -> DashboardResponse.ScheduleEntryDto.builder()
                        .id(s.getId())
                        .subjectName(s.getSubject().getName())
                        .title(s.getTitle())
                        .type(s.getType().name())
                        .targetDate(s.getTargetDate().toString())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(DashboardResponse.builder()
                .smartSummary(smartSummary)
                .subjects(subjects)
                .recentMarks(marks)
                .upcomingSchedule(schedules)
                .build());
    }
}
