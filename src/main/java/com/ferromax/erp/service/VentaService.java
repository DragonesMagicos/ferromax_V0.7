package com.ferromax.erp.service;

import com.ferromax.erp.dto.ItemVentaRequest;
import com.ferromax.erp.dto.VentaRequest;
import com.ferromax.erp.dto.VentaResponse;
import com.ferromax.erp.exception.RecursoNoEncontradoException;
import com.ferromax.erp.model.Comprobante;
import com.ferromax.erp.model.EstadoVentaEnum;
import com.ferromax.erp.model.ItemVenta;
import com.ferromax.erp.model.MedioPagoEnum;
import com.ferromax.erp.model.Producto;
import com.ferromax.erp.model.TipoComprobanteEnum;
import com.ferromax.erp.model.Venta;
import com.ferromax.erp.repository.ClienteRepository;
import com.ferromax.erp.repository.ComprobanteRepository;
import com.ferromax.erp.repository.ProductoRepository;
import com.ferromax.erp.repository.UsuarioRepository;
import com.ferromax.erp.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final ComprobanteRepository comprobanteRepository;
    private final ProductoService productoService;

    @Transactional
    public VentaResponse registrarVenta(VentaRequest request, Long cajeroId) {

        // PASO 1 — Verificar stock de todos los productos antes de tocar nada
        List<Producto> productos = new ArrayList<>();
        for (ItemVentaRequest item : request.items()) {
            Producto producto = productoRepository.findById(item.productoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto", item.productoId()));

            if (producto.getStockActual() < item.cantidad()) {
                throw new IllegalArgumentException("Stock insuficiente para: " + producto.getNombre());
            }

            productos.add(producto);
        }

        // PASO 2 — Crear la venta
        Venta venta = new Venta();
        venta.setEstado(EstadoVentaEnum.COMPLETADA);
        venta.setMedioPago(MedioPagoEnum.valueOf(request.medioPago()));
        venta.setCajero(usuarioRepository.findById(cajeroId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", cajeroId)));

        if (request.clienteId() != null) {
            venta.setCliente(clienteRepository.findById(request.clienteId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", request.clienteId())));
        }

        // PASO 3 — Crear los items y calcular el total
        BigDecimal total = BigDecimal.ZERO;
        List<ItemVentaRequest> items = request.items();

        for (int i = 0; i < items.size(); i++) {
            ItemVentaRequest itemRequest = items.get(i);
            Producto producto = productos.get(i);

            BigDecimal subtotal = producto.getPrecio()
                    .multiply(BigDecimal.valueOf(itemRequest.cantidad()));

            ItemVenta itemVenta = new ItemVenta();
            itemVenta.setProducto(producto);
            itemVenta.setCantidad(itemRequest.cantidad());
            itemVenta.setPrecioUnitario(producto.getPrecio());
            itemVenta.setSubtotal(subtotal);
            itemVenta.setVenta(venta);

            venta.getItems().add(itemVenta);
            total = total.add(subtotal);
        }

        venta.setSubtotal(total);
        venta.setDescuento(BigDecimal.ZERO);
        venta.setTotal(total);

        // PASO 4 — Descontar el stock (genera alertas automáticamente si corresponde)
        for (int i = 0; i < items.size(); i++) {
            Producto producto = productos.get(i);
            int nuevoStock = producto.getStockActual() - items.get(i).cantidad();
            productoService.actualizarStock(producto.getId(), nuevoStock);
        }

        // PASO 5 — Guardar la venta y crear el comprobante
        Venta ventaGuardada = ventaRepository.save(venta);

        Comprobante comprobante = new Comprobante();
        comprobante.setTipo(TipoComprobanteEnum.TICKET);
        comprobante.setVenta(ventaGuardada);
        comprobanteRepository.save(comprobante);

        return toResponse(ventaGuardada);
    }

    private VentaResponse toResponse(Venta venta) {
        String nombreCajero = venta.getCajero().getNombre()
                + " " + venta.getCajero().getApellido();
        return new VentaResponse(
                venta.getId(),
                venta.getFecha(),
                venta.getTotal(),
                venta.getEstado().name(),
                venta.getMedioPago().name(),
                nombreCajero.strip(),
                venta.getItems().size()
        );
    }
}
