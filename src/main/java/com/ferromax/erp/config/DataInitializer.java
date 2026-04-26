package com.ferromax.erp.config;

import com.ferromax.erp.model.AlertaStock;
import com.ferromax.erp.model.Categoria;
import com.ferromax.erp.model.Producto;
import com.ferromax.erp.model.Proveedor;
import com.ferromax.erp.model.RolEnum;
import com.ferromax.erp.model.Usuario;
import com.ferromax.erp.repository.AlertaStockRepository;
import com.ferromax.erp.repository.CategoriaRepository;
import com.ferromax.erp.repository.ProductoRepository;
import com.ferromax.erp.repository.ProveedorRepository;
import com.ferromax.erp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;
    private final AlertaStockRepository alertaStockRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        // ── Usuarios ─────────────────────────────────────────────────────────
        Usuario admin = new Usuario();
        admin.setNombre("José");
        admin.setApellido("Rodríguez");
        admin.setEmail("jose@ferromax.com");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setRol(RolEnum.ADMIN);
        admin.setActivo(true);
        usuarioRepository.save(admin);

        Usuario empleado = new Usuario();
        empleado.setNombre("Manuel");
        empleado.setApellido("Casas");
        empleado.setEmail("manuel@ferromax.com");
        empleado.setPasswordHash(passwordEncoder.encode("empleado123"));
        empleado.setRol(RolEnum.EMPLEADO);
        empleado.setActivo(true);
        usuarioRepository.save(empleado);

        // ── Categorías ────────────────────────────────────────────────────────
        Categoria catHerramientas = new Categoria();
        catHerramientas.setNombre("Herramientas Manuales");
        categoriaRepository.save(catHerramientas);

        Categoria catPinturas = new Categoria();
        catPinturas.setNombre("Pinturas y Revestimientos");
        categoriaRepository.save(catPinturas);

        // ── Proveedor ─────────────────────────────────────────────────────────
        Proveedor proveedor = new Proveedor();
        proveedor.setNombre("Distribuidora Ferretera SA");
        proveedor.setEmail("ventas@distribuidora.com");
        proveedorRepository.save(proveedor);

        // ── Productos ─────────────────────────────────────────────────────────
        Producto tornillo = new Producto();
        tornillo.setSku("TOR-001");
        tornillo.setNombre("Tornillo autorroscante 1\"");
        tornillo.setPrecio(new BigDecimal("150.00"));
        tornillo.setStockActual(500);
        tornillo.setStockMinimo(100);
        tornillo.setCategoria(catHerramientas);
        tornillo.setProveedor(proveedor);
        productoRepository.save(tornillo);

        Producto pintura = new Producto();
        pintura.setSku("PIN-001");
        pintura.setNombre("Pintura Látex Blanca 20L");
        pintura.setPrecio(new BigDecimal("8500.00"));
        pintura.setStockActual(3);
        pintura.setStockMinimo(10);
        pintura.setCategoria(catPinturas);
        pintura.setProveedor(proveedor);
        productoRepository.save(pintura);

        Producto broca = new Producto();
        broca.setSku("BRO-001");
        broca.setNombre("Broca 8mm HSS");
        broca.setPrecio(new BigDecimal("450.00"));
        broca.setStockActual(4);
        broca.setStockMinimo(12);
        broca.setCategoria(catHerramientas);
        broca.setProveedor(proveedor);
        productoRepository.save(broca);

        // ── Alertas de stock crítico para productos bajo mínimo ───────────────
        alertaStockRepository.save(alertaCritica(pintura));
        alertaStockRepository.save(alertaCritica(broca));

        log.info("✅ Datos iniciales de Ferromax cargados correctamente");
    }

    private AlertaStock alertaCritica(Producto producto) {
        AlertaStock alerta = new AlertaStock();
        alerta.setProducto(producto);
        alerta.setAlertaEnum("STOCK_CRITICO");
        alerta.setLida(false);
        return alerta;
    }
}
