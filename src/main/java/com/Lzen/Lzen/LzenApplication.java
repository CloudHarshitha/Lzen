package com.Lzen.Lzen;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class LzenApplication {

    public static void main(String[] args) {
        SpringApplication.run(LzenApplication.class, args);
    }

    @Bean
    public CommandLineRunner dataSeeder(
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            MarkEntryRepository markEntryRepository,
            ScheduleEntryRepository scheduleEntryRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Create a test user if none exists
            if (!userRepository.existsByEmail("test@university.edu")) {
                User user = new User();
                user.setName("Test Student");
                user.setEmail("test@university.edu");
                user.setPassword(passwordEncoder.encode("password123"));
                user.setRole(User.Role.STUDENT);
                userRepository.save(user);

                // Seed Subjects
                Subject physics = new Subject();
                physics.setName("Physics");
                physics.setUser(user);
                subjectRepository.save(physics);

                Subject math = new Subject();
                math.setName("Math");
                math.setUser(user);
                subjectRepository.save(math);

                Subject history = new Subject();
                history.setName("History");
                history.setUser(user);
                subjectRepository.save(history);

                // Seed Marks
                MarkEntry m1 = new MarkEntry();
                m1.setSubject(physics);
                m1.setTitle("Midterm");
                m1.setMaxScore(100.0);
                m1.setObtainedScore(88.0);
                m1.setDate(LocalDate.now().minusDays(10));
                markEntryRepository.save(m1);

                MarkEntry m2 = new MarkEntry();
                m2.setSubject(math);
                m2.setTitle("Quiz 1");
                m2.setMaxScore(20.0);
                m2.setObtainedScore(16.0);
                m2.setDate(LocalDate.now().minusDays(5));
                markEntryRepository.save(m2);

                // Seed Schedules
                ScheduleEntry s1 = new ScheduleEntry();
                s1.setSubject(math);
                s1.setTitle("Integration Basics");
                s1.setType(ScheduleEntry.EntryType.LECTURE);
                s1.setTargetDate(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
                scheduleEntryRepository.save(s1);

                ScheduleEntry s2 = new ScheduleEntry();
                s2.setSubject(history);
                s2.setTitle("Essay Draft");
                s2.setType(ScheduleEntry.EntryType.ASSIGNMENT);
                s2.setTargetDate(LocalDateTime.now().plusDays(2).withHour(23).withMinute(59));
                scheduleEntryRepository.save(s2);
            }
        };
    }
}
