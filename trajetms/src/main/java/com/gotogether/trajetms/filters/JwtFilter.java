package com.gotogether.trajetms.filters;

import com.gotogether.trajetms.security.JwtUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtFilter implements Filter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        // Autoriser les GET publics sur /trajets et /trajets/{id}
        if (method.equalsIgnoreCase("GET") && requestURI.matches("^/trajets(/\\d+)?$")) {
            chain.doFilter(request, response);
            return;
        }

        // Vérification du header Authorization
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Long userId = jwtUtil.extractUserId(token);
                httpRequest.setAttribute("userId", userId);
            } catch (Exception e) {
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.getWriter().write("Token invalide ou expiré");
                return;
            }
        } else {
            // Si pas de token valide et endpoint protégé
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("Accès non autorisé : token manquant");
            return;
        }

        chain.doFilter(request, response);
    }
}
