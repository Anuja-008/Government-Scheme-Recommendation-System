package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.TreeSet;

import org.springframework.stereotype.Service;

import com.example.demo.dto.UserProfile;
import com.example.demo.entity.Scheme;
import com.example.demo.repository.SchemeRepository;

@Service
public class SchemeRecommendationService {

    private final SchemeRepository schemeRepository;

    public SchemeRecommendationService(
            SchemeRepository schemeRepository
    ) {
        this.schemeRepository = schemeRepository;
    }

    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    public List<Scheme> getNationalSchemes() {
        return schemeRepository.findByLevelIgnoreCase("National");
    }

    public List<String> getStates() {

        TreeSet<String> states =
                new TreeSet<>(String.CASE_INSENSITIVE_ORDER);

        List<Scheme> schemes = schemeRepository.findAll();

        for (Scheme scheme : schemes) {

            if ("State".equalsIgnoreCase(scheme.getLevel())
                    && scheme.getState() != null
                    && !scheme.getState().isBlank()) {

                states.add(scheme.getState().trim());
            }
        }

        return new ArrayList<>(states);
    }

    public List<Scheme> getStateSchemes(String state) {

        if (state == null || state.isBlank()) {
            throw new IllegalArgumentException(
                    "Please provide a state name."
            );
        }

        return schemeRepository
                .findByLevelIgnoreCaseAndStateIgnoreCase(
                        "State",
                        state.trim()
                );
    }

    public Scheme getSchemeById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Scheme ID is required."
            );
        }

        return schemeRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Scheme not found with ID: " + id
                        )
                );
    }

    public List<Scheme> searchSchemes(String query) {

        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException(
                    "Please enter a scheme name to search."
            );
        }

        return schemeRepository
                .findByNameContainingIgnoreCase(query.trim());
    }

    public List<Scheme> recommendSchemes(UserProfile user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User profile is required."
            );
        }

        if (user.getAge() < 1 || user.getAge() > 119) {
            throw new IllegalArgumentException(
                    "Age must be between 1 and 119."
            );
        }

        if (user.getAnnualIncome() < 0) {
            throw new IllegalArgumentException(
                    "Annual income cannot be negative."
            );
        }

        if (user.getOccupation() == null
                || user.getOccupation().isBlank()) {

            throw new IllegalArgumentException(
                    "Occupation is required."
            );
        }

        List<Scheme> schemes = schemeRepository.findAll();

        return schemes.stream()
                .filter(scheme -> matchesAge(scheme, user))
                .filter(scheme -> matchesIncome(scheme, user))
                .filter(scheme -> matchesOccupation(scheme, user))
                .filter(scheme -> matchesCaste(scheme, user))
                .filter(scheme -> matchesGender(scheme, user))
                .filter(scheme -> matchesState(scheme, user))
                .toList();
    }

    private boolean matchesAge(Scheme scheme, UserProfile user) {

        int minimumAge = scheme.getMinAge() == null
                ? 0
                : scheme.getMinAge();

        int maximumAge = scheme.getMaxAge() == null
                ? 119
                : scheme.getMaxAge();

        return user.getAge() >= minimumAge
                && user.getAge() <= maximumAge;
    }

    private boolean matchesIncome(
            Scheme scheme,
            UserProfile user
    ) {

        return scheme.getMaxIncome() == null
                || user.getAnnualIncome() <= scheme.getMaxIncome();
    }

    private boolean matchesOccupation(
            Scheme scheme,
            UserProfile user
    ) {

        String required = normalize(scheme.getOccupation());

        if (required.isEmpty() || required.equals("any") || required.equals("all")) {
            return true;
        }

        String actual = normalize(user.getOccupation());

        if (actual.isEmpty() || actual.equals("any")) {
            return true;
        }

        String[] allowedOccupations = required.split("[/|,]");

        for (String allowed : allowedOccupations) {
            if (normalize(allowed).equals(actual)) {
                return true;
            }
        }

        return false;
    }

    private boolean matchesCaste(
            Scheme scheme,
            UserProfile user
    ) {

        String required = normalize(scheme.getCaste());

        if (required.isEmpty() || required.equals("any") || required.equals("all")) {
            return true;
        }

        String actual = normalize(user.getCaste());

        if (actual.isEmpty() || actual.equals("any") || actual.equals("all")) {
            return true;
        }

        String[] allowedCastes = required.split("[/|,]");

        for (String allowed : allowedCastes) {
            String normAllowed = normalize(allowed);

            if (normAllowed.equals(actual)) {
                return true;
            }
            if ((normAllowed.equals("oc") || normAllowed.equals("general"))
                    && (actual.equals("oc") || actual.equals("general"))) {
                return true;
            }
            if ((normAllowed.equals("bc") || normAllowed.equals("obc"))
                    && (actual.equals("bc") || actual.equals("obc"))) {
                return true;
            }
            if ((normAllowed.equals("mbc") || normAllowed.equals("dnc"))
                    && (actual.equals("mbc") || actual.equals("dnc"))) {
                return true;
            }
        }

        return false;
    }

    private boolean matchesGender(
            Scheme scheme,
            UserProfile user
    ) {

        String required = normalize(scheme.getGender());

        if (required.isEmpty() || required.equals("any") || required.equals("all")) {
            return true;
        }

        String actual = normalize(user.getGender());

        if (actual.isEmpty() || actual.equals("any") || actual.equals("all")) {
            return true;
        }

        return required.equals(actual);
    }

    private boolean matchesState(
            Scheme scheme,
            UserProfile user
    ) {

        String level = normalize(scheme.getLevel());

        // National schemes are available to users from any state.
        if (level.equals("national") || level.equals("central")) {
            return true;
        }

        // Do not return unknown or differently labelled scheme levels
        // as though they were verified national schemes.
        if (!level.equals("state")) {
            return false;
        }

        String requiredState = normalize(scheme.getState());
        String userState = normalize(user.getState());

        if (requiredState.isEmpty() || requiredState.equals("all") || requiredState.equals("national")) {
            return true;
        }

        // A state scheme must match the user's selected state.
        return !userState.isEmpty() && requiredState.equals(userState);
    }

    private String normalize(String value) {

        if (value == null) {
            return "";
        }

        return value.trim().toLowerCase(Locale.ROOT);
    }
}