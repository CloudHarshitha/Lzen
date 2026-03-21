package com.Lzen.Lzen;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String registerUser(String name, String email,
                               String password, String role,
                               String parentEmail) {
        if (userRepository.existsByEmail(email)) {
            return "Email already exists!";
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(User.Role.valueOf(role));
        user.setParentEmail(parentEmail);
        userRepository.save(user);
        return "success";
    }
}