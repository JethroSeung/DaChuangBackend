package com.example.uavdockingmanagementsystem.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
public class UAV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String rfidTag;
    private String ownerName;
    private String model;
    private boolean inHibernatePod;
    private LocalDateTime HibernatePodJoinTime;  //表示加入休眠仓的时间
    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinTable(
            name = "uav_regions",
            joinColumns = @JoinColumn(name = "uav_id"),
            inverseJoinColumns = @JoinColumn(name = "region_id")
    )
    private Set<Region> regions = new HashSet<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters
    public boolean isInHibernatePod() {
        return inHibernatePod;
    }

    public LocalDateTime getHibernatePodJoinTime() {
        return HibernatePodJoinTime;
    }

    public void setInHibernatePod(boolean inHibernatePod) {
        this.inHibernatePod = inHibernatePod;
    }

    public int getId() {
        return id;
    }

    public String getRfidTag() {
        return rfidTag;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getModel() {
        return model;
    }

    public Status getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Setters
    public void setId(int id) {
        this.id = id;
    }

    public void setRfidTag(String rfidTag) {
        this.rfidTag = rfidTag;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Set<Region> getRegions() {
        return regions;
    }

    public void setRegions(Set<Region> regions) {
        this.regions = regions;
    }

    public void setHibernatePodJoinTime(LocalDateTime HibernatePodJoinTime) {
        this.HibernatePodJoinTime = HibernatePodJoinTime;
    }

    public enum Status {
        AUTHORIZED, UNAUTHORIZED
    }
}