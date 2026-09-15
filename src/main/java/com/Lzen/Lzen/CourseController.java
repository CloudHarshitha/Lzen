package com.Lzen.Lzen;

import com.Lzen.Lzen.dto.CourseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<List<CourseDto>> getCourses(@AuthenticationPrincipal User user) {
        List<CourseDto> courses = courseRepository.findByUserId(user.getId()).stream()
                .map(CourseDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(courses);
    }

    @PostMapping
    public ResponseEntity<CourseDto> createCourse(
            @AuthenticationPrincipal User user,
            @RequestBody CourseDto dto
    ) {
        Course course = new Course();
        course.setUser(user);
        course.setName(dto.getName());
        course.setCode(dto.getCode());
        course.setInternals(dto.getInternals());
        course.setExternals(dto.getExternals());
        course.setSyllabus(dto.getSyllabus() != null ? dto.getSyllabus() : "");
        course.setTotalUnits(dto.getTotalUnits() != null ? dto.getTotalUnits() : 1);
        course.setCourseType(dto.getCourseType() != null ? dto.getCourseType() : "theory_joint");
        course.setRawExamMax(dto.getRawExamMax() != null ? dto.getRawExamMax() : 75);

        Course saved = courseRepository.save(course);
        return ResponseEntity.ok(CourseDto.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDto> updateCourse(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody CourseDto dto
    ) {
        Course course = courseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found or access denied"));

        if (dto.getName() != null) course.setName(dto.getName());
        if (dto.getCode() != null) course.setCode(dto.getCode());
        if (dto.getInternals() != null) course.setInternals(dto.getInternals());
        if (dto.getExternals() != null) course.setExternals(dto.getExternals());
        if (dto.getSyllabus() != null) course.setSyllabus(dto.getSyllabus());
        if (dto.getTotalUnits() != null) course.setTotalUnits(dto.getTotalUnits());
        if (dto.getCourseType() != null) course.setCourseType(dto.getCourseType());
        if (dto.getRawExamMax() != null) course.setRawExamMax(dto.getRawExamMax());

        Course saved = courseRepository.save(course);
        return ResponseEntity.ok(CourseDto.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        Course course = courseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found or access denied"));

        courseRepository.delete(course);
        return ResponseEntity.noContent().build();
    }
}
