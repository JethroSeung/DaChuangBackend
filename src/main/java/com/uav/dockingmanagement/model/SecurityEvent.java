package com.uav.dockingmanagement.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Security Event entity to track security incidents and threats
 * Monitors and logs security-related events for threat detection
 */
@Entity
@Table(name = "security_events", indexes = {
    @Index(name = "idx_security_timestamp", columnList = "timestamp"),
    @Index(name = "idx_security_type", columnList = "event_type"),
    @Index(name = "idx_security_severity", columnList = "severity"),
    @Index(name = "idx_security_source", columnList = "source_ip")
})
public class SecurityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private SecurityEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private Severity severity;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "source_ip", length = 45)
    private String sourceIp;

    @Column(name = "target_ip", length = 45)
    private String targetIp;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "request_url", length = 500)
    private String requestUrl;

    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(name = "response_code")
    private Integer responseCode;

    @Column(name = "attack_type", length = 100)
    private String attackType;

    @Column(name = "attack_signature", length = 500)
    private String attackSignature;

    @Column(name = "blocked", nullable = false)
    private Boolean blocked = false;

    @Column(name = "false_positive", nullable = false)
    private Boolean falsePositive = false;

    @Column(name = "investigated", nullable = false)
    private Boolean investigated = false;

    @Column(name = "resolved", nullable = false)
    private Boolean resolved = false;

    @Column(name = "threat_level", length = 20)
    private String threatLevel;

    @Column(name = "country_code", length = 2)
    private String countryCode;

    @Column(name = "geolocation", length = 200)
    private String geolocation;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "correlation_id", length = 100)
    private String correlationId;

    @Column(name = "rule_id", length = 100)
    private String ruleId;

    @Column(name = "rule_name", length = 200)
    private String ruleName;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    @Column(name = "additional_data", columnDefinition = "TEXT")
    private String additionalData;

    @Column(name = "mitigation_action", length = 200)
    private String mitigationAction;

    @Column(name = "analyst_notes", columnDefinition = "TEXT")
    private String analystNotes;

    @CreationTimestamp
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by", length = 100)
    private String resolvedBy;

    public enum SecurityEventType {
        BRUTE_FORCE_ATTACK,
        SQL_INJECTION_ATTEMPT,
        XSS_ATTEMPT,
        CSRF_ATTEMPT,
        UNAUTHORIZED_ACCESS,
        PRIVILEGE_ESCALATION,
        DATA_EXFILTRATION,
        MALWARE_DETECTED,
        SUSPICIOUS_LOGIN,
        ACCOUNT_LOCKOUT,
        FAILED_AUTHENTICATION,
        SESSION_HIJACKING,
        API_ABUSE,
        RATE_LIMIT_EXCEEDED,
        SUSPICIOUS_USER_AGENT,
        GEO_ANOMALY,
        TIME_ANOMALY,
        MULTIPLE_FAILED_LOGINS,
        ADMIN_ACCESS_ATTEMPT,
        CONFIGURATION_CHANGE,
        FILE_UPLOAD_THREAT,
        DIRECTORY_TRAVERSAL,
        COMMAND_INJECTION,
        DDOS_ATTEMPT,
        PORT_SCAN,
        VULNERABILITY_SCAN,
        INTRUSION_ATTEMPT,
        DATA_BREACH_ATTEMPT,
        INSIDER_THREAT,
        COMPLIANCE_VIOLATION
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL,
        EMERGENCY
    }

    // Constructors
    public SecurityEvent() {}

    public SecurityEvent(SecurityEventType eventType, Severity severity, String title) {
        this.eventType = eventType;
        this.severity = severity;
        this.title = title;
        this.blocked = false;
        this.falsePositive = false;
        this.investigated = false;
        this.resolved = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SecurityEventType getEventType() {
        return eventType;
    }

    public void setEventType(SecurityEventType eventType) {
        this.eventType = eventType;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSourceIp() {
        return sourceIp;
    }

    public void setSourceIp(String sourceIp) {
        this.sourceIp = sourceIp;
    }

    public String getTargetIp() {
        return targetIp;
    }

    public void setTargetIp(String targetIp) {
        this.targetIp = targetIp;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getRequestUrl() {
        return requestUrl;
    }

    public void setRequestUrl(String requestUrl) {
        this.requestUrl = requestUrl;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    public Integer getResponseCode() {
        return responseCode;
    }

    public void setResponseCode(Integer responseCode) {
        this.responseCode = responseCode;
    }

    public String getAttackType() {
        return attackType;
    }

    public void setAttackType(String attackType) {
        this.attackType = attackType;
    }

    public String getAttackSignature() {
        return attackSignature;
    }

    public void setAttackSignature(String attackSignature) {
        this.attackSignature = attackSignature;
    }

    public Boolean getBlocked() {
        return blocked;
    }

    public void setBlocked(Boolean blocked) {
        this.blocked = blocked;
    }

    public Boolean getFalsePositive() {
        return falsePositive;
    }

    public void setFalsePositive(Boolean falsePositive) {
        this.falsePositive = falsePositive;
    }

    public Boolean getInvestigated() {
        return investigated;
    }

    public void setInvestigated(Boolean investigated) {
        this.investigated = investigated;
    }

    public Boolean getResolved() {
        return resolved;
    }

    public void setResolved(Boolean resolved) {
        this.resolved = resolved;
    }

    public String getThreatLevel() {
        return threatLevel;
    }

    public void setThreatLevel(String threatLevel) {
        this.threatLevel = threatLevel;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getGeolocation() {
        return geolocation;
    }

    public void setGeolocation(String geolocation) {
        this.geolocation = geolocation;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public String getRuleId() {
        return ruleId;
    }

    public void setRuleId(String ruleId) {
        this.ruleId = ruleId;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public String getAdditionalData() {
        return additionalData;
    }

    public void setAdditionalData(String additionalData) {
        this.additionalData = additionalData;
    }

    public String getMitigationAction() {
        return mitigationAction;
    }

    public void setMitigationAction(String mitigationAction) {
        this.mitigationAction = mitigationAction;
    }

    public String getAnalystNotes() {
        return analystNotes;
    }

    public void setAnalystNotes(String analystNotes) {
        this.analystNotes = analystNotes;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    // Utility methods
    public boolean isHighSeverity() {
        return severity == Severity.HIGH || 
               severity == Severity.CRITICAL || 
               severity == Severity.EMERGENCY;
    }

    public boolean requiresImmediateAttention() {
        return severity == Severity.CRITICAL || 
               severity == Severity.EMERGENCY ||
               eventType == SecurityEventType.DATA_BREACH_ATTEMPT ||
               eventType == SecurityEventType.INTRUSION_ATTEMPT;
    }

    public boolean isActive() {
        return !resolved && !falsePositive;
    }

    public void markAsResolved(String resolvedBy) {
        this.resolved = true;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = resolvedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SecurityEvent that = (SecurityEvent) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "SecurityEvent{" +
                "id=" + id +
                ", eventType=" + eventType +
                ", severity=" + severity +
                ", title='" + title + '\'' +
                ", sourceIp='" + sourceIp + '\'' +
                ", blocked=" + blocked +
                ", resolved=" + resolved +
                ", timestamp=" + timestamp +
                '}';
    }
}
