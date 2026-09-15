package com.Lzen.Lzen.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private String smartSummary;
    private List<SubjectDto> subjects;
    private List<MarkEntryDto> recentMarks;
    private List<ScheduleEntryDto> upcomingSchedule;
    
    @Data
    @Builder
    public static class SubjectDto {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    public static class MarkEntryDto {
        private Long id;
        private String subjectName;
        private String title;
        private Double obtainedScore;
        private Double maxScore;
    }

    @Data
    @Builder
    public static class ScheduleEntryDto {
        private Long id;
        private String subjectName;
        private String title;
        private String type;
        private String targetDate;
    }
}
