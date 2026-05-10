package com.ferromax.erp.repository;

import com.ferromax.erp.model.MovimientoStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Long> {

    List<MovimientoStock> findByRecepcionRemitoIdOrderByFechaAsc(Long recepcionRemitoId);
}
