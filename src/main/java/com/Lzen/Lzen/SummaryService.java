package com.Lzen.Lzen;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final SubjectRepository subjectRepository;
    private final MarkEntryRepository markEntryRepository;
    private final ScheduleEntryRepository scheduleEntryRepository;

    public String generateSmartSummary(Long userId) {
        // 1. Fetch all data
        List<Subject> subjects = subjectRepository.findByUserId(userId);
        List<MarkEntry> marks = markEntryRepository.findBySubjectUserId(userId);
        List<ScheduleEntry> schedules = scheduleEntryRepository.findBySubjectUserId(userId);

        // 2. Construct the prompt (what we would send to the LLM)
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Generate a concise, 2-3 sentence academic summary for this student.\n");
        promptBuilder.append("Subjects: ");
        subjects.forEach(s -> promptBuilder.append(s.getName()).append(", "));
        promptBuilder.append("\nRecent Marks: ");
        marks.forEach(m -> promptBuilder.append(m.getSubject().getName()).append(" - ")
                .append(m.getTitle()).append(": ").append(m.getObtainedScore())
                .append("/").append(m.getMaxScore()).append(", "));
        promptBuilder.append("\nUpcoming Schedule: ");
        schedules.forEach(s -> promptBuilder.append(s.getSubject().getName()).append(" - ")
                .append(s.getType()).append(": ").append(s.getTitle()).append(" on ")
                .append(s.getTargetDate()).append(", "));

        String prompt = promptBuilder.toString();
        
        // Log the prompt to show how we structure the context for the LLM
        System.out.println("--- LLM PROMPT ---");
        System.out.println(prompt);
        System.out.println("------------------");

        // 3. Call the AI SDK (Mocked for now until API key is configured)
        // In a real scenario: return aiClient.generate(prompt);
        
        if (subjects.isEmpty()) {
            return "Welcome to Lzen. Add your subjects and upcoming schedule to receive personalized academic insights.";
        }

        return "You're strongest in Physics (avg 88%), weakest in Chemistry (62%) — review Ch. 4 before Friday's test. " +
               "Tomorrow's lecture in Math covers Integration — no prep logged yet. " +
               "2 assignments due this week: Biology (Thu), History (Fri).";
    }
}
