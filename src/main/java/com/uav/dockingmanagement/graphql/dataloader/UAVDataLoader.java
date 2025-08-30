package com.uav.dockingmanagement.graphql.dataloader;

import com.uav.dockingmanagement.model.FlightLog;
import com.uav.dockingmanagement.model.MaintenanceRecord;
import com.uav.dockingmanagement.model.Region;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.FlightLogRepository;
import com.uav.dockingmanagement.repository.MaintenanceRecordRepository;
import org.dataloader.BatchLoader;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderFactory;
import org.dataloader.DataLoaderOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * DataLoader implementations for UAV-related GraphQL queries
 * Solves N+1 query problems by batching database requests
 */
@Component
public class UAVDataLoader {

        private static final Logger logger = LoggerFactory.getLogger(UAVDataLoader.class);

        @Autowired
        private FlightLogRepository flightLogRepository;

        @Autowired
        private MaintenanceRecordRepository maintenanceRecordRepository;

        /**
         * DataLoader for UAV regions
         * Batches region loading for multiple UAVs
         */
        public DataLoader<UAV, List<Region>> createRegionsDataLoader() {
                BatchLoader<UAV, List<Region>> batchLoader = uavs -> {
                        logger.debug("Batch loading regions for {} UAVs", uavs.size());

                        return CompletableFuture.supplyAsync(() -> {
                                // Group UAVs and extract their regions efficiently
                                Map<UAV, List<Region>> regionMap = uavs.stream()
                                                .collect(Collectors.toMap(
                                                                uav -> uav,
                                                                uav -> uav.getRegions() != null
                                                                                ? uav.getRegions().stream().toList()
                                                                                : List.of()));

                                // Return results in the same order as input
                                return uavs.stream()
                                                .map(regionMap::get)
                                                .collect(Collectors.toList());
                        });
                };

                DataLoaderOptions options = DataLoaderOptions.newOptions()
                                .setBatchingEnabled(true)
                                .setCachingEnabled(true)
                                .setMaxBatchSize(100);

                return DataLoaderFactory.newDataLoader(batchLoader, options);
        }

        /**
         * DataLoader for UAV flight logs
         * Batches flight log loading for multiple UAVs
         */
        public DataLoader<UAV, List<FlightLog>> createFlightLogsDataLoader(Integer limit) {
                BatchLoader<UAV, List<FlightLog>> batchLoader = uavs -> {
                        logger.debug("Batch loading flight logs for {} UAVs with limit {}", uavs.size(), limit);

                        return CompletableFuture.supplyAsync(() -> {
                                // Extract UAV IDs for batch query
                                List<Integer> uavIds = uavs.stream()
                                                .map(UAV::getId)
                                                .collect(Collectors.toList());

                                // Batch load flight logs for all UAVs
                                List<FlightLog> allFlightLogs = flightLogRepository
                                                .findByUavIdInOrderByCreatedAtDesc(uavIds);

                                // Group by UAV and apply limit
                                Map<Integer, List<FlightLog>> flightLogMap = allFlightLogs.stream()
                                                .collect(Collectors.groupingBy(
                                                                log -> log.getUav().getId(),
                                                                Collectors.collectingAndThen(
                                                                                Collectors.toList(),
                                                                                logs -> logs.stream()
                                                                                                .limit(limit != null
                                                                                                                ? limit
                                                                                                                : 10)
                                                                                                .collect(Collectors
                                                                                                                .toList()))));

                                // Return results in the same order as input UAVs
                                return uavs.stream()
                                                .map(uav -> flightLogMap.getOrDefault(uav.getId(), List.of()))
                                                .collect(Collectors.toList());
                        });
                };

                DataLoaderOptions options = DataLoaderOptions.newOptions()
                                .setBatchingEnabled(true)
                                .setCachingEnabled(true)
                                .setMaxBatchSize(50);

                return DataLoaderFactory.newDataLoader(batchLoader, options);
        }

        /**
         * DataLoader for UAV maintenance records
         * Batches maintenance record loading for multiple UAVs
         */
        public DataLoader<UAV, List<MaintenanceRecord>> createMaintenanceRecordsDataLoader(Integer limit) {
                BatchLoader<UAV, List<MaintenanceRecord>> batchLoader = uavs -> {
                        logger.debug("Batch loading maintenance records for {} UAVs with limit {}", uavs.size(), limit);

                        return CompletableFuture.supplyAsync(() -> {
                                // Extract UAV IDs for batch query
                                List<Integer> uavIds = uavs.stream()
                                                .map(UAV::getId)
                                                .collect(Collectors.toList());

                                // Batch load maintenance records for all UAVs
                                List<MaintenanceRecord> allRecords = maintenanceRecordRepository
                                                .findByUavIdInOrderByCreatedAtDesc(uavIds);

                                // Group by UAV and apply limit
                                Map<Integer, List<MaintenanceRecord>> recordMap = allRecords.stream()
                                                .collect(Collectors.groupingBy(
                                                                record -> record.getUav().getId(),
                                                                Collectors.collectingAndThen(
                                                                                Collectors.toList(),
                                                                                records -> records.stream()
                                                                                                .limit(limit != null
                                                                                                                ? limit
                                                                                                                : 10)
                                                                                                .collect(Collectors
                                                                                                                .toList()))));

                                // Return results in the same order as input UAVs
                                return uavs.stream()
                                                .map(uav -> recordMap.getOrDefault(uav.getId(), List.of()))
                                                .collect(Collectors.toList());
                        });
                };

                DataLoaderOptions options = DataLoaderOptions.newOptions()
                                .setBatchingEnabled(true)
                                .setCachingEnabled(true)
                                .setMaxBatchSize(50);

                return DataLoaderFactory.newDataLoader(batchLoader, options);
        }
}
