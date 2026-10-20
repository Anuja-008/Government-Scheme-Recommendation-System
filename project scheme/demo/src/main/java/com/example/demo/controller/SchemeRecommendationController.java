package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.UserProfile;
import com.example.demo.entity.Scheme;
import com.example.demo.service.SchemeRecommendationService;

@RestController
@CrossOrigin(origins = "*")
public class SchemeRecommendationController {

    private final SchemeRecommendationService recommendationService;

    public SchemeRecommendationController(
            SchemeRecommendationService recommendationService
    ) {
        this.recommendationService = recommendationService;
    }

    @GetMapping({"/api/recommendations/schemes", "/api/schemes", "/api/all"})
    public ResponseEntity<List<Scheme>> getAllSchemes() {
        return ResponseEntity.ok(
                recommendationService.getAllSchemes()
        );
    }

    @GetMapping({"/api/recommendations/national", "/api/national"})
    public ResponseEntity<List<Scheme>> getNationalSchemes() {
        return ResponseEntity.ok(
                recommendationService.getNationalSchemes()
        );
    }

    @GetMapping({"/api/recommendations/states", "/api/states"})
    public ResponseEntity<List<String>> getStates() {
        return ResponseEntity.ok(
                recommendationService.getStates()
        );
    }

    @GetMapping({"/api/recommendations/state/{state}", "/api/state/{state}"})
    public ResponseEntity<List<Scheme>> getStateSchemes(
            @PathVariable String state
    ) {
        return ResponseEntity.ok(
                recommendationService.getStateSchemes(state)
        );
    }

    @GetMapping({"/api/recommendations/details/{id}", "/api/details/{id}", "/api/schemes/{id}"})
    public ResponseEntity<Scheme> getSchemeDetails(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                recommendationService.getSchemeById(id)
        );
    }

    @GetMapping({"/api/recommendations/search", "/api/search"})
    public ResponseEntity<List<Scheme>> searchSchemes(
            @RequestParam("q") String query
    ) {
        return ResponseEntity.ok(
                recommendationService.searchSchemes(query)
        );
    }

    @PostMapping({"/api/recommendations", "/api/recommend"})
    public ResponseEntity<List<Scheme>> recommendSchemes(
            @RequestBody UserProfile user
    ) {
        return ResponseEntity.ok(
                recommendationService.recommendSchemes(user)
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidInput(
            IllegalArgumentException exception
    ) {
        return ResponseEntity.badRequest().body(
                Map.of("error", exception.getMessage())
        );
    }
}