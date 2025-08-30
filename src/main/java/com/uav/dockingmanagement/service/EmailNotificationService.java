package com.uav.dockingmanagement.service;

import com.uav.dockingmanagement.model.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Email notification service for sending various types of email notifications
 * Supports both plain text and HTML email templates
 */
@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@uavmanagement.com}")
    private String fromEmail;

    @Value("${app.name:UAV Management System}")
    private String appName;

    @Value("${app.url:http://localhost:8080}")
    private String appUrl;

    /**
     * Send a simple text email
     */
    public boolean sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            logger.info("Simple email sent successfully to: {}", to);
            return true;

        } catch (Exception e) {
            logger.error("Failed to send simple email to {}: {}", to, e.getMessage());
            return false;
        }
    }

    /**
     * Send HTML email using template
     */
    public boolean sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);

            // Add common variables
            variables.put("appName", appName);
            variables.put("appUrl", appUrl);
            variables.put("currentYear", LocalDateTime.now().getYear());
            variables.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

            Context context = new Context();
            context.setVariables(variables);

            String htmlContent = templateEngine.process("email/" + templateName, context);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            logger.info("HTML email sent successfully to: {} using template: {}", to, templateName);
            return true;

        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            return false;
        }
    }

    /**
     * Send notification email
     */
    public boolean sendNotificationEmail(Notification notification) {
        if (notification.getRecipientEmail() == null || notification.getRecipientEmail().isEmpty()) {
            logger.warn("No email address provided for notification: {}", notification.getId());
            return false;
        }

        try {
            Map<String, Object> variables = Map.of(
                    "title", notification.getTitle(),
                    "message", notification.getMessage(),
                    "notificationType", notification.getNotificationType().toString(),
                    "priority", notification.getPriority().toString(),
                    "recipientUsername",
                    notification.getRecipientUsername() != null ? notification.getRecipientUsername() : "User",
                    "actionUrl", notification.getActionUrl() != null ? notification.getActionUrl() : appUrl,
                    "actionText", notification.getActionText() != null ? notification.getActionText() : "View Details");

            String subject = String.format("[%s] %s", appName, notification.getTitle());
            return sendHtmlEmail(notification.getRecipientEmail(), subject, "notification", variables);

        } catch (Exception e) {
            logger.error("Failed to send notification email for notification {}: {}", notification.getId(),
                    e.getMessage());
            return false;
        }
    }

    /**
     * Send UAV alert email
     */
    public boolean sendUAVAlertEmail(String to, String uavRfid, String alertType, String description, String severity) {
        try {
            Map<String, Object> variables = Map.of(
                    "uavRfid", uavRfid,
                    "alertType", alertType,
                    "description", description,
                    "severity", severity,
                    "dashboardUrl", appUrl + "/dashboard");

            String subject = String.format("[%s] UAV Alert - %s (%s)", appName, alertType, uavRfid);
            return sendHtmlEmail(to, subject, "uav-alert", variables);

        } catch (Exception e) {
            logger.error("Failed to send UAV alert email: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send battery alert email
     */
    public boolean sendBatteryAlertEmail(String to, String uavRfid, int batteryLevel, String batteryCondition) {
        try {
            Map<String, Object> variables = Map.of(
                    "uavRfid", uavRfid,
                    "batteryLevel", batteryLevel,
                    "batteryCondition", batteryCondition,
                    "isLowBattery", batteryLevel < 20,
                    "isCriticalBattery", batteryLevel < 10,
                    "dashboardUrl", appUrl + "/dashboard");

            String subject = String.format("[%s] Battery Alert - %s (%d%%)", appName, uavRfid, batteryLevel);
            return sendHtmlEmail(to, subject, "battery-alert", variables);

        } catch (Exception e) {
            logger.error("Failed to send battery alert email: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send maintenance reminder email
     */
    public boolean sendMaintenanceReminderEmail(String to, String uavRfid, String maintenanceType,
            LocalDateTime scheduledDate) {
        try {
            Map<String, Object> variables = Map.of(
                    "uavRfid", uavRfid,
                    "maintenanceType", maintenanceType,
                    "scheduledDate", scheduledDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                    "isOverdue", scheduledDate.isBefore(LocalDateTime.now()),
                    "maintenanceUrl", appUrl + "/maintenance");

            String subject = String.format("[%s] Maintenance Reminder - %s", appName, uavRfid);
            return sendHtmlEmail(to, subject, "maintenance-reminder", variables);

        } catch (Exception e) {
            logger.error("Failed to send maintenance reminder email: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send flight completion report email
     */
    public boolean sendFlightCompletionEmail(String to, String uavRfid, String missionName,
            int flightDuration, double distanceTraveled, String pilotName) {
        try {
            Map<String, Object> variables = Map.of(
                    "uavRfid", uavRfid,
                    "missionName", missionName,
                    "flightDuration", flightDuration,
                    "distanceTraveled", String.format("%.2f", distanceTraveled),
                    "pilotName", pilotName != null ? pilotName : "Unknown",
                    "flightLogsUrl", appUrl + "/flight-logs");

            String subject = String.format("[%s] Flight Completed - %s", appName, missionName);
            return sendHtmlEmail(to, subject, "flight-completion", variables);

        } catch (Exception e) {
            logger.error("Failed to send flight completion email: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send emergency alert email
     */
    public boolean sendEmergencyAlertEmail(String to, String uavRfid, String emergencyType,
            String description, Double latitude, Double longitude) {
        try {
            Map<String, Object> variables = Map.of(
                    "uavRfid", uavRfid,
                    "emergencyType", emergencyType,
                    "description", description,
                    "hasLocation", latitude != null && longitude != null,
                    "latitude", latitude != null ? latitude.toString() : "",
                    "longitude", longitude != null ? longitude.toString() : "",
                    "emergencyUrl", appUrl + "/emergency");

            String subject = String.format("[%s] EMERGENCY ALERT - %s", appName, uavRfid);
            return sendHtmlEmail(to, subject, "emergency-alert", variables);

        } catch (Exception e) {
            logger.error("Failed to send emergency alert email: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send system status report email
     */
    public boolean sendSystemStatusReportEmail(String to, Map<String, Object> systemStats) {
        try {
            Map<String, Object> variables = Map.of(
                    "systemStats", systemStats,
                    "reportDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                    "dashboardUrl", appUrl + "/dashboard");

            String subject = String.format("[%s] Daily System Status Report", appName);
            return sendHtmlEmail(to, subject, "system-status-report", variables);

        } catch (Exception e) {
            logger.error("Failed to send system status report email: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send welcome email to new users
     */
    public boolean sendWelcomeEmail(String to, String username, String temporaryPassword) {
        try {
            Map<String, Object> variables = Map.of(
                    "username", username,
                    "temporaryPassword", temporaryPassword != null ? temporaryPassword : "Please contact administrator",
                    "loginUrl", appUrl + "/login",
                    "supportEmail", fromEmail);

            String subject = String.format("Welcome to %s", appName);
            return sendHtmlEmail(to, subject, "welcome", variables);

        } catch (Exception e) {
            logger.error("Failed to send welcome email: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send password reset email
     */
    public boolean sendPasswordResetEmail(String to, String username, String resetToken) {
        try {
            Map<String, Object> variables = Map.of(
                    "username", username,
                    "resetToken", resetToken,
                    "resetUrl", appUrl + "/reset-password?token=" + resetToken,
                    "expiryHours", 24);

            String subject = String.format("[%s] Password Reset Request", appName);
            return sendHtmlEmail(to, subject, "password-reset", variables);

        } catch (Exception e) {
            logger.error("Failed to send password reset email: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send bulk notification to multiple recipients
     */
    public void sendBulkNotification(String[] recipients, String subject, String templateName,
            Map<String, Object> variables) {
        for (String recipient : recipients) {
            try {
                sendHtmlEmail(recipient, subject, templateName, variables);
                // Add small delay to avoid overwhelming the mail server
                Thread.sleep(100);
            } catch (Exception e) {
                logger.error("Failed to send bulk notification to {}: {}", recipient, e.getMessage());
            }
        }
    }

    /**
     * Test email configuration
     */
    public boolean testEmailConfiguration() {
        try {
            String testSubject = "Test Email - " + appName;
            String testMessage = "This is a test email to verify email configuration. Sent at: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            return sendSimpleEmail(fromEmail, testSubject, testMessage);

        } catch (Exception e) {
            logger.error("Email configuration test failed: {}", e.getMessage());
            return false;
        }
    }
}
