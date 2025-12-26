package com.gotogether.utilisateurms.service;

import com.gotogether.utilisateurms.model.User;
import com.gotogether.utilisateurms.repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class UserService {

    @Autowired
    private IUserRepository repo;

    private String hashPassword(String email, String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String combined = email + password;
            byte[] hash = md.digest(combined.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public User createUser(User user) {
        user.setPassword(hashPassword(user.getEmail(), user.getPassword()));
        return repo.save(user);
    }

    public User authenticate(String email, String password) {
        User user = repo.findByEmail(email).orElse(null);
        if (user != null && user.getPassword().equals(hashPassword(email, password))) {
            return user;
        }
        return null;
    }

    public User getByEmail(String email) {
        return repo.findByEmail(email).orElse(null);
    }

    public User getById(Long id) {
        return repo.findById(id).orElse(null);
    }

}
