package com.example.demo.dto;

public class UserProfile {

    private int age;

    private long annualIncome;

    private String occupation;

    private String caste;

    private String gender;

    private String state;

    public UserProfile() {
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public long getAnnualIncome() {
        return annualIncome;
    }

    public void setAnnualIncome(long annualIncome) {
        this.annualIncome = annualIncome;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getCaste() {
        return caste;
    }

    public void setCaste(String caste) {
        this.caste = caste;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}