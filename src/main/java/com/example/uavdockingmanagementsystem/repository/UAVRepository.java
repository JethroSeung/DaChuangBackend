package com.example.uavdockingmanagementsystem.repository;
import com.example.uavdockingmanagementsystem.model.UAV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UAVRepository extends JpaRepository<UAV, Integer> {
    @Query("SELECT DISTINCT u FROM UAV u LEFT JOIN FETCH u.regions")
    List<UAV> findAllWithRegions();

    @Query("SELECT DISTINCT u FROM UAV u JOIN u.regions r WHERE r.id = :regionId")
    List<UAV> findByRegionId(@Param("regionId") int regionId);

    Optional<UAV> findByRfidTag(String rfidTag);

    /**
     * Find UAVs by hibernate pod status
     */
    List<UAV> findByInHibernatePod(boolean inHibernatePod);

    /**
     * Find UAVs by status
     */
    List<UAV> findByStatus(UAV.Status status);

    /**
     * Count UAVs in hibernate pod
     */
    long countByInHibernatePod(boolean inHibernatePod);
}


