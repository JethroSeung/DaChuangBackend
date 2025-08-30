package com.uav.dockingmanagement.dto;

import com.uav.dockingmanagement.model.UAV;

/**
 * Data Transfer Object for UAV status update responses
 */
public class UAVStatusResponse {
    private boolean success;
    private String message;
    private String oldStatus;
    private String newStatus;
    private UAVSummary uav;

    // Constructors
    public UAVStatusResponse() {
    }

    public UAVStatusResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public UAVStatusResponse(boolean success, String message, String oldStatus, String newStatus, UAV uav) {
        this.success = success;
        this.message = message;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.uav = new UAVSummary(uav);
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getOldStatus() {
        return oldStatus;
    }

    public void setOldStatus(String oldStatus) {
        this.oldStatus = oldStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public UAVSummary getUav() {
        return uav;
    }

    public void setUav(UAVSummary uav) {
        this.uav = uav;
    }

    /**
     * Simplified UAV representation for API responses
     */
    public static class UAVSummary {
        private int id;
        private String rfidTag;
        private String ownerName;
        private String model;
        private String status;
        private boolean inHibernatePod;
        private int regionCount;

        public UAVSummary() {
        }

        public UAVSummary(UAV uav) {
            this.id = uav.getId();
            this.rfidTag = uav.getRfidTag();
            this.ownerName = uav.getOwnerName();
            this.model = uav.getModel();
            this.status = uav.getStatus().toString();
            this.inHibernatePod = uav.isInHibernatePod();
            this.regionCount = uav.getRegions() != null ? uav.getRegions().size() : 0;
        }

        // Getters and Setters
        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getRfidTag() {
            return rfidTag;
        }

        public void setRfidTag(String rfidTag) {
            this.rfidTag = rfidTag;
        }

        public String getOwnerName() {
            return ownerName;
        }

        public void setOwnerName(String ownerName) {
            this.ownerName = ownerName;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public boolean isInHibernatePod() {
            return inHibernatePod;
        }

        public void setInHibernatePod(boolean inHibernatePod) {
            this.inHibernatePod = inHibernatePod;
        }

        public int getRegionCount() {
            return regionCount;
        }

        public void setRegionCount(int regionCount) {
            this.regionCount = regionCount;
        }
    }
}
