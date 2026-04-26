package com.ferromax.erp.service;

import com.ferromax.erp.dto.ProductoCreateRequest;
import com.ferromax.erp.dto.ProductoDTO;
import com.ferromax.erp.exception.RecursoNoEncontradoException;
import com.ferromax.erp.model.AlertaStock;
import com.ferromax.erp.model.MovimientoStock;
import com.ferromax.erp.model.Producto;
import com.ferromax.erp.model.TipoMovimientoEnum;
import com.ferromax.erp.repository.AlertaStockRepository;
import com.ferromax.erp.repository.CategoriaRepository;
import com.ferromax.erp.repository.MovimientoStockRepository;
import com.ferromax.erp.repository.ProductoRepository;
import com.ferromax.erp.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProveedorRepository proveedorRepository;
    private final MovimientoStockRepository movimientoStockRepository;
    private final AlertaStockRepository alertaStockRepository;

    public List<ProductoDTO> listarTodos() {
        return productoRepository.findAllByActivoTrue()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public ProductoDTO buscarPorSku(String sku) {
        Producto producto = productoRepository.findBySku(sku)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", "sku", sku));
        return toDTO(producto);
    }

    public ProductoDTO buscarPorId(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", id));
        return toDTO(producto);
    }

    @Transactional
    public ProductoDTO crear(ProductoCreateRequest request) {
        if (productoRepository.findBySku(request.sku()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un producto con el SKU '" + request.sku() + "'");
        }

        Producto producto = new Producto();
        producto.setSku(request.sku());
        producto.setNombre(request.nombre());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(request.precio());
        producto.setPrecioCompra(request.precioCompra());
        producto.setStockMinimo(request.stockMinimo() != null ? request.stockMinimo() : 0);
        producto.setImagenUrl(request.imagenUrl());

        if (request.categoriaId() != null) {
            producto.setCategoria(categoriaRepository.findById(request.categoriaId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Categoria", request.categoriaId())));
        }

        if (request.proveedorId() != null) {
            producto.setProveedor(proveedorRepository.findById(request.proveedorId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor", request.proveedorId())));
        }

        return toDTO(productoRepository.save(producto));
    }

    @Transactional
    public ProductoDTO actualizarStock(Long productoId, Integer nuevaCantidad) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", productoId));

        int stockAnterior = producto.getStockActual();
        producto.setStockActual(nuevaCantidad);
        productoRepository.save(producto);

        registrarMovimiento(producto, nuevaCantidad - stockAnterior, stockAnterior, nuevaCantidad);
        generarAlertaSiCorresponde(producto, nuevaCantidad);

        return toDTO(producto);
    }

    public List<ProductoDTO> obtenerStockCritico() {
        return productoRepository.findProductosConStockCritico()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    private void registrarMovimiento(Producto producto, int cantidad, int stockAnterior, int stockNuevo) {
        MovimientoStock movimiento = new MovimientoStock();
        movimiento.setProducto(producto);
        movimiento.setTipo(TipoMovimientoEnum.AJUSTE);
        movimiento.setCantidad(cantidad);
        movimiento.setStockAnterior(stockAnterior);
        movimiento.setStockNuevo(stockNuevo);
        movimientoStockRepository.save(movimiento);
    }

    private void generarAlertaSiCorresponde(Producto producto, int stockNuevo) {
        if (stockNuevo == 0) {
            guardarAlerta(producto, "SIN_STOCK");
        } else if (stockNuevo <= producto.getStockMinimo()) {
            guardarAlerta(producto, "STOCK_CRITICO");
        }
    }

    private void guardarAlerta(Producto producto, String tipo) {
        AlertaStock alerta = new AlertaStock();
        alerta.setProducto(producto);
        alerta.setAlertaEnum(tipo);
        alertaStockRepository.save(alerta);
    }

    private ProductoDTO toDTO(Producto p) {
        return new ProductoDTO(
                p.getId(),
                p.getSku(),
                p.getNombre(),
                p.getDescripcion(),
                p.getPrecio(),
                p.getStockActual(),
                p.getStockMinimo(),
                p.getActivo(),
                p.getImagenUrl(),
                p.getCategoria() != null ? p.getCategoria().getNombre() : null,
                p.getProveedor() != null ? p.getProveedor().getNombre() : null
        );
    }
}
