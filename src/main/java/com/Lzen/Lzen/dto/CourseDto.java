package com.Lzen.Lzen.dto;

import com.Lzen.Lzen.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseDto {
    private Long id;
    private String name;
    private String code;
    private Integer internals;
    private Integer externals;
    private String syllabus;
    private Integer totalUnits;
    private String courseType;
    private Integer rawExamMax;

    public static CourseDto fromEntity(Course course) {
        return CourseDto.builder()
                .id(course.getId())
                .name(course.getName())
                .code(course.getCode())
                .internals(course.getInternals())
                .externals(course.getExternals())
                .syllabus(course.getSyllabus())
                .totalUnits(course.getTotalUnits())
                .courseType(course.getCourseType())
                .rawExamMax(course.getRawExamMax())
                .build();
    }
}
