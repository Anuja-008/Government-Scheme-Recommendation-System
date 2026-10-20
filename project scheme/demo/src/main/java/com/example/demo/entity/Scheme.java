package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "schemes")
public class Scheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String occupation;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "max_age")
    private Integer maxAge;

    @Column(name = "max_income")
    private Long maxIncome;

    private String gender;

    private String caste;

    private String level;

    private String state;

    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(columnDefinition = "TEXT")
    private String documents;

    @Column(name = "application_process", columnDefinition = "TEXT")
    private String applicationProcess;

    public Scheme() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public Integer getMinAge() {
        return minAge;
    }

    public void setMinAge(Integer minAge) {
        this.minAge = minAge;
    }

    public Integer getMaxAge() {
        return maxAge;
    }

    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }

    public Long getMaxIncome() {
        return maxIncome;
    }

    public void setMaxIncome(Long maxIncome) {
        this.maxIncome = maxIncome;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getCaste() {
        return caste;
    }

    public void setCaste(String caste) {
        this.caste = caste;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public String getDocuments() {
        return documents;
    }

    public void setDocuments(String documents) {
        this.documents = documents;
    }

    public String getApplicationProcess() {
        return applicationProcess;
    }

    public void setApplicationProcess(String applicationProcess) {
        this.applicationProcess = applicationProcess;
    }
}