package com.example.uavdockingmanagementsystem.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Notification entity for managing system notifications
 * Supports various notification types and delivery channels
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_recipient", columnList = "recipient_username"),
    @Index(name = "idx_notification_type", columnList = "notification_type"),
    @Index(name = "idx_notification_status", columnList = "status"),
    @Index(name = "idx_notification_created", columnList = "created_at")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "recipient_username", length = 100)
    private String recipientUsername;

    @Column(name = "recipient_email", length = 255)
    private String recipientEmail;

    @Column(name = "sender_username", length = 100)
    private String senderUsername;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(name = "action_text", length = 100)
    private String actionText;

    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "color", length = 20)
    private String color;

    @Column(name = "auto_dismiss", nullable = false)
    private Boolean autoDismiss = false;

    @Column(name = "dismiss_after_seconds")
    private Integer dismissAfterSeconds;

    @Column(name = "email_sent", nullable = false)
    private Boolean emailSent = false;

    @Column(name = "sms_sent", nullable = false)
    private Boolean smsSent = false;

    @Column(name = "push_sent", nullable = false)
    private Boolean pushSent = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "dismissed_at")
    private LocalDateTime dismissedAt;

    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;

    @Column(name = "sms_sent_at")
    private LocalDateTime smsSentAt;

    @Column(name = "push_sent_at")
    private LocalDateTime pushSentAt;

    @Column(name = "scheduled_for")
    private LocalDateTime scheduledFor;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @Column(name = "max_retries")
    private Integer maxRetries = 3;

    @Column(name = "last_retry_at")
    private LocalDateTime lastRetryAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum NotificationType {
        INFO,
        SUCCESS,
        WARNING,
        ERROR,
        ALERT,
        REMINDER,
        SYSTEM_UPDATE,
        MAINTENANCE_ALERT,
        BATTERY_ALERT,
        FLIGHT_ALERT,
        SECURITY_ALERT,
        EMERGENCY_ALERT,
        USER_ACTION_REQUIRED,
        APPROVAL_REQUEST,
        STATUS_CHANGE,
        WELCOME,
        BIRTHDAY,
        ANNIVERSARY
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT,
        CRITICAL
    }

    public enum NotificationStatus {
        PENDING,
        SENT,
        DELIVERED,
        READ,
        DISMISSED,
        FAILED,
        EXPIRED,
        CANCELLED
    }

    // Constructors
    public Notification() {}

    public Notification(String title, String message, NotificationType type, String recipientUsername) {
        this.title = title;
        this.message = message;
        this.notificationType = type;
        this.recipientUsername = recipientUsername;
        this.priority = Priority.MEDIUM;
        this.status = NotificationStatus.PENDING;
        this.autoDismiss = false;
        this.emailSent = false;
        this.smsSent = false;
        this.pushSent = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public String getRecipientUsername() {
        return recipientUsername;
    }

    public void setRecipientUsername(String recipientUsername) {
        this.recipientUsername = recipientUsername;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public String getActionText() {
        return actionText;
    }

    public void setActionText(String actionText) {
        this.actionText = actionText;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Boolean getAutoDismiss() {
        return autoDismiss;
    }

    public void setAutoDismiss(Boolean autoDismiss) {
        this.autoDismiss = autoDismiss;
    }

    public Integer getDismissAfterSeconds() {
        return dismissAfterSeconds;
    }

    public void setDismissAfterSeconds(Integer dismissAfterSeconds) {
        this.dismissAfterSeconds = dismissAfterSeconds;
    }

    public Boolean getEmailSent() {
        return emailSent;
    }

    public void setEmailSent(Boolean emailSent) {
        this.emailSent = emailSent;
        if (emailSent) {
            this.emailSentAt = LocalDateTime.now();
        }
    }

    public Boolean getSmsSent() {
        return smsSent;
    }

    public void setSmsSent(Boolean smsSent) {
        this.smsSent = smsSent;
        if (smsSent) {
            this.smsSentAt = LocalDateTime.now();
        }
    }

    public Boolean getPushSent() {
        return pushSent;
    }

    public void setPushSent(Boolean pushSent) {
        this.pushSent = pushSent;
        if (pushSent) {
            this.pushSentAt = LocalDateTime.now();
        }
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public LocalDateTime getDismissedAt() {
        return dismissedAt;
    }

    public void setDismissedAt(LocalDateTime dismissedAt) {
        this.dismissedAt = dismissedAt;
    }

    public LocalDateTime getEmailSentAt() {
        return emailSentAt;
    }

    public void setEmailSentAt(LocalDateTime emailSentAt) {
        this.emailSentAt = emailSentAt;
    }

    public LocalDateTime getSmsSentAt() {
        return smsSentAt;
    }

    public void setSmsSentAt(LocalDateTime smsSentAt) {
        this.smsSentAt = smsSentAt;
    }

    public LocalDateTime getPushSentAt() {
        return pushSentAt;
    }

    public void setPushSentAt(LocalDateTime pushSentAt) {
        this.pushSentAt = pushSentAt;
    }

    public LocalDateTime getScheduledFor() {
        return scheduledFor;
    }

    public void setScheduledFor(LocalDateTime scheduledFor) {
        this.scheduledFor = scheduledFor;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Integer getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(Integer maxRetries) {
        this.maxRetries = maxRetries;
    }

    public LocalDateTime getLastRetryAt() {
        return lastRetryAt;
    }

    public void setLastRetryAt(LocalDateTime lastRetryAt) {
        this.lastRetryAt = lastRetryAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
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

    // Utility methods
    public boolean isRead() {
        return readAt != null;
    }

    public boolean isDismissed() {
        return dismissedAt != null;
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean isScheduled() {
        return scheduledFor != null && scheduledFor.isAfter(LocalDateTime.now());
    }

    public boolean canRetry() {
        return retryCount < maxRetries;
    }

    public boolean isHighPriority() {
        return priority == Priority.HIGH || priority == Priority.URGENT || priority == Priority.CRITICAL;
    }

    public void markAsRead() {
        this.readAt = LocalDateTime.now();
        this.status = NotificationStatus.READ;
        this.updatedAt = LocalDateTime.now();
    }

    public void markAsDismissed() {
        this.dismissedAt = LocalDateTime.now();
        this.status = NotificationStatus.DISMISSED;
        this.updatedAt = LocalDateTime.now();
    }

    public void incrementRetryCount() {
        this.retryCount++;
        this.lastRetryAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Notification that = (Notification) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Notification{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", notificationType=" + notificationType +
                ", priority=" + priority +
                ", status=" + status +
                ", recipientUsername='" + recipientUsername + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
