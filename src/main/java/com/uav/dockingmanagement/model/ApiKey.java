package com.uav.dockingmanagement.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Set;

/**
 * API Key entity for managing API access and authentication
 * Provides secure API key management with permissions and rate limiting
 */
@Entity
@Table(name = "api_keys", indexes = {
    @Index(name = "idx_api_key_hash", columnList = "key_hash", unique = true),
    @Index(name = "idx_api_key_name", columnList = "name"),
    @Index(name = "idx_api_key_status", columnList = "status"),
    @Index(name = "idx_api_key_expiry", columnList = "expires_at")
})
public class ApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "key_hash", nullable = false, unique = true, length = 255)
    private String keyHash;

    @Column(name = "key_prefix", nullable = false, length = 20)
    private String keyPrefix;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ApiKeyStatus status = ApiKeyStatus.ACTIVE;

    @Column(name = "owner_username", nullable = false, length = 100)
    private String ownerUsername;

    @Column(name = "owner_email", length = 255)
    private String ownerEmail;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "api_key_permissions", 
                    joinColumns = @JoinColumn(name = "api_key_id"))
    @Column(name = "permission")
    private Set<ApiPermission> permissions;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "api_key_scopes", 
                    joinColumns = @JoinColumn(name = "api_key_id"))
    @Column(name = "scope", length = 100)
    private Set<String> scopes;

    @Column(name = "rate_limit_per_hour")
    private Integer rateLimitPerHour = 1000;

    @Column(name = "rate_limit_per_day")
    private Integer rateLimitPerDay = 10000;

    @Column(name = "current_hour_usage")
    private Integer currentHourUsage = 0;

    @Column(name = "current_day_usage")
    private Integer currentDayUsage = 0;

    @Column(name = "total_usage_count")
    private Long totalUsageCount = 0L;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "last_used_ip", length = 45)
    private String lastUsedIp;

    @Column(name = "allowed_ips", columnDefinition = "TEXT")
    private String allowedIps;

    @Column(name = "allowed_domains", columnDefinition = "TEXT")
    private String allowedDomains;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew = false;

    @Column(name = "renewal_period_days")
    private Integer renewalPeriodDays = 365;

    @Column(name = "environment", length = 50)
    private String environment = "production";

    @Column(name = "webhook_url", length = 500)
    private String webhookUrl;

    @Column(name = "webhook_secret", length = 255)
    private String webhookSecret;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    public enum ApiKeyStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        EXPIRED,
        REVOKED
    }

    public enum ApiPermission {
        READ_UAV,
        WRITE_UAV,
        DELETE_UAV,
        READ_REGIONS,
        WRITE_REGIONS,
        DELETE_REGIONS,
        READ_FLIGHT_LOGS,
        WRITE_FLIGHT_LOGS,
        DELETE_FLIGHT_LOGS,
        READ_MAINTENANCE,
        WRITE_MAINTENANCE,
        DELETE_MAINTENANCE,
        READ_BATTERY_STATUS,
        WRITE_BATTERY_STATUS,
        HIBERNATE_POD_MANAGE,
        ACCESS_CONTROL_VALIDATE,
        SYSTEM_STATISTICS,
        AUDIT_LOGS,
        SECURITY_EVENTS,
        ADMIN_OPERATIONS,
        EXPORT_DATA,
        IMPORT_DATA,
        BACKUP_RESTORE,
        CONFIGURATION_MANAGE
    }

    // Constructors
    public ApiKey() {}

    public ApiKey(String name, String keyHash, String keyPrefix, String ownerUsername) {
        this.name = name;
        this.keyHash = keyHash;
        this.keyPrefix = keyPrefix;
        this.ownerUsername = ownerUsername;
        this.status = ApiKeyStatus.ACTIVE;
        this.autoRenew = false;
        this.totalUsageCount = 0L;
        this.currentHourUsage = 0;
        this.currentDayUsage = 0;
    }

    // Getters and Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getKeyHash() {
        return keyHash;
    }

    public void setKeyHash(String keyHash) {
        this.keyHash = keyHash;
    }

    public String getKeyPrefix() {
        return keyPrefix;
    }

    public void setKeyPrefix(String keyPrefix) {
        this.keyPrefix = keyPrefix;
    }

    public ApiKeyStatus getStatus() {
        return status;
    }

    public void setStatus(ApiKeyStatus status) {
        this.status = status;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public Set<ApiPermission> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<ApiPermission> permissions) {
        this.permissions = permissions;
    }

    public Set<String> getScopes() {
        return scopes;
    }

    public void setScopes(Set<String> scopes) {
        this.scopes = scopes;
    }

    public Integer getRateLimitPerHour() {
        return rateLimitPerHour;
    }

    public void setRateLimitPerHour(Integer rateLimitPerHour) {
        this.rateLimitPerHour = rateLimitPerHour;
    }

    public Integer getRateLimitPerDay() {
        return rateLimitPerDay;
    }

    public void setRateLimitPerDay(Integer rateLimitPerDay) {
        this.rateLimitPerDay = rateLimitPerDay;
    }

    public Integer getCurrentHourUsage() {
        return currentHourUsage;
    }

    public void setCurrentHourUsage(Integer currentHourUsage) {
        this.currentHourUsage = currentHourUsage;
    }

    public Integer getCurrentDayUsage() {
        return currentDayUsage;
    }

    public void setCurrentDayUsage(Integer currentDayUsage) {
        this.currentDayUsage = currentDayUsage;
    }

    public Long getTotalUsageCount() {
        return totalUsageCount;
    }

    public void setTotalUsageCount(Long totalUsageCount) {
        this.totalUsageCount = totalUsageCount;
    }

    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(LocalDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }

    public String getLastUsedIp() {
        return lastUsedIp;
    }

    public void setLastUsedIp(String lastUsedIp) {
        this.lastUsedIp = lastUsedIp;
    }

    public String getAllowedIps() {
        return allowedIps;
    }

    public void setAllowedIps(String allowedIps) {
        this.allowedIps = allowedIps;
    }

    public String getAllowedDomains() {
        return allowedDomains;
    }

    public void setAllowedDomains(String allowedDomains) {
        this.allowedDomains = allowedDomains;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getAutoRenew() {
        return autoRenew;
    }

    public void setAutoRenew(Boolean autoRenew) {
        this.autoRenew = autoRenew;
    }

    public Integer getRenewalPeriodDays() {
        return renewalPeriodDays;
    }

    public void setRenewalPeriodDays(Integer renewalPeriodDays) {
        this.renewalPeriodDays = renewalPeriodDays;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getWebhookUrl() {
        return webhookUrl;
    }

    public void setWebhookUrl(String webhookUrl) {
        this.webhookUrl = webhookUrl;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    // Utility methods
    public boolean isActive() {
        return status == ApiKeyStatus.ACTIVE && !isExpired();
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean hasPermission(ApiPermission permission) {
        return permissions != null && permissions.contains(permission);
    }

    public boolean hasScope(String scope) {
        return scopes != null && scopes.contains(scope);
    }

    public boolean isRateLimitExceeded() {
        return (rateLimitPerHour != null && currentHourUsage >= rateLimitPerHour) ||
               (rateLimitPerDay != null && currentDayUsage >= rateLimitPerDay);
    }

    public void incrementUsage() {
        this.currentHourUsage = (this.currentHourUsage != null ? this.currentHourUsage : 0) + 1;
        this.currentDayUsage = (this.currentDayUsage != null ? this.currentDayUsage : 0) + 1;
        this.totalUsageCount = (this.totalUsageCount != null ? this.totalUsageCount : 0L) + 1;
        this.lastUsedAt = LocalDateTime.now();
    }

    public void resetHourlyUsage() {
        this.currentHourUsage = 0;
    }

    public void resetDailyUsage() {
        this.currentDayUsage = 0;
    }

    public boolean needsRenewal() {
        return autoRenew && expiresAt != null && 
               expiresAt.isBefore(LocalDateTime.now().plusDays(7));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ApiKey apiKey = (ApiKey) o;
        return Objects.equals(id, apiKey.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ApiKey{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", keyPrefix='" + keyPrefix + '\'' +
                ", status=" + status +
                ", ownerUsername='" + ownerUsername + '\'' +
                ", totalUsageCount=" + totalUsageCount +
                ", expiresAt=" + expiresAt +
                '}';
    }
}
