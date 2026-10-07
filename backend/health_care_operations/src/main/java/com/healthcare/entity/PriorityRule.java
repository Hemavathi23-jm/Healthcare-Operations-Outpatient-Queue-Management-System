package com.healthcare.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "priority_rules")
public class PriorityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_name", nullable = false, unique = true, length = 50)
    private String categoryName;

    @Column(name = "priority_weight", nullable = false)
    private Integer priorityWeight = 10;

    @Column(columnDefinition = "TEXT")
    private String description;

    public PriorityRule() {}

    public PriorityRule(Long id, String categoryName, Integer priorityWeight, String description) {
        this.id = id;
        this.categoryName = categoryName;
        this.priorityWeight = priorityWeight != null ? priorityWeight : 10;
        this.description = description;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String categoryName;
        private Integer priorityWeight = 10;
        private String description;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder categoryName(String categoryName) { this.categoryName = categoryName; return this; }
        public Builder priorityWeight(Integer priorityWeight) { this.priorityWeight = priorityWeight; return this; }
        public Builder description(String description) { this.description = description; return this; }

        public PriorityRule build() {
            return new PriorityRule(id, categoryName, priorityWeight, description);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Integer getPriorityWeight() { return priorityWeight; }
    public void setPriorityWeight(Integer priorityWeight) { this.priorityWeight = priorityWeight; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
