package com.ferromax.erp.controller;

import com.ferromax.erp.dto.VentaRequest;
import com.ferromax.erp.dto.VentaResponse;
import com.ferromax.erp.security.JwtTokenProvider;
import com.ferromax.erp.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/ventas")
@RequiredArgsConstructor
public class VentaController {

    private static final ZoneId ZONA_AR = ZoneId.of("America/Argentina/Buenos_Aires");

    private final VentaService ventaService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public ResponseEntity<VentaResponse> registrar(
            @Valid @RequestBody VentaRequest request,
            @RequestHeader("Authorization") String authHeader) {

        Long cajeroId = jwtTokenProvider.obtenerUsuarioIdDesdeToken(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ventaService.registrarVenta(request, cajeroId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VentaResponse>> listar(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        OffsetDateTime desdeOdt = (desde != null ? desde : LocalDate.now(ZONA_AR).minusDays(30))
                .atStartOfDay(ZONA_AR).toOffsetDateTime();
        OffsetDateTime hastaOdt = (hasta != null ? hasta.plusDays(1) : LocalDate.now(ZONA_AR).plusDays(1))
                .atStartOfDay(ZONA_AR).toOffsetDateTime();

        return ResponseEntity.ok(ventaService.listarPorRango(desdeOdt, hastaOdt));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public ResponseEntity<VentaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.buscarPorId(id));
    }

    @PutMapping("/{id}/anular")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VentaResponse> anular(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.anular(id));
    }
}
