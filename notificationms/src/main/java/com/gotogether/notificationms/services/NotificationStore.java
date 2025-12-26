package com.gotogether.notificationms.services;

import com.gotogether.notificationms.model.Notification;
import com.gotogether.notificationms.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationStore {

    @Autowired(required = false)
    private NotificationRepository repo;

    // Fallback in-memory store when JPA repo not available
    private final java.util.Map<Long, java.util.List<Notification>> mem = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.concurrent.atomic.AtomicLong seq = new java.util.concurrent.atomic.AtomicLong(1);

    public Notification add(Long userId, String message, String link) {
        if (repo != null) {
            Notification n = new Notification(userId, message, link);
            return repo.save(n);
        }
        Long id = seq.getAndIncrement();
        Notification n = new Notification(userId, message, link);
        try {
            // set id reflectively for fallback (entity has private id)
            java.lang.reflect.Field f = Notification.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(n, id);
        } catch (Exception e) {
            // ignore
        }
        mem.compute(userId, (k, v) -> {
            if (v == null) v = new java.util.ArrayList<>();
            v.add(0, n);
            return v;
        });
        return n;
    }

    public java.util.List<Notification> getForUser(Long userId) {
        if (repo != null) return repo.findByUserIdOrderByCreatedAtDesc(userId);
        return java.util.Collections.unmodifiableList(mem.getOrDefault(userId, java.util.List.of()));
    }

    public void markRead(Long notificationId) {
        if (repo != null) {
            repo.findById(notificationId).ifPresent(n -> {
                n.setRead(true);
                repo.save(n);
            });
        } else {
            mem.values().forEach(list -> {
                list.stream()
                        .filter(n -> n.getId().equals(notificationId))
                        .forEach(n -> n.setRead(true));
            });
        }
    }
    // NotificationStore.java

    public void markAllAsReadForUser(Long userId) {
        if (repo != null) {
            // On récupère toutes les notifs non lues de l'utilisateur
            List<Notification> unread = repo.findByUserIdOrderByCreatedAtDesc(userId);
            unread.forEach(n -> {
                if (!n.isRead()) {
                    n.setRead(true);
                }
            });
            repo.saveAll(unread); // Sauvegarde groupée en base de données
        } else {
            // Fallback mémoire si pas de DB
            List<Notification> list = mem.get(userId);
            if (list != null) {
                list.forEach(n -> n.setRead(true));
            }
        }
    }
    public void delete(Long id) {
        repo.deleteById(id);
    }
    public void deleteMultiple(List<Long> ids) {
        // Supprime toutes les notifications dont l'ID est dans la liste
        repo.deleteAllById(ids);
    }
}
