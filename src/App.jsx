import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, ChefHat, ShoppingBag, DollarSign, Save, X, Calculator, TrendingUp, Download, Upload, Search, AlertTriangle, BarChart3, PlayCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';

const theme = {
  primary: '#5A7C43', primaryDark: '#3D5A2C', secondary: '#C8E6C9', accent: '#9DC88D',
  background: '#F5F9F3', card: '#FFFFFF', text: '#2D3E1F', textLight: '#5A7C43',
  border: '#D4E9D7', hover: '#E8F5E9', success: '#81C784', warning: '#FFB74D', danger: '#E57373'
};

// ==================== UTILIDADES ====================
const convertirUnidad = (cantidad, unidadOrigen, unidadDestino) => {
  if (unidadOrigen === unidadDestino) return cantidad;
  const conversiones = {
    'kilo-gramo': 1000, 'gramo-kilo': 0.001, 'litro-mililitro': 1000, 'mililitro-litro': 0.001,
    'metro-centimetro': 100, 'centimetro-metro': 0.01
  };
  const key = `${unidadOrigen}-${unidadDestino}`;
  return conversiones[key] ? cantidad * conversiones[key] : cantidad;
};

const unidadesCompatibles = {
  'gramo': ['gramo', 'kilo'], 'kilo': ['gramo', 'kilo'], 'mililitro': ['mililitro', 'litro'],
  'litro': ['mililitro', 'litro'], 'metro': ['metro', 'centimetro'], 'centimetro': ['metro', 'centimetro'],
  'unidad': ['unidad']
};

const todasLasUnidades = ['gramo', 'kilo', 'unidad', 'mililitro', 'litro', 'metro', 'centimetro'];
const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
const formatearMoneda = (valor) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(valor);
const getStockColor = (stock, stockBajo, theme) => stock < (stockBajo || 10) ? theme.danger : stock < (stockBajo || 10) * 2 ? theme.warning : theme.success;
const generarId = () => Date.now() + Math.random().toString(36).substr(2, 9);

// ==================== GENERADOR DE PDF ====================
const generarPDFVentas = (ventas, titulo) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.setTextColor(90, 124, 67);
  doc.text('Esencia Nutri PRO', 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Reporte de Ventas - ${titulo}`, 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 105, 32, { align: 'center' });
  
  // Estadísticas
  const totalVendido = ventas.reduce((sum, v) => sum + v.precioVenta, 0);
  const totalGanancias = ventas.reduce((sum, v) => sum + v.ganancia, 0);
  
  doc.setFontSize(12);
  let y = 45;
  doc.text(`Total Ventas: ${ventas.length}`, 20, y);
  doc.text(`Total Vendido: ${formatearMoneda(totalVendido)}`, 20, y + 8);
  doc.text(`Total Ganancias: ${formatearMoneda(totalGanancias)}`, 20, y + 16);
  
  y += 30;
  
  // Tabla de ventas
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Cliente', 20, y);
  doc.text('Producto', 60, y);
  doc.text('Cant', 120, y);
  doc.text('Precio', 140, y);
  doc.text('Ganancia', 170, y);
  
  y += 7;
  doc.setFont(undefined, 'normal');
  
  ventas.slice(0, 30).forEach(venta => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(venta.cliente.substring(0, 15), 20, y);
    doc.text(venta.recetaNombre.substring(0, 20), 60, y);
    doc.text(String(venta.cantidad), 120, y);
    doc.text(formatearMoneda(venta.precioVenta), 140, y);
    doc.setTextColor(venta.ganancia >= 0 ? 0 : 255, venta.ganancia >= 0 ? 128 : 0, 0);
    doc.text(formatearMoneda(venta.ganancia), 170, y);
    doc.setTextColor(0, 0, 0);
    
    y += 7;
  });
  
  doc.save(`ventas-${new Date().toISOString().split('T')[0]}.pdf`);
};

// ==================== COMPONENTES UI ====================
const Modal = ({ children, onClose, title, large }) => (
  <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
    <div onClick={e => e.stopPropagation()} style={{ backgroundColor: theme.card, borderRadius: '16px', maxWidth: large ? '1000px' : '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: `2px solid ${theme.border}`, position: 'sticky', top: 0, backgroundColor: theme.card, zIndex: 10 }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: theme.text, margin: 0 }}>{title}</h3>
        <button onClick={onClose} style={{ background: theme.hover, border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer' }}><X size={20} color={theme.text} /></button>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  </div>
);

const Alert = ({ children, type = 'info', style }) => {
  const types = { success: { bg: '#E8F5E9', border: theme.success }, error: { bg: '#FFEBEE', border: theme.danger }, warning: { bg: '#FFF9E6', border: theme.warning }, info: { bg: '#E3F2FD', border: '#2196F3' } };
  const { bg, border } = types[type] || types.info;
  return <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: bg, border: `2px solid ${border}`, ...style }}>{children}</div>;
};

const AlertDescription = ({ children }) => <div style={{ color: theme.text }}>{children}</div>;

const Button = ({ children, onClick, variant = 'primary', icon: Icon, disabled = false, fullWidth = false, type = 'button', size = 'md', style }) => {
  const variants = { primary: { background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: 'white', border: 'none' }, secondary: { background: theme.secondary, color: theme.text, border: `2px solid ${theme.border}` }, danger: { background: '#FFEBEE', color: theme.danger, border: `2px solid ${theme.danger}` }, outline: { background: 'white', color: theme.text, border: `2px solid ${theme.border}` } };
  const sizes = { sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' }, md: { padding: '0.875rem 1.5rem', fontSize: '0.95rem' } };
  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...variantStyle, ...sizeStyle, borderRadius: '12px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: disabled ? 0.5 : 1, width: fullWidth ? '100%' : 'auto', ...style }}>{Icon && <Icon size={18} />}{children}</button>;
};

const Card = ({ children, style }) => <div style={{ backgroundColor: theme.card, borderRadius: '16px', padding: '1.5rem', border: `2px solid ${theme.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', ...style }}>{children}</div>;

const Input = ({ label, error, required, ...props }) => (
  <div style={{ width: '100%' }}>
    {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: theme.text }}>{label} {required && <span style={{ color: theme.danger }}>*</span>}</label>}
    <input {...props} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `2px solid ${error ? theme.danger : theme.border}`, fontSize: '0.95rem', ...props.style }} />
  </div>
);

const Select = ({ label, error, required, children, ...props }) => (
  <div style={{ width: '100%' }}>
    {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: theme.text }}>{label} {required && <span style={{ color: theme.danger }}>*</span>}</label>}
    <select {...props} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `2px solid ${error ? theme.danger : theme.border}`, fontSize: '0.95rem', backgroundColor: 'white', cursor: 'pointer', ...props.style }}>{children}</select>
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = { default: { bg: theme.secondary, color: theme.text }, success: { bg: '#E8F5E9', color: theme.success }, warning: { bg: '#FFF9E6', color: theme.warning }, danger: { bg: '#FFEBEE', color: theme.danger } };
  const style = variants[variant] || variants.default;
  return <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '500', backgroundColor: style.bg, color: style.color }}>{children}</span>;
};

// ==================== COMPONENTE: INSUMOS ====================
const InsumosView = ({ insumos, setInsumos, showModal, setShowModal, editingItem, setEditingItem }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cantidadPorEnvase: '',
    unidad: 'gramo',
    proveedor: '',
    stock: '',
    unidadStock: 'gramo',
    precio: '',
    stockBajo: 10,
    fechaActualizacion: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = e => {
    e.preventDefault();
    const newInsumo = {
      ...formData,
      id: editingItem?.id || generarId(),
      cantidadPorEnvase: parseFloat(formData.cantidadPorEnvase),
      stock: parseFloat(formData.stock),
      precio: parseFloat(formData.precio),
      stockBajo: parseFloat(formData.stockBajo) || 10
    };
    setInsumos(editingItem ? insumos.map(i => i.id === editingItem.id ? newInsumo : i) : [...insumos, newInsumo]);
    resetForm();
  };
  
  const resetForm = () => {
    setFormData({
      nombre: '',
      cantidadPorEnvase: '',
      unidad: 'gramo',
      proveedor: '',
      stock: '',
      unidadStock: 'gramo',
      precio: '',
      stockBajo: 10,
      fechaActualizacion: new Date().toISOString().split('T')[0]
    });
    setShowModal(false);
    setEditingItem(null);
  };

  const alertas = insumos.filter(i => i.stock < (i.stockBajo || 10));
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text, margin: '0 0 0.5rem 0' }}>Gestión de Insumos</h2>
          <p style={{ color: theme.textLight, margin: 0 }}>Administra tu inventario de ingredientes</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Nuevo Insumo</Button>
      </div>

      {alertas.length > 0 && <Alert type="error" style={{ marginBottom: '1.5rem' }}><AlertDescription><strong>{alertas.length} insumo(s)</strong> con stock bajo</AlertDescription></Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {insumos.map(insumo => (
          <Card key={insumo.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.text, margin: 0 }}>{insumo.nombre}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button size="sm" variant="secondary" icon={Edit2} onClick={() => { setFormData(insumo); setEditingItem(insumo); setShowModal(true); }} style={{ padding: '0.5rem', minWidth: 'auto' }} />
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => { if (confirm('¿Eliminar?')) setInsumos(insumos.filter(i => i.id !== insumo.id)); }} style={{ padding: '0.5rem', minWidth: 'auto' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: theme.background, borderRadius: '8px' }}><span style={{ color: theme.textLight }}>Cantidad/envase:</span><span style={{ fontWeight: '600', color: theme.text }}>{insumo.cantidadPorEnvase} {insumo.unidad}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: theme.background, borderRadius: '8px' }}><span style={{ color: theme.textLight }}>Precio:</span><span style={{ fontWeight: '600', color: theme.text }}>{formatearMoneda(insumo.precio)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: theme.background, borderRadius: '8px' }}><span style={{ color: theme.textLight }}>Stock:</span><span style={{ fontWeight: '600', color: getStockColor(insumo.stock, insumo.stockBajo, theme) }}>{insumo.stock} {insumo.unidadStock}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#FFF9E6', borderRadius: '8px' }}><span style={{ color: theme.textLight }}>⚠️ Alerta stock bajo:</span><span style={{ fontWeight: '600', color: theme.warning }}>{'<'} {insumo.stockBajo || 10} {insumo.unidadStock}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: theme.secondary, borderRadius: '8px' }}><span style={{ color: theme.textLight }}>Actualizado:</span><span style={{ fontWeight: '600', color: theme.text, fontSize: '0.85rem' }}>{formatearFecha(insumo.fechaActualizacion)}</span></div>
            </div>
          </Card>
        ))}
      </div>

      {insumos.length === 0 && <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}><ShoppingBag size={48} color={theme.textLight} style={{ margin: '0 auto 1rem' }} /><p style={{ fontSize: '1.1rem', color: theme.textLight }}>No hay insumos. ¡Agrega el primero!</p></Card>}
      {showModal && (
        <Modal onClose={resetForm} title={editingItem ? 'Editar Insumo' : 'Nuevo Insumo'}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <Input label="Nombre" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <Input label="Cantidad/Envase" type="number" step="0.01" required value={formData.cantidadPorEnvase} onChange={e => setFormData({ ...formData, cantidadPorEnvase: e.target.value })} />
              <Select label="Unidad" required value={formData.unidad} onChange={e => setFormData({ ...formData, unidad: e.target.value })}>{todasLasUnidades.map(u => <option key={u} value={u}>{u}</option>)}</Select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <Input label="Stock" type="number" step="0.01" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
              <Select label="Unidad" required value={formData.unidadStock} onChange={e => setFormData({ ...formData, unidadStock: e.target.value })}>{todasLasUnidades.map(u => <option key={u} value={u}>{u}</option>)}</Select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Precio" type="number" step="0.01" required value={formData.precio} onChange={e => setFormData({ ...formData, precio: e.target.value })} />
              <Input label="Fecha Actualización" type="date" required value={formData.fechaActualizacion} onChange={e => setFormData({ ...formData, fechaActualizacion: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="⚠️ Umbral Stock Bajo" type="number" step="0.01" min="0" required value={formData.stockBajo} onChange={e => setFormData({ ...formData, stockBajo: e.target.value })} placeholder="Ej: 2 para alertar al llegar a 2kg" />
              <Input label="Proveedor (opcional)" value={formData.proveedor} onChange={e => setFormData({ ...formData, proveedor: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button variant="outline" onClick={resetForm} fullWidth>Cancelar</Button>
              <Button type="submit" icon={Save} fullWidth>{editingItem ? 'Actualizar' : 'Guardar'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ==================== COMPONENTE: PACKAGING ====================
const PackagingView = ({ packaging, setPackaging, showModal, setShowModal, editingItem, setEditingItem }) => {
  const [formData, setFormData] = useState({ nombre: '', precio: '', stock: '', unidadStock: 'unidad', fechaActualizacion: new Date().toISOString().split('T')[0] });

  const handleSubmit = e => {
    e.preventDefault();
    const newPackaging = { ...formData, id: editingItem?.id || generarId(), precio: parseFloat(formData.precio), stock: parseFloat(formData.stock) };
    setPackaging(editingItem ? packaging.map(p => p.id === editingItem.id ? newPackaging : p) : [...packaging, newPackaging]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ nombre: '', precio: '', stock: '', unidadStock: 'unidad', fechaActualizacion: new Date().toISOString().split('T')[0] });
    setShowModal(false);
    setEditingItem(null);
  };
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text, margin: '0 0 0.5rem 0' }}>Gestión de Packaging</h2><p style={{ color: theme.textLight, margin: 0 }}>Materiales de empaque</p></div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Nuevo Packaging</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {packaging.map(item => (
          <Card key={item.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.text, margin: 0 }}>{item.nombre}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button size="sm" variant="secondary" icon={Edit2} onClick={() => { setFormData(item); setEditingItem(item); setShowModal(true); }} style={{ padding: '0.5rem', minWidth: 'auto' }} />
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => { if (confirm('¿Eliminar?')) setPackaging(packaging.filter(p => p.id !== item.id)); }} style={{ padding: '0.5rem', minWidth: 'auto' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: theme.background, borderRadius: '8px' }}><span style={{ color: theme.textLight }}>Precio:</span><span style={{ fontSize: '1.25rem', fontWeight: '700', color: theme.primary }}>{formatearMoneda(item.precio)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: theme.background, borderRadius: '8px' }}><span style={{ color: theme.textLight }}>Stock:</span><span style={{ fontWeight: '600', color: getStockColor(item.stock, null, theme) }}>{item.stock} {item.unidadStock}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: theme.background, borderRadius: '8px' }}><span style={{ color: theme.textLight }}>Actualizado:</span><span style={{ fontWeight: '600', color: theme.text, fontSize: '0.85rem' }}>{formatearFecha(item.fechaActualizacion)}</span></div>
            </div>
          </Card>
        ))}
      </div>

      {packaging.length === 0 && <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}><Package size={48} color={theme.textLight} style={{ margin: '0 auto 1rem' }} /><p style={{ fontSize: '1.1rem', color: theme.textLight }}>No hay packaging. ¡Agrega el primero!</p></Card>}

      {showModal && (
        <Modal onClose={resetForm} title={editingItem ? 'Editar Packaging' : 'Nuevo Packaging'}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <Input label="Nombre" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Bolsa, Caja..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Precio" type="number" step="0.01" required value={formData.precio} onChange={e => setFormData({ ...formData, precio: e.target.value })} />
              <Input label="Fecha Actualización" type="date" required value={formData.fechaActualizacion} onChange={e => setFormData({ ...formData, fechaActualizacion: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <Input label="Stock" type="number" step="0.01" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
              <Select label="Unidad" required value={formData.unidadStock} onChange={e => setFormData({ ...formData, unidadStock: e.target.value })}>{todasLasUnidades.map(u => <option key={u} value={u}>{u}</option>)}</Select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button variant="outline" onClick={resetForm} fullWidth>Cancelar</Button>
              <Button type="submit" icon={Save} fullWidth>{editingItem ? 'Actualizar' : 'Guardar'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ==================== COMPONENTE: RECETAS (CON STOCK Y PRODUCCIÓN) ====================
const RecetasView = ({ recetas, setRecetas, insumos, setInsumos, showModal, setShowModal, editingItem, setEditingItem }) => {
  const [formData, setFormData] = useState({ nombre: '', ingredientes: [], imagen: '', fechaCreacion: new Date().toISOString().split('T')[0], stock: 0, rendimientoUnidades: 1, unidadRendimiento: 'unidad' });
  const [selectedInsumo, setSelectedInsumo] = useState('');
  const [cantidadInsumo, setCantidadInsumo] = useState('');
  const [unidadInsumo, setUnidadInsumo] = useState('gramo');
  const [showProducirModal, setShowProducirModal] = useState(false);
  const [recetaProducir, setRecetaProducir] = useState(null);
  const [cantidadProducir, setCantidadProducir] = useState(1);
  const [tipoProduccion, setTipoProduccion] = useState('completa');

  const calcularCostoReceta = (receta) => {
    let costoTotal = 0;
    receta.ingredientes.forEach(ing => {
      if (ing.tipo === 'insumo') costoTotal += ing.cantidad * ing.precioUnitario;
    });
    return costoTotal;
  };

  const handleAddInsumo = () => {
    if (selectedInsumo && cantidadInsumo) {
      const insumo = insumos.find(i => i.id === selectedInsumo);
      const cantidadConvertida = convertirUnidad(parseFloat(cantidadInsumo), unidadInsumo, insumo.unidad);
      const precioUnitario = insumo.precio / insumo.cantidadPorEnvase;
      setFormData({ ...formData, ingredientes: [...formData.ingredientes, { tipo: 'insumo', id: generarId(), idInsumo: insumo.id, nombre: insumo.nombre, cantidad: cantidadConvertida, cantidadOriginal: parseFloat(cantidadInsumo), unidadOriginal: unidadInsumo, unidad: insumo.unidad, precioUnitario }] });
      setSelectedInsumo('');
      setCantidadInsumo('');
      setUnidadInsumo('gramo');
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ La imagen es muy grande. Máximo 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagen: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const costo = calcularCostoReceta(formData);
    const newReceta = { ...formData, id: editingItem?.id || generarId(), costo, stock: parseFloat(formData.stock) || 0, rendimientoUnidades: parseFloat(formData.rendimientoUnidades) || 1, unidadRendimiento: formData.unidadRendimiento || 'unidad' };
    setRecetas(editingItem ? recetas.map(r => r.id === editingItem.id ? newReceta : r) : [...recetas, newReceta]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ nombre: '', ingredientes: [], imagen: '', fechaCreacion: new Date().toISOString().split('T')[0], stock: 0, rendimientoUnidades: 1, unidadRendimiento: 'unidad' });
    setShowModal(false);
    setEditingItem(null);
  };

  const getUnidadesDisponibles = () => {
    if (!selectedInsumo) return todasLasUnidades;
    const insumo = insumos.find(i => i.id === selectedInsumo);
    return insumo ? unidadesCompatibles[insumo.unidad] || [insumo.unidad] : todasLasUnidades;
  };

  // FUNCIÓN PRODUCIR
  const handleProducir = () => {
    const receta = recetaProducir;
    
    // CALCULAR UNIDADES REALES considerando el tipo de unidad (unidad, docena, etc)
    const unidadesPorRendimiento = receta.unidadRendimiento === 'docena' 
      ? (receta.rendimientoUnidades || 1) * 12 
      : (receta.rendimientoUnidades || 1);
    
    // Calcular cantidad real a producir en unidades
    const cantidadRealUnidades = tipoProduccion === 'completa' 
      ? cantidadProducir * unidadesPorRendimiento
      : cantidadProducir;
    
    // Factor de producción (qué fracción de la receta completa estamos haciendo)
    const factorProduccion = cantidadRealUnidades / unidadesPorRendimiento;
    
    // Verificar si hay suficientes insumos
    let puedoProducir = true;
    let mensajeError = '';
    
    receta.ingredientes.forEach(ing => {
      if (ing.tipo === 'insumo') {
        const insumo = insumos.find(i => i.id === ing.idInsumo);
        if (insumo) {
          const cantidadNecesaria = convertirUnidad(
            ing.cantidad * factorProduccion,
            ing.unidad,
            insumo.unidadStock
          );
          if (insumo.stock < cantidadNecesaria) {
            puedoProducir = false;
            mensajeError += `\n• ${insumo.nombre}: necesitas ${cantidadNecesaria.toFixed(2)} ${insumo.unidadStock}, solo tienes ${insumo.stock} ${insumo.unidadStock}`;
          }
        }
      }
    });
    
    if (!puedoProducir) {
      alert(`⚠️ No hay suficientes insumos para producir:\n${mensajeError}`);
      return;
    }
    
    // Descontar insumos
    const nuevosInsumos = [...insumos];
    receta.ingredientes.forEach(ing => {
      if (ing.tipo === 'insumo') {
        const insumoIndex = nuevosInsumos.findIndex(i => i.id === ing.idInsumo);
        if (insumoIndex !== -1) {
          const cantidadADescontar = convertirUnidad(
            ing.cantidad * factorProduccion,
            ing.unidad,
            nuevosInsumos[insumoIndex].unidadStock
          );
          nuevosInsumos[insumoIndex].stock -= cantidadADescontar;
        }
      }
    });
    
    // Actualizar stock de receta (siempre en unidades)
    const nuevasRecetas = recetas.map(r => {
      if (r.id === receta.id) {
        return { ...r, stock: r.stock + cantidadRealUnidades };
      }
      return r;
    });
    
    setInsumos(nuevosInsumos);
    setRecetas(nuevasRecetas);
    setShowProducirModal(false);
    setCantidadProducir(1);
    setTipoProduccion('completa');
    
    const mensajeProduccion = tipoProduccion === 'completa'
      ? `${cantidadProducir} receta(s) completa(s) = ${cantidadRealUnidades} unidades`
      : `${cantidadProducir} unidad(es)`;
    
    alert(`✅ ¡Producción exitosa!\n\n${mensajeProduccion}\nStock actualizado: ${receta.stock} → ${receta.stock + cantidadRealUnidades} unidades`);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text, margin: '0 0 0.5rem 0' }}>Gestión de Recetas</h2><p style={{ color: theme.textLight, margin: 0 }}>Crea recetas y produce para tener stock</p></div>
        <Button icon={Plus} onClick={() => setShowModal(true)} disabled={insumos.length === 0}>Nueva Receta</Button>
      </div>

      {insumos.length === 0 && <Alert type="warning" style={{ marginBottom: '2rem' }}><AlertDescription>Debes agregar insumos antes de crear recetas.</AlertDescription></Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {recetas.map(receta => {
          const costo = calcularCostoReceta(receta);
          return (
            <Card key={receta.id}>
              {/* IMAGEN DE LA RECETA */}
              {receta.imagen && (
                <div style={{ 
                  marginBottom: '1rem', 
                  textAlign: 'center',
                  backgroundColor: theme.background,
                  borderRadius: '12px',
                  padding: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={receta.imagen} 
                    alt={receta.nombre}
                    style={{ 
                      width: '100%', 
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }} 
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.text, margin: 0 }}>{receta.nombre}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button size="sm" variant="secondary" icon={Edit2} onClick={() => { setFormData(receta); setEditingItem(receta); setShowModal(true); }} style={{ padding: '0.5rem', minWidth: 'auto' }} />
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => { if (confirm('¿Eliminar?')) setRecetas(recetas.filter(r => r.id !== receta.id)); }} style={{ padding: '0.5rem', minWidth: 'auto' }} />
                </div>
              </div>
              
              {/* STOCK DE RECETA */}
              <div style={{ backgroundColor: receta.stock === 0 ? '#FFEBEE' : receta.stock < 5 ? '#FFF9E6' : theme.secondary, borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: `2px solid ${receta.stock === 0 ? theme.danger : receta.stock < 5 ? theme.warning : theme.success}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: theme.textLight, fontWeight: '500' }}>Stock Disponible</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: '700', color: receta.stock === 0 ? theme.danger : receta.stock < 5 ? theme.warning : theme.success }}>{receta.stock}</span>
                </div>
                <Button
                  variant="primary"
                  icon={PlayCircle}
                  fullWidth
                  onClick={() => { setRecetaProducir(receta); setShowProducirModal(true); }}
                  style={{ marginTop: '0.5rem' }}
                >
                  Producir
                </Button>
              </div>
              
              <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ fontSize: '0.9rem', color: theme.textLight, fontWeight: '500' }}>Costo de Producción</span><span style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.primary }}>{formatearMoneda(costo)}</span></div>
                {receta.fechaCreacion && <div style={{ fontSize: '0.8rem', color: theme.textLight }}>Creado: {formatearFecha(receta.fechaCreacion)}</div>}
              </div>
              <div style={{ backgroundColor: '#E3F2FD', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '2px solid #2196F3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: theme.textLight, fontWeight: '500' }}>🍰 Rendimiento:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2196F3' }}>
                    {receta.rendimientoUnidades || 1} {receta.unidadRendimiento || 'unidad'}(es)
                    {receta.unidadRendimiento === 'docena' && ` (${(receta.rendimientoUnidades || 1) * 12} unidades)`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #2196F3', fontSize: '0.9rem' }}>
                  <span style={{ color: theme.textLight }}>Costo por unidad:</span>
                  <span style={{ fontWeight: '600', color: theme.text }}>
                    {formatearMoneda(costo / (receta.unidadRendimiento === 'docena' ? (receta.rendimientoUnidades || 1) * 12 : (receta.rendimientoUnidades || 1)))}
                  </span>
                </div>
                {(receta.unidadRendimiento === 'unidad' && (receta.rendimientoUnidades || 1) >= 12) || receta.unidadRendimiento === 'docena' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    <span style={{ color: theme.textLight }}>Costo por docena:</span>
                    <span style={{ fontWeight: '600', color: theme.text }}>
                      {formatearMoneda((costo / (receta.unidadRendimiento === 'docena' ? (receta.rendimientoUnidades || 1) * 12 : (receta.rendimientoUnidades || 1))) * 12)}
                    </span>
                  </div>
                ) : null}
              </div>
              <div><h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.text, marginBottom: '0.75rem' }}>Ingredientes ({receta.ingredientes.length})</h4>
                <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {receta.ingredientes.map((ing, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: theme.hover, borderRadius: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: theme.text }}>{ing.nombre}</span>
                      <span style={{ fontWeight: '600', color: theme.textLight }}>{ing.cantidadOriginal || ing.cantidad} {ing.unidadOriginal || ing.unidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {recetas.length === 0 && insumos.length > 0 && <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}><ChefHat size={48} color={theme.textLight} style={{ margin: '0 auto 1rem' }} /><p style={{ fontSize: '1.1rem', color: theme.textLight }}>No hay recetas. ¡Crea la primera!</p></Card>}

      {/* Modal NUEVA RECETA */}
      {showModal && (
        <Modal onClose={resetForm} title={editingItem ? 'Editar Receta' : 'Nueva Receta'} large>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
              <Input label="Nombre de la Receta" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
              <Input label="Stock Inicial" type="number" step="1" min="0" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
              <Input label="Fecha de Creación" type="date" required value={formData.fechaCreacion} onChange={e => setFormData({ ...formData, fechaCreacion: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <Input label="🍰 Rendimiento (unidades que produce esta receta)" type="number" step="1" min="1" required value={formData.rendimientoUnidades} onChange={e => setFormData({ ...formData, rendimientoUnidades: e.target.value })} placeholder="Ej: 48 empanadas" />
              <Select label="Tipo de unidad" required value={formData.unidadRendimiento} onChange={e => setFormData({ ...formData, unidadRendimiento: e.target.value })}>
                <option value="unidad">Unidad</option>
                <option value="docena">Docena</option>
                <option value="porcion">Porción</option>
                <option value="kg">Kilogramo</option>
              </Select>
            </div>
            
            {/* Campo de Imagen */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: theme.text }}>
                📷 Imagen del Producto (opcional)
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImagenChange}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  border: `2px solid ${theme.border}`,
                  fontSize: '0.95rem',
                  backgroundColor: 'white'
                }} 
              />
              {formData.imagen && (
                <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  <img 
                    src={formData.imagen} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px', 
                      borderRadius: '8px',
                      border: `2px solid ${theme.border}`,
                      objectFit: 'cover'
                    }} 
                  />
                  <div style={{ marginTop: '0.5rem' }}>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => setFormData({ ...formData, imagen: '' })}
                    >
                      Quitar imagen
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, marginBottom: '0.75rem' }}>➕ Agregar Insumos</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem' }}>
                <Select value={selectedInsumo} onChange={e => { setSelectedInsumo(e.target.value); const insumo = insumos.find(i => i.id === e.target.value); if (insumo) setUnidadInsumo(insumo.unidad); }} style={{ fontSize: '0.9rem' }}><option value="">Seleccionar insumo...</option>{insumos.map(insumo => <option key={insumo.id} value={insumo.id}>{insumo.nombre} ({insumo.unidad})</option>)}</Select>
                <Input type="number" step="0.01" placeholder="Cantidad" value={cantidadInsumo} onChange={e => setCantidadInsumo(e.target.value)} style={{ fontSize: '0.9rem' }} />
                <Select value={unidadInsumo} onChange={e => setUnidadInsumo(e.target.value)} disabled={!selectedInsumo} style={{ fontSize: '0.9rem' }}>{getUnidadesDisponibles().map(u => <option key={u} value={u}>{u}</option>)}</Select>
                <Button type="button" size="sm" onClick={handleAddInsumo} disabled={!selectedInsumo || !cantidadInsumo} icon={Plus} style={{ padding: '0.75rem 1rem', minWidth: 'auto' }} />
              </div>
              {selectedInsumo && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: theme.textLight }}>💡 Conversión automática activada</div>}
            </div>

            {formData.ingredientes.length > 0 && (
              <>
                <div><h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, marginBottom: '0.5rem' }}>Ingredientes Agregados ({formData.ingredientes.length})</h4>
                  <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', padding: '0.5rem', backgroundColor: theme.background, borderRadius: '8px' }}>
                    {formData.ingredientes.map((ing, idx) => (
                      <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <div style={{ flex: 1 }}><span style={{ fontWeight: '600', color: theme.text }}>{ing.nombre}</span><div style={{ fontSize: '0.85rem', color: theme.textLight, marginTop: '0.25rem' }}>{ing.cantidadOriginal || ing.cantidad} {ing.unidadOriginal || ing.unidad} × {formatearMoneda(ing.precioUnitario)} = {formatearMoneda(ing.cantidad * ing.precioUnitario)}</div></div>
                        <Button type="button" size="sm" variant="danger" icon={Trash2} onClick={() => setFormData({ ...formData, ingredientes: formData.ingredientes.filter((_, i) => i !== idx) })} style={{ padding: '0.5rem', minWidth: 'auto', marginLeft: '0.5rem' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ backgroundColor: theme.secondary, borderRadius: '12px', padding: '1rem', border: `2px solid ${theme.primary}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Calculator size={20} color={theme.text} /><h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, margin: 0 }}>Costo de Producción</h4></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}><span style={{ color: theme.textLight, fontSize: '0.95rem' }}>Costo total receta:</span><span style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.primary }}>{formatearMoneda(calcularCostoReceta(formData))}</span></div>
                  {(formData.rendimientoUnidades > 1) && (
                    <div style={{ paddingTop: '0.5rem', borderTop: `1px solid ${theme.primary}`, display: 'grid', gap: '0.25rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: theme.textLight }}>Costo por {formData.unidadRendimiento}:</span>
                        <span style={{ fontWeight: '600', color: theme.text }}>{formatearMoneda(calcularCostoReceta(formData) / (parseFloat(formData.rendimientoUnidades) || 1))}</span>
                      </div>
                      {formData.unidadRendimiento === 'unidad' && parseFloat(formData.rendimientoUnidades) >= 12 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: theme.textLight }}>Costo por docena:</span>
                          <span style={{ fontWeight: '600', color: theme.text }}>{formatearMoneda((calcularCostoReceta(formData) / (parseFloat(formData.rendimientoUnidades) || 1)) * 12)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <Button variant="outline" onClick={resetForm} fullWidth>Cancelar</Button>
              <Button type="submit" icon={Save} fullWidth disabled={formData.ingredientes.length === 0}>{editingItem ? 'Actualizar' : 'Guardar'} Receta</Button>
            </div>
          </form>
        </Modal>
      )}
      
      {/* Modal PRODUCIR */}
      {showProducirModal && recetaProducir && (
        <Modal onClose={() => { setShowProducirModal(false); setCantidadProducir(1); }} title={`Producir: ${recetaProducir.nombre}`}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <Alert type="info">
              <AlertDescription>
                Al producir, se descontarán los insumos necesarios y se sumará al stock de esta receta
              </AlertDescription>
            </Alert>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Select
                label="¿Qué quieres producir?"
                value={tipoProduccion}
                onChange={e => {
                  setTipoProduccion(e.target.value);
                  if (e.target.value === 'completa') {
                    setCantidadProducir(1);
                  } else {
                    setCantidadProducir(recetaProducir.rendimientoUnidades || 1);
                  }
                }}
              >
                <option value="completa">
                  Receta completa ({recetaProducir.rendimientoUnidades || 1} {recetaProducir.unidadRendimiento || 'unidad'}es)
                </option>
                <option value="unidades">Unidades sueltas</option>
              </Select>
              
              <Input
                label={tipoProduccion === 'completa' ? 'Cantidad de recetas' : 'Cantidad de unidades'}
                type="number"
                step="1"
                min="1"
                value={cantidadProducir}
                onChange={e => setCantidadProducir(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <Card style={{ backgroundColor: theme.background }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, marginBottom: '1rem' }}>Insumos necesarios:</h4>
              {recetaProducir.ingredientes.map(ing => {
                const insumo = insumos.find(i => i.id === ing.idInsumo);
                if (!insumo) return null;
                const unidadesPorRendimiento = recetaProducir.unidadRendimiento === 'docena' 
                  ? (recetaProducir.rendimientoUnidades || 1) * 12 
                  : (recetaProducir.rendimientoUnidades || 1);
                const cantidadRealUnidades = tipoProduccion === 'completa' 
                  ? cantidadProducir * unidadesPorRendimiento
                  : cantidadProducir;
                const factorProduccion = cantidadRealUnidades / unidadesPorRendimiento;
                const cantidadNecesaria = convertirUnidad(ing.cantidad * factorProduccion, ing.unidad, insumo.unidadStock);
                const suficiente = insumo.stock >= cantidadNecesaria;
                return (
                  <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: suficiente ? 'white' : '#FFEBEE', borderRadius: '8px', marginBottom: '0.5rem', border: `2px solid ${suficiente ? theme.border : theme.danger}` }}>
                    <span style={{ fontWeight: '600', color: theme.text }}>{ing.nombre}</span>
                    <span style={{ color: suficiente ? theme.success : theme.danger }}>
                      Necesitas: {cantidadNecesaria.toFixed(2)} {insumo.unidadStock} | Tienes: {insumo.stock} {insumo.unidadStock}
                    </span>
                  </div>
                );
              })}
            </Card>
            
            <Card style={{ backgroundColor: theme.secondary, border: `2px solid ${theme.primary}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: theme.textLight }}>Stock actual:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: theme.text }}>{recetaProducir.stock} unidades</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: `1px solid ${theme.primary}` }}>
                <span style={{ fontWeight: '600', color: theme.success }}>Stock después de producir:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.success }}>
                  {(() => {
                    const unidadesPorRendimiento = recetaProducir.unidadRendimiento === 'docena' 
                      ? (recetaProducir.rendimientoUnidades || 1) * 12 
                      : (recetaProducir.rendimientoUnidades || 1);
                    const cantidadRealUnidades = tipoProduccion === 'completa' 
                      ? cantidadProducir * unidadesPorRendimiento
                      : cantidadProducir;
                    return recetaProducir.stock + cantidadRealUnidades;
                  })()} unidades
                </span>
              </div>
              {tipoProduccion === 'completa' && (
                <div style={{ fontSize: '0.85rem', color: theme.textLight, marginTop: '0.5rem', textAlign: 'center' }}>
                  ({cantidadProducir} receta(s) = {(() => {
                    const unidadesPorRendimiento = recetaProducir.unidadRendimiento === 'docena' 
                      ? (recetaProducir.rendimientoUnidades || 1) * 12 
                      : (recetaProducir.rendimientoUnidades || 1);
                    return cantidadProducir * unidadesPorRendimiento;
                  })()} unidades)
                </div>
              )}
            </Card>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button variant="outline" onClick={() => { setShowProducirModal(false); setCantidadProducir(1); setTipoProduccion('completa'); }} fullWidth>Cancelar</Button>
              <Button icon={PlayCircle} onClick={handleProducir} fullWidth>
                Producir {(() => {
                  const unidadesPorRendimiento = recetaProducir.unidadRendimiento === 'docena' 
                    ? (recetaProducir.rendimientoUnidades || 1) * 12 
                    : (recetaProducir.rendimientoUnidades || 1);
                  return tipoProduccion === 'completa' 
                    ? `${cantidadProducir * unidadesPorRendimiento} unidades`
                    : `${cantidadProducir} unidad(es)`;
                })()}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
// ==================== COMPONENTE: VENTAS (Precios) ====================
const VentasView = ({ recetas, packaging, insumos }) => {
  const [productos, setProductos] = useState([]);
  const [tempPackaging, setTempPackaging] = useState({});

  const calcularCostoReceta = (receta) => {
    let costoTotal = 0;
    receta.ingredientes.forEach(ing => {
      if (ing.tipo === 'insumo') {
        costoTotal += ing.cantidad * ing.precioUnitario;
      } else if (ing.tipo === 'receta') {
        const recetaRef = recetas.find(r => r.id === ing.idReferencia);
        if (recetaRef) costoTotal += calcularCostoReceta(recetaRef);
      }
    });
    return costoTotal;
  };

  const agregarProducto = (receta) => {
    const costoReceta = calcularCostoReceta(receta);
    const nuevoProducto = {
      id: generarId(),
      recetaId: receta.id,
      nombreReceta: receta.nombre,
      costoReceta,
      rendimientoUnidades: receta.rendimientoUnidades || 1,
      unidadRendimiento: receta.unidadRendimiento || 'unidad',
      packagings: [],
      porcentajeManoObra: 10,
      porcentajeServicios: 5,
      porcentajeDesechables: 3,
      precioVentaTotal: 0,
      precioVentaPorUnidad: 0
    };
    setProductos([...productos, nuevoProducto]);
    setTempPackaging({ ...tempPackaging, [nuevoProducto.id]: { id: '', cantidad: 1 } });
  };

  const agregarPackagingAProducto = (productoId) => {
    const temp = tempPackaging[productoId];
    if (temp?.id && temp.cantidad > 0) {
      const pack = packaging.find(p => p.id === temp.id);
      if (pack) {
        setProductos(productos.map(p => {
          if (p.id === productoId) {
            return {
              ...p,
              packagings: [...p.packagings, {
                id: temp.id,
                nombre: pack.nombre,
                cantidad: parseInt(temp.cantidad),
                precio: pack.precio
              }]
            };
          }
          return p;
        }));
        setTempPackaging({ ...tempPackaging, [productoId]: { id: '', cantidad: 1 } });
      }
    }
  };

  const eliminarPackagingDeProducto = (productoId, packagingIndex) => {
    setProductos(productos.map(p => {
      if (p.id === productoId) {
        return {
          ...p,
          packagings: p.packagings.filter((_, idx) => idx !== packagingIndex)
        };
      }
      return p;
    }));
  };

  const actualizarProducto = (id, campo, valor) => {
    setProductos(productos.map(p => {
      if (p.id === id) {
        return { ...p, [campo]: valor };
      }
      return p;
    }));
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
    const newTemp = { ...tempPackaging };
    delete newTemp[id];
    setTempPackaging(newTemp);
  };

  const calcularTotales = (producto) => {
    const costoPackagingTotal = producto.packagings.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const baseRecetaPackaging = producto.costoReceta + costoPackagingTotal;
    const costoManoObra = baseRecetaPackaging * (producto.porcentajeManoObra / 100);
    const costoServicios = baseRecetaPackaging * (producto.porcentajeServicios / 100);
    const costoDesechables = baseRecetaPackaging * (producto.porcentajeDesechables / 100);
    const costoTotal = baseRecetaPackaging + costoManoObra + costoServicios + costoDesechables;
    
    // CONVERSIÓN CORRECTA DE DOCENA A UNIDAD
    const unidadesPorRendimiento = producto.unidadRendimiento === 'docena' 
      ? (producto.rendimientoUnidades || 1) * 12 
      : (producto.rendimientoUnidades || 1);
    
    // Costos por unidad
    const costoPorUnidad = costoTotal / unidadesPorRendimiento;
    const costoPorDocena = costoPorUnidad * 12;
    
    // Ganancias
    const gananciaTotal = producto.precioVentaTotal - costoTotal;
    const margenTotal = producto.precioVentaTotal > 0 ? (gananciaTotal / producto.precioVentaTotal * 100) : 0;
    
    const gananciaPorUnidad = producto.precioVentaPorUnidad - costoPorUnidad;
    const margenPorUnidad = producto.precioVentaPorUnidad > 0 ? (gananciaPorUnidad / producto.precioVentaPorUnidad * 100) : 0;
    
    return {
      baseRecetaPackaging,
      costoPackagingTotal,
      costoManoObra,
      costoServicios,
      costoDesechables,
      costoTotal,
      costoPorUnidad,
      costoPorDocena,
      gananciaTotal,
      margenTotal,
      gananciaPorUnidad,
      margenPorUnidad
    };
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text, margin: '0 0 0.5rem 0' }}>
            Cálculo de Precios de Venta
          </h2>
          <p style={{ color: theme.textLight, margin: 0 }}>
            Calcula precios con rendimiento y múltiples packagings
          </p>
        </div>
      </div>

      {recetas.length === 0 ? (
        <Alert type="warning">
          <AlertDescription>
            Debes crear recetas antes de configurar precios de venta.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div style={{ marginBottom: '2rem', backgroundColor: theme.card, borderRadius: '12px', padding: '1.5rem', border: `2px solid ${theme.border}` }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: theme.text, marginBottom: '1rem' }}>
              Selecciona una receta para calcular precio
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {recetas.map(receta => (
                <Button
                  key={receta.id}
                  variant="outline"
                  onClick={() => agregarProducto(receta)}
                  icon={Plus}
                  style={{ fontSize: '0.9rem' }}
                >
                  {receta.nombre}
                </Button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {productos.map(producto => {
              const totales = calcularTotales(producto);
              return (
                <Card key={producto.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: theme.text, margin: '0 0 0.5rem 0' }}>
                        {producto.nombreReceta}
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: theme.textLight }}>
                        🍰 Rinde: {producto.rendimientoUnidades} {producto.unidadRendimiento}(es)
                        {producto.unidadRendimiento === 'docena' && ` (${producto.rendimientoUnidades * 12} unidades)`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      onClick={() => eliminarProducto(producto.id)}
                      style={{ padding: '0.5rem', minWidth: 'auto' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {/* Costos Base */}
                    <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, marginBottom: '1rem' }}>
                        💰 Costos Base
                      </h4>
                      <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.95rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: theme.textLight }}>Costo de la receta completa:</span>
                          <span style={{ fontWeight: '600', color: theme.text }}>
                            {formatearMoneda(producto.costoReceta)}
                          </span>
                        </div>
                        
                        {/* MÚLTIPLES PACKAGINGS */}
                        <div style={{ paddingTop: '0.75rem', borderTop: `1px solid ${theme.border}` }}>
                          <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.text, marginBottom: '0.75rem' }}>
                            📦 Packagings (podés agregar varios)
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Select
                              value={tempPackaging[producto.id]?.id || ''}
                              onChange={e => setTempPackaging({ ...tempPackaging, [producto.id]: { ...tempPackaging[producto.id], id: e.target.value } })}
                              style={{ fontSize: '0.9rem' }}
                            >
                              <option value="">Seleccionar packaging...</option>
                              {packaging.map(pack => (
                                <option key={pack.id} value={pack.id}>
                                  {pack.nombre} - {formatearMoneda(pack.precio)}
                                </option>
                              ))}
                            </Select>
                            <Input
                              type="number"
                              step="1"
                              min="1"
                              placeholder="Cantidad"
                              value={tempPackaging[producto.id]?.cantidad || 1}
                              onChange={e => setTempPackaging({ ...tempPackaging, [producto.id]: { ...tempPackaging[producto.id], cantidad: e.target.value } })}
                              style={{ fontSize: '0.9rem' }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => agregarPackagingAProducto(producto.id)}
                              disabled={!tempPackaging[producto.id]?.id}
                              icon={Plus}
                              style={{ padding: '0.75rem 1rem', minWidth: 'auto' }}
                            />
                          </div>
                          
                          {producto.packagings.length > 0 && (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              {producto.packagings.map((pack, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{pack.nombre}</span>
                                  <span style={{ fontSize: '0.85rem', color: theme.textLight }}>
                                    Cant: {pack.cantidad} × {formatearMoneda(pack.precio)} = {formatearMoneda(pack.cantidad * pack.precio)}
                                  </span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="danger"
                                    icon={Trash2}
                                    onClick={() => eliminarPackagingDeProducto(producto.id, idx)}
                                    style={{ padding: '0.4rem', minWidth: 'auto' }}
                                  />
                                </div>
                              ))}
                              <div style={{ padding: '0.5rem', backgroundColor: theme.secondary, borderRadius: '6px', fontWeight: '600', textAlign: 'right', fontSize: '0.9rem' }}>
                                Total packaging: {formatearMoneda(totales.costoPackagingTotal)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Costos Adicionales */}
                    <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, marginBottom: '1rem' }}>
                        📊 Costos Adicionales (% sobre Receta + Packaging)
                      </h4>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {[
                          { key: 'porcentajeManoObra', label: 'Mano de Obra', costo: totales.costoManoObra },
                          { key: 'porcentajeServicios', label: 'Servicios', costo: totales.costoServicios },
                          { key: 'porcentajeDesechables', label: 'Desechables', costo: totales.costoDesechables }
                        ].map(item => (
                          <div key={item.key} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ color: theme.textLight, fontSize: '0.9rem' }}>{item.label}:</span>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              value={producto[item.key]}
                              onChange={e => actualizarProducto(producto.id, item.key, parseFloat(e.target.value) || 0)}
                              style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                            />
                            <div style={{ padding: '0.5rem', backgroundColor: theme.secondary, borderRadius: '6px', fontWeight: '600', textAlign: 'center', fontSize: '0.9rem' }}>
                              {formatearMoneda(item.costo)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resumen de Costos */}
                    <div style={{ backgroundColor: '#E3F2FD', borderRadius: '12px', padding: '1.25rem', border: '2px solid #2196F3' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, marginBottom: '1rem' }}>
                        📋 Resumen de Costos
                      </h4>
                      <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #2196F3' }}>
                          <span style={{ fontWeight: '700', color: theme.text }}>COSTO TOTAL RECETA:</span>
                          <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#2196F3' }}>
                            {formatearMoneda(totales.costoTotal)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                          <span style={{ color: theme.textLight }}>Costo por {producto.unidadRendimiento}:</span>
                          <span style={{ fontWeight: '600', color: theme.text }}>
                            {formatearMoneda(totales.costoPorUnidad)}
                          </span>
                        </div>
                        {producto.unidadRendimiento === 'unidad' && producto.rendimientoUnidades >= 12 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: theme.textLight }}>Costo por docena:</span>
                            <span style={{ fontWeight: '600', color: theme.text }}>
                              {formatearMoneda(totales.costoPorDocena)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Precios de Venta */}
                    <div style={{ backgroundColor: theme.secondary, borderRadius: '12px', padding: '1.5rem', border: `2px solid ${theme.primary}` }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, marginBottom: '1rem' }}>
                        💵 Precios de Venta
                      </h4>
                      
                      {/* Precio Total */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: theme.text, marginBottom: '0.5rem' }}>
                          Precio total de la receta ({producto.rendimientoUnidades} {producto.unidadRendimiento}es):
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={producto.precioVentaTotal}
                          onChange={e => actualizarProducto(producto.id, 'precioVentaTotal', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          style={{ fontSize: '1.25rem', fontWeight: '700', textAlign: 'center' }}
                        />
                        {producto.precioVentaTotal > 0 && (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontSize: '0.85rem', color: totales.gananciaTotal >= 0 ? theme.success : theme.danger, fontWeight: '600' }}>
                                {totales.gananciaTotal >= 0 ? '✅ Ganancia Total:' : '⚠️ Pérdida Total:'}
                              </span>
                              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: totales.gananciaTotal >= 0 ? theme.success : theme.danger }}>
                                {formatearMoneda(Math.abs(totales.gananciaTotal))}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.8rem', color: theme.textLight }}>Margen:</span>
                              <Badge variant={totales.margenTotal >= 20 ? 'success' : totales.margenTotal >= 10 ? 'warning' : 'danger'}>
                                {totales.margenTotal.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Precio Por Unidad CON SELECTOR DE CANTIDAD */}
                      <div style={{ paddingTop: '1rem', borderTop: `2px solid ${theme.primary}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: theme.text, marginBottom: '0.5rem' }}>
                              Precio por:
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={producto.precioVentaPorUnidad}
                              onChange={e => actualizarProducto(producto.id, 'precioVentaPorUnidad', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              style={{ fontSize: '1.25rem', fontWeight: '700', textAlign: 'center' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: theme.text, marginBottom: '0.5rem' }}>
                              Tipo:
                            </label>
                            <Select
                              value={producto.tipoVenta || 'unidad'}
                              onChange={e => actualizarProducto(producto.id, 'tipoVenta', e.target.value)}
                              style={{ fontSize: '0.95rem', fontWeight: '600', textAlign: 'center' }}
                            >
                              <option value="unidad">Unidad</option>
                              <option value="docena">Docena</option>
                              <option value="media_docena">Media Docena</option>
                              <option value="kilo">Kilo</option>
                              <option value="porcion">Porción</option>
                            </Select>
                          </div>
                        </div>
                        
                        {producto.precioVentaPorUnidad > 0 && (() => {
                          const tipoVenta = producto.tipoVenta || 'unidad';
                          const multiplicadores = {
                            'unidad': 1,
                            'docena': 12,
                            'media_docena': 6,
                            'kilo': 1,
                            'porcion': 1
                          };
                          const multiplicador = multiplicadores[tipoVenta] || 1;
                          const precioRealPorUnidad = tipoVenta === 'docena' ? producto.precioVentaPorUnidad / 12 : 
                                                      tipoVenta === 'media_docena' ? producto.precioVentaPorUnidad / 6 : 
                                                      producto.precioVentaPorUnidad;
                          const gananciaCalculada = precioRealPorUnidad - totales.costoPorUnidad;
                          const margenCalculado = precioRealPorUnidad > 0 ? (gananciaCalculada / precioRealPorUnidad * 100) : 0;
                          
                          return (
                            <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e0e0e0' }}>
                                <span style={{ fontSize: '0.85rem', color: theme.textLight }}>
                                  Precio por {tipoVenta}:
                                </span>
                                <span style={{ fontSize: '1rem', fontWeight: '700', color: theme.text }}>
                                  {formatearMoneda(producto.precioVentaPorUnidad)}
                                </span>
                              </div>
                              
                              {(tipoVenta === 'docena' || tipoVenta === 'media_docena') && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                  <span style={{ color: theme.textLight }}>Precio por unidad:</span>
                                  <span style={{ fontWeight: '600', color: theme.text }}>
                                    {formatearMoneda(precioRealPorUnidad)}
                                  </span>
                                </div>
                              )}
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid #e0e0e0' }}>
                                <span style={{ fontSize: '0.85rem', color: gananciaCalculada >= 0 ? theme.success : theme.danger, fontWeight: '600' }}>
                                  {gananciaCalculada >= 0 ? '✅ Ganancia por unidad:' : '⚠️ Pérdida por unidad:'}
                                </span>
                                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: gananciaCalculada >= 0 ? theme.success : theme.danger }}>
                                  {formatearMoneda(Math.abs(gananciaCalculada))}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: theme.textLight }}>Margen:</span>
                                <Badge variant={margenCalculado >= 20 ? 'success' : margenCalculado >= 10 ? 'warning' : 'danger'}>
                                  {margenCalculado.toFixed(1)}%
                                </Badge>
                              </div>
                              
                              {/* Conversiones adicionales */}
                              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #e0e0e0', fontSize: '0.85rem' }}>
                                {tipoVenta === 'unidad' && (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                      <span style={{ color: theme.textLight }}>Precio por media docena:</span>
                                      <span style={{ fontWeight: '600', color: theme.text }}>
                                        {formatearMoneda(producto.precioVentaPorUnidad * 6)}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                      <span style={{ color: theme.textLight }}>Precio por docena:</span>
                                      <span style={{ fontWeight: '600', color: theme.text }}>
                                        {formatearMoneda(producto.precioVentaPorUnidad * 12)}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: theme.textLight }}>Ganancia por docena:</span>
                                      <span style={{ fontWeight: '600', color: gananciaCalculada >= 0 ? theme.success : theme.danger }}>
                                        {formatearMoneda(gananciaCalculada * 12)}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {tipoVenta === 'docena' && (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                      <span style={{ color: theme.textLight }}>Ganancia por docena:</span>
                                      <span style={{ fontWeight: '600', color: gananciaCalculada >= 0 ? theme.success : theme.danger }}>
                                        {formatearMoneda(gananciaCalculada * 12)}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: theme.textLight }}>Ganancia por media docena:</span>
                                      <span style={{ fontWeight: '600', color: gananciaCalculada >= 0 ? theme.success : theme.danger }}>
                                        {formatearMoneda(gananciaCalculada * 6)}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {tipoVenta === 'media_docena' && (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                      <span style={{ color: theme.textLight }}>Ganancia por media docena:</span>
                                      <span style={{ fontWeight: '600', color: gananciaCalculada >= 0 ? theme.success : theme.danger }}>
                                        {formatearMoneda(gananciaCalculada * 6)}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: theme.textLight }}>Ganancia por docena:</span>
                                      <span style={{ fontWeight: '600', color: gananciaCalculada >= 0 ? theme.success : theme.danger }}>
                                        {formatearMoneda(gananciaCalculada * 12)}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {productos.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <DollarSign size={48} color={theme.textLight} style={{ marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
              <p style={{ fontSize: '1.1rem', color: theme.textLight }}>
                Selecciona una receta arriba para comenzar a calcular precios
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

// ==================== COMPONENTE: HISTORIAL DE VENTAS (DESCUENTA STOCK DE RECETAS) ====================
const HistorialView = ({ ventasRealizadas, setVentasRealizadas, recetas, setRecetas, insumos, setInsumos, packaging, setPackaging }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    recetaId: '',
    cantidadUnidades: 1,
    precioTotal: 0,
    packagings: [],
    porcentajeManoObra: 0,
    porcentajeServicios: 0,
    porcentajeDesechables: 0,
    fecha: new Date().toISOString().split('T')[0]
  });
  const [tempPackaging, setTempPackaging] = useState({ id: '', cantidad: 1 });
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');

  const calcularCostoReceta = (receta) => {
    let costoTotal = 0;
    receta.ingredientes.forEach(ing => {
      if (ing.tipo === 'insumo') {
        costoTotal += ing.cantidad * ing.precioUnitario;
      } else if (ing.tipo === 'receta') {
        const recetaRef = recetas.find(r => r.id === ing.idReferencia);
        if (recetaRef) costoTotal += calcularCostoReceta(recetaRef);
      }
    });
    return costoTotal;
  };

  const agregarPackaging = () => {
    if (tempPackaging.id && tempPackaging.cantidad > 0) {
      const pack = packaging.find(p => p.id === tempPackaging.id);
      if (pack) {
        setFormData({
          ...formData,
          packagings: [...formData.packagings, {
            id: tempPackaging.id,
            nombre: pack.nombre,
            cantidad: parseInt(tempPackaging.cantidad),
            precio: pack.precio
          }]
        });
        setTempPackaging({ id: '', cantidad: 1 });
      }
    }
  };

  const registrarVenta = e => {
    e.preventDefault();
    const receta = recetas.find(r => r.id === formData.recetaId);
    
    // VALIDAR STOCK DE RECETA
    if (receta.stock < formData.cantidadUnidades) {
      alert(`⚠️ Stock insuficiente\n\nNecesitas: ${formData.cantidadUnidades} unidades\nTienes: ${receta.stock} unidades\n\n💡 Ve a "Recetas" y produce más`);
      return;
    }
    
    // Validar stock de todos los packagings
    for (const packForm of formData.packagings) {
      const pack = packaging.find(p => p.id === packForm.id);
      if (pack) {
        const cantidadNecesaria = packForm.cantidad * formData.cantidadUnidades;
        if (pack.stock < cantidadNecesaria) {
          alert(`⚠️ Stock de packaging insuficiente\n\n${pack.nombre}\nNecesitas: ${cantidadNecesaria} ${pack.unidadStock}\nTienes: ${pack.stock} ${pack.unidadStock}`);
          return;
        }
      }
    }
    
    // CALCULAR COSTOS (conversión correcta de docena a unidad)
    const costoReceta = calcularCostoReceta(receta);
    const unidadesPorRendimiento = receta.unidadRendimiento === 'docena' 
      ? (receta.rendimientoUnidades || 1) * 12 
      : (receta.rendimientoUnidades || 1);
    const costoPorUnidad = costoReceta / unidadesPorRendimiento;
    
    // Calcular costos totales
    const costoPackaging = formData.packagings.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const baseRecetaPackaging = (costoPorUnidad * formData.cantidadUnidades) + costoPackaging;
    const costoManoObra = baseRecetaPackaging * (formData.porcentajeManoObra / 100);
    const costoServicios = baseRecetaPackaging * (formData.porcentajeServicios / 100);
    const costoDesechables = baseRecetaPackaging * (formData.porcentajeDesechables / 100);
    const costoTotal = baseRecetaPackaging + costoManoObra + costoServicios + costoDesechables;
    const ganancia = formData.precioTotal - costoTotal;
    const margenGanancia = formData.precioTotal > 0 ? (ganancia / formData.precioTotal * 100) : 0;
    
    // DESCUENTO AUTOMÁTICO DE STOCK DE RECETAS
    const nuevasRecetas = recetas.map(r => {
      if (r.id === formData.recetaId) {
        return { ...r, stock: r.stock - formData.cantidadUnidades };
      }
      return r;
    });
    
    const nuevoPackaging = [...packaging];
    
    // Descontar todos los packagings
    formData.packagings.forEach(packForm => {
      const packIndex = nuevoPackaging.findIndex(p => p.id === packForm.id);
      if (packIndex !== -1) {
        nuevoPackaging[packIndex].stock -= packForm.cantidad * formData.cantidadUnidades;
      }
    });
    
    setRecetas(nuevasRecetas);
    setPackaging(nuevoPackaging);
    
    // Registrar venta
    const nuevaVenta = {
      id: generarId(),
      cliente: formData.cliente,
      recetaId: formData.recetaId,
      recetaNombre: receta.nombre,
      cantidadUnidades: formData.cantidadUnidades,
      precioVenta: formData.precioTotal,
      precioPorUnidad: formData.precioTotal / formData.cantidadUnidades,
      costoTotal,
      costoPorUnidad,
      ganancia,
      margenGanancia,
      packagings: formData.packagings,
      porcentajeManoObra: formData.porcentajeManoObra,
      porcentajeServicios: formData.porcentajeServicios,
      porcentajeDesechables: formData.porcentajeDesechables,
      fecha: formData.fecha,
      timestamp: new Date().toISOString()
    };
    
    setVentasRealizadas([nuevaVenta, ...ventasRealizadas]);
    resetForm();
    
    alert(`✅ Venta registrada!\n\n${formData.cantidadUnidades} unidades de ${receta.nombre}\nPrecio total: ${formatearMoneda(formData.precioTotal)}\nGanancia: ${formatearMoneda(ganancia)}\n\n📦 Stock: ${receta.stock} → ${receta.stock - formData.cantidadUnidades} unidades`);
  };

  const resetForm = () => {
    setFormData({
      cliente: '',
      recetaId: '',
      cantidadUnidades: 1,
      precioTotal: 0,
      packagings: [],
      porcentajeManoObra: 0,
      porcentajeServicios: 0,
      porcentajeDesechables: 0,
      fecha: new Date().toISOString().split('T')[0]
    });
    setTempPackaging({ id: '', cantidad: 1 });
    setShowModal(false);
  };

  const eliminarVenta = (id) => {
    if (confirm('¿Eliminar esta venta? Nota: No se revertirá el stock descontado.')) {
      setVentasRealizadas(ventasRealizadas.filter(v => v.id !== id));
    }
  };

  // Filtrar ventas
  const ventasFiltradas = ventasRealizadas.filter(v => {
    const matchCliente = !filtroCliente || v.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
    const matchProducto = !filtroProducto || v.recetaNombre.toLowerCase().includes(filtroProducto.toLowerCase());
    return matchCliente && matchProducto;
  });

  // Estadísticas
  const totalVendido = ventasRealizadas.reduce((sum, v) => sum + v.precioVenta, 0);
  const totalGanancias = ventasRealizadas.reduce((sum, v) => sum + v.ganancia, 0);
  const ventasHoy = ventasRealizadas.filter(v => {
    const hoy = new Date().toISOString().split('T')[0];
    return v.fecha === hoy;
  });

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text, margin: '0 0 0.5rem 0' }}>
            Historial de Ventas
          </h2>
          <p style={{ color: theme.textLight, margin: 0 }}>
            Registra ventas y descuenta stock de recetas automáticamente
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button 
            variant="secondary"
            icon={Download}
            onClick={() => generarPDFVentas(ventasFiltradas.length > 0 ? ventasFiltradas : ventasRealizadas, ventasFiltradas.length > 0 ? 'Filtradas' : 'Todas')}
            disabled={ventasRealizadas.length === 0}
          >
            Exportar PDF
          </Button>
          <Button
            icon={Plus}
            onClick={() => setShowModal(true)}
            disabled={recetas.length === 0}
          >
            Registrar Venta
          </Button>
        </div>
      </div>

      {recetas.length === 0 && (
        <Alert type="warning" style={{ marginBottom: '2rem' }}>
          <AlertDescription>
            Debes crear recetas antes de registrar ventas.
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      {ventasRealizadas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Card style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: theme.textLight, marginBottom: '0.5rem' }}>Total Vendido</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.primary }}>{formatearMoneda(totalVendido)}</div>
          </Card>
          <Card style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: theme.textLight, marginBottom: '0.5rem' }}>Total Ganancias</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.success }}>{formatearMoneda(totalGanancias)}</div>
          </Card>
          <Card style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: theme.textLight, marginBottom: '0.5rem' }}>Ventas Hoy</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text }}>{ventasHoy.length}</div>
          </Card>
          <Card style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: theme.textLight, marginBottom: '0.5rem' }}>Total Ventas</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text }}>{ventasRealizadas.length}</div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      {ventasRealizadas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Input
            placeholder="🔍 Buscar por cliente..."
            value={filtroCliente}
            onChange={e => setFiltroCliente(e.target.value)}
          />
          <Input
            placeholder="🔍 Buscar por producto..."
            value={filtroProducto}
            onChange={e => setFiltroProducto(e.target.value)}
          />
        </div>
      )}

      {/* Lista de Ventas */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {ventasFiltradas.map(venta => (
          <Card key={venta.id}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.text, margin: 0 }}>
                    {venta.cliente || 'Sin nombre'}
                  </h3>
                  <Badge variant={venta.ganancia >= 0 ? 'success' : 'danger'}>
                    {venta.ganancia >= 0 ? '✅ Ganancia' : '⚠️ Pérdida'}
                  </Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ color: theme.textLight }}>Producto:</span>
                    <div style={{ fontWeight: '600', color: theme.text }}>{venta.recetaNombre}</div>
                  </div>
                  <div>
                    <span style={{ color: theme.textLight }}>Cantidad:</span>
                    <div style={{ fontWeight: '600', color: theme.text }}>{venta.cantidadUnidades || venta.cantidad} unidad(es)</div>
                  </div>
                  <div>
                    <span style={{ color: theme.textLight }}>Precio x unidad:</span>
                    <div style={{ fontWeight: '600', color: theme.primary }}>{formatearMoneda(venta.precioPorUnidad || (venta.precioVenta / (venta.cantidadUnidades || venta.cantidad || 1)))}</div>
                  </div>
                  <div>
                    <span style={{ color: theme.textLight }}>Total Venta:</span>
                    <div style={{ fontWeight: '600', color: theme.primary }}>{formatearMoneda(venta.precioVenta)}</div>
                  </div>
                  <div>
                    <span style={{ color: theme.textLight }}>Ganancia:</span>
                    <div style={{ fontWeight: '700', color: venta.ganancia >= 0 ? theme.success : theme.danger }}>
                      {formatearMoneda(Math.abs(venta.ganancia))}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: theme.textLight }}>Margen:</span>
                    <div style={{ fontWeight: '600', color: theme.text }}>{venta.margenGanancia.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span style={{ color: theme.textLight }}>Fecha:</span>
                    <div style={{ fontWeight: '600', color: theme.text }}>{formatearFecha(venta.fecha)}</div>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="danger"
                icon={Trash2}
                onClick={() => eliminarVenta(venta.id)}
                style={{ padding: '0.5rem', minWidth: 'auto', alignSelf: 'start' }}
              />
            </div>
          </Card>
        ))}
      </div>

      {ventasFiltradas.length === 0 && ventasRealizadas.length > 0 && (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Search size={48} color={theme.textLight} style={{ marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
          <p style={{ fontSize: '1.1rem', color: theme.textLight }}>
            No se encontraron ventas con esos filtros
          </p>
        </Card>
      )}

      {ventasRealizadas.length === 0 && recetas.length > 0 && (
        <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <TrendingUp size={48} color={theme.textLight} style={{ marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
          <p style={{ fontSize: '1.1rem', color: theme.textLight }}>
            No hay ventas registradas. ¡Registra tu primera venta!
          </p>
        </Card>
      )}

      {/* Modal Registrar Venta */}
      {showModal && (
        <Modal onClose={resetForm} title="Registrar Nueva Venta" large>
          <form onSubmit={registrarVenta} style={{ display: 'grid', gap: '1rem' }}>
            <Alert type="info">
              <AlertDescription>
                ⚡ El stock de la receta y el packaging se descontarán automáticamente al registrar la venta
              </AlertDescription>
            </Alert>
            
            <Input
              label="Nombre del Cliente"
              required
              value={formData.cliente}
              onChange={e => setFormData({ ...formData, cliente: e.target.value })}
              placeholder="Nombre del cliente..."
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <Select
                label="Producto (Receta)"
                required
                value={formData.recetaId}
                onChange={e => setFormData({ ...formData, recetaId: e.target.value })}
              >
                <option value="">Seleccionar receta...</option>
                {recetas.map(receta => {
                  const costoReceta = calcularCostoReceta(receta);
                  const unidadesPorRendimiento = receta.unidadRendimiento === 'docena' 
                    ? (receta.rendimientoUnidades || 1) * 12 
                    : (receta.rendimientoUnidades || 1);
                  const costoPorUnidad = costoReceta / unidadesPorRendimiento;
                  return (
                    <option key={receta.id} value={receta.id} disabled={receta.stock === 0}>
                      {receta.nombre} - {formatearMoneda(costoPorUnidad)}/unidad | Stock: {receta.stock} unidades
                    </option>
                  );
                })}
              </Select>
              
              <Input
                label="Cantidad (unidades)"
                type="number"
                step="1"
                min="1"
                required
                value={formData.cantidadUnidades}
                onChange={e => setFormData({ ...formData, cantidadUnidades: parseInt(e.target.value) || 1 })}
              />
            </div>

            {formData.recetaId && (() => {
              const receta = recetas.find(r => r.id === formData.recetaId);
              if (receta && formData.cantidadUnidades > receta.stock) {
                return (
                  <Alert type="error">
                    <AlertDescription>
                      ⚠️ Stock insuficiente. Tienes {receta.stock} unidades, necesitas {formData.cantidadUnidades}. Ve a "Recetas" y produce más.
                    </AlertDescription>
                  </Alert>
                );
              }
              return null;
            })()}

            {/* === MULTI PACKAGING === */}
            <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, marginBottom: '0.75rem' }}>📦 Packagings (podés agregar varios)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Select value={tempPackaging.id} onChange={e => setTempPackaging({ ...tempPackaging, id: e.target.value })} style={{ fontSize: '0.9rem' }}>
                  <option value="">Seleccionar packaging...</option>
                  {packaging.map(pack => (
                    <option key={pack.id} value={pack.id}>{pack.nombre} - {formatearMoneda(pack.precio)} | Stock: {pack.stock}</option>
                  ))}
                </Select>
                <Input type="number" step="1" min="1" placeholder="Cantidad" value={tempPackaging.cantidad} onChange={e => setTempPackaging({ ...tempPackaging, cantidad: e.target.value })} style={{ fontSize: '0.9rem' }} />
                <Button type="button" size="sm" onClick={agregarPackaging} disabled={!tempPackaging.id} icon={Plus} style={{ padding: '0.75rem 1rem', minWidth: 'auto' }} />
              </div>
              {formData.packagings.length > 0 && (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {formData.packagings.map((pack, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{pack.nombre}</span>
                      <span style={{ fontSize: '0.85rem', color: theme.textLight }}>Cant: {pack.cantidad} × {formatearMoneda(pack.precio)} = {formatearMoneda(pack.cantidad * pack.precio)}</span>
                      <Button type="button" size="sm" variant="danger" icon={Trash2} onClick={() => setFormData({ ...formData, packagings: formData.packagings.filter((_, i) => i !== idx) })} style={{ padding: '0.4rem', minWidth: 'auto' }} />
                    </div>
                  ))}
                  <div style={{ padding: '0.5rem', backgroundColor: theme.secondary, borderRadius: '6px', fontWeight: '600', textAlign: 'right', fontSize: '0.9rem' }}>
                    Total packaging: {formatearMoneda(formData.packagings.reduce((sum, p) => sum + (p.precio * p.cantidad), 0))}
                  </div>
                </div>
              )}
            </div>

            {/* === COSTOS ADICIONALES === */}
            <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.text, marginBottom: '0.75rem' }}>📊 Costos Adicionales (%)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <Input label="👷 Mano de Obra %" type="number" step="0.1" min="0" value={formData.porcentajeManoObra} onChange={e => setFormData({ ...formData, porcentajeManoObra: parseFloat(e.target.value) || 0 })} placeholder="Ej: 10" />
                <Input label="💡 Servicios %" type="number" step="0.1" min="0" value={formData.porcentajeServicios} onChange={e => setFormData({ ...formData, porcentajeServicios: parseFloat(e.target.value) || 0 })} placeholder="Ej: 5" />
                <Input label="🗑️ Desechables %" type="number" step="0.1" min="0" value={formData.porcentajeDesechables} onChange={e => setFormData({ ...formData, porcentajeDesechables: parseFloat(e.target.value) || 0 })} placeholder="Ej: 3" />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="💵 Precio TOTAL de la Venta"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.precioTotal}
                onChange={e => setFormData({ ...formData, precioTotal: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: 600.00"
                style={{ fontSize: '1.1rem', fontWeight: '600' }}
              />
              
              <Input
                label="Fecha de Venta"
                type="date"
                required
                value={formData.fecha}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>

            {formData.recetaId && formData.precioTotal > 0 && (() => {
              const receta = recetas.find(r => r.id === formData.recetaId);
              const costoReceta = calcularCostoReceta(receta);
              
              // CONVERSIÓN CORRECTA DE DOCENA A UNIDAD
              const unidadesPorRendimiento = receta.unidadRendimiento === 'docena' 
                ? (receta.rendimientoUnidades || 1) * 12 
                : (receta.rendimientoUnidades || 1);
              const costoPorUnidad = costoReceta / unidadesPorRendimiento;
              
              const costoPackagingTotal = formData.packagings.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
              
              // Calcular costos totales
              const baseRecetaPackaging = (costoPorUnidad * formData.cantidadUnidades) + costoPackagingTotal;
              const costoManoObra = baseRecetaPackaging * (formData.porcentajeManoObra / 100);
              const costoServicios = baseRecetaPackaging * (formData.porcentajeServicios / 100);
              const costoDesechables = baseRecetaPackaging * (formData.porcentajeDesechables / 100);
              const costoTotal = baseRecetaPackaging + costoManoObra + costoServicios + costoDesechables;
              const gananciaTotal = formData.precioTotal - costoTotal;
              const precioPorUnidad = formData.precioTotal / formData.cantidadUnidades;
              
              return (
                <Card style={{ backgroundColor: theme.secondary, border: `2px solid ${theme.primary}` }}>
                  <div style={{ fontSize: '0.9rem', color: theme.textLight, marginBottom: '0.75rem', fontWeight: '600' }}>
                    Vista previa de la venta
                  </div>
                  
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: `1px solid ${theme.primary}` }}>
                      <span style={{ fontWeight: '600', color: theme.text }}>Precio por unidad:</span>
                      <span style={{ fontWeight: '600' }}>{formatearMoneda(precioPorUnidad)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.textLight }}>Costo total:</span>
                      <span>{formatearMoneda(costoTotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: `1px solid ${theme.primary}` }}>
                      <span style={{ fontWeight: '700', fontSize: '1.05rem', color: gananciaTotal >= 0 ? theme.success : theme.danger }}>
                        {gananciaTotal >= 0 ? '✅ GANANCIA:' : '⚠️ PÉRDIDA:'}
                      </span>
                      <span style={{ fontWeight: '700', fontSize: '1.5rem', color: gananciaTotal >= 0 ? theme.success : theme.danger }}>
                        {formatearMoneda(Math.abs(gananciaTotal))}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })()}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      <span style={{ color: theme.textLight }}>Costo total:</span>
                      <span>{formatearMoneda(costoTotalVenta)}</span>
                    </div>
                  </div>
                </Card>
              );
            })()}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <Button variant="outline" onClick={resetForm} fullWidth>Cancelar</Button>
              <Button type="submit" icon={Save} fullWidth>Registrar Venta</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ==================== COMPONENTE: DASHBOARD ====================
const DashboardView = ({ ventasRealizadas, recetas, insumos }) => {
  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = ventasRealizadas.filter(v => v.fecha === hoy);
  const totalHoy = ventasHoy.reduce((sum, v) => sum + v.precioVenta, 0);
  const gananciaHoy = ventasHoy.reduce((sum, v) => sum + v.ganancia, 0);

  const ventasPorProducto = {};
  ventasRealizadas.forEach(v => { ventasPorProducto[v.recetaNombre] = (ventasPorProducto[v.recetaNombre] || 0) + (v.cantidadUnidades || v.cantidad || 0); });
  const datosVentas = Object.entries(ventasPorProducto).map(([nombre, cantidad]) => ({ nombre, cantidad })).slice(0, 6);

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text, marginBottom: '2rem' }}>Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ padding: '1.5rem', background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: 'white', border: 'none' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>💰 Vendido Hoy</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{formatearMoneda(totalHoy)}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>{ventasHoy.length} venta(s)</div>
        </Card>
        <Card style={{ padding: '1.5rem', background: theme.secondary, border: `2px solid ${theme.success}` }}>
          <div style={{ fontSize: '0.9rem', color: theme.textLight, marginBottom: '0.5rem' }}>✅ Ganancia Hoy</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.success }}>{formatearMoneda(gananciaHoy)}</div>
        </Card>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}><ChefHat size={24} color={theme.primary} /><h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: theme.text, margin: 0 }}>Recetas</h3></div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.primary }}>{recetas.length}</div>
        </Card>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}><ShoppingBag size={24} color={theme.primary} /><h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: theme.text, margin: 0 }}>Insumos</h3></div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.primary }}>{insumos.length}</div>
          <div style={{ fontSize: '0.85rem', color: insumos.filter(i => i.stock < (i.stockBajo || 10)).length > 0 ? theme.danger : theme.success, marginTop: '0.5rem' }}>
            {insumos.filter(i => i.stock < (i.stockBajo || 10)).length > 0 ? `⚠️ ${insumos.filter(i => i.stock < (i.stockBajo || 10)).length} stock bajo` : '✅ Stock OK'}
          </div>
        </Card>
      </div>

      {ventasRealizadas.length > 0 && datosVentas.length > 0 ? (
        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: theme.text, marginBottom: '1.5rem' }}>📊 Ventas por Producto</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosVentas}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px' }} />
              <Bar dataKey="cantidad" fill={theme.primary} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <BarChart3 size={64} color={theme.textLight} style={{ margin: '0 auto 1.5rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: theme.text, marginBottom: '0.75rem' }}>No hay datos</h3>
          <p style={{ fontSize: '1rem', color: theme.textLight }}>Comienza registrando ventas en "Ventas"</p>
        </Card>
      )}
    </div>
  );
};

// ==================== APP PRINCIPAL ====================
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [insumos, setInsumos] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [packaging, setPackaging] = useState([]);
  const [ventasRealizadas, setVentasRealizadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    try {
      const keys = ['insumos', 'recetas', 'packaging', 'ventasRealizadas'];
      keys.forEach(key => {
        const stored = localStorage.getItem(`esencia-${key}-v3`);
        if (stored) {
          const data = JSON.parse(stored);
          if (key === 'insumos') setInsumos(data);
          else if (key === 'recetas') setRecetas(data);
          else if (key === 'packaging') setPackaging(data);
          else if (key === 'ventasRealizadas') setVentasRealizadas(data);
        }
      });
    } catch (error) { console.log('Iniciando vacío'); }
  }, []);

  useEffect(() => { if (insumos.length >= 0) localStorage.setItem('esencia-insumos-v3', JSON.stringify(insumos)); }, [insumos]);
  useEffect(() => { if (recetas.length >= 0) localStorage.setItem('esencia-recetas-v3', JSON.stringify(recetas)); }, [recetas]);
  useEffect(() => { if (packaging.length >= 0) localStorage.setItem('esencia-packaging-v3', JSON.stringify(packaging)); }, [packaging]);
  useEffect(() => { if (ventasRealizadas.length >= 0) localStorage.setItem('esencia-ventasRealizadas-v3', JSON.stringify(ventasRealizadas)); }, [ventasRealizadas]);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'insumos', name: 'Insumos', icon: ShoppingBag },
    { id: 'packaging', name: 'Packaging', icon: Package },
    { id: 'recetas', name: 'Recetas', icon: ChefHat },
    { id: 'ventas', name: 'Precios', icon: DollarSign },
    { id: 'historial', name: 'Ventas', icon: TrendingUp }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.background }}>
      <header style={{ backgroundColor: theme.card, borderBottom: `2px solid ${theme.border}`, padding: '1.5rem 2rem', boxShadow: '0 2px 8px rgba(90,124,67,0.08)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChefHat size={32} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text, margin: 0 }}>Esencia Nutri PRO</h1>
            <p style={{ color: theme.textLight, margin: 0, fontSize: '0.9rem' }}>Sistema con Stock de Recetas v3.1</p>
          </div>
        </div>
      </header>

      <nav style={{ backgroundColor: theme.card, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '0.5rem', padding: '0 2rem', overflowX: 'auto' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '1rem 1.5rem', border: 'none', background: isActive ? theme.hover : 'transparent', color: isActive ? theme.text : theme.textLight, cursor: 'pointer', fontSize: '0.95rem', fontWeight: isActive ? '600' : '500', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: isActive ? `3px solid ${theme.primary}` : '3px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                <Icon size={18} />{tab.name}
              </button>
            );
          })}
        </div>
      </nav>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {activeTab === 'dashboard' && <DashboardView ventasRealizadas={ventasRealizadas} recetas={recetas} insumos={insumos} />}
        {activeTab === 'insumos' && <InsumosView insumos={insumos} setInsumos={setInsumos} showModal={showModal} setShowModal={setShowModal} editingItem={editingItem} setEditingItem={setEditingItem} />}
        {activeTab === 'packaging' && <PackagingView packaging={packaging} setPackaging={setPackaging} showModal={showModal} setShowModal={setShowModal} editingItem={editingItem} setEditingItem={setEditingItem} />}
        {activeTab === 'recetas' && <RecetasView recetas={recetas} setRecetas={setRecetas} insumos={insumos} setInsumos={setInsumos} showModal={showModal} setShowModal={setShowModal} editingItem={editingItem} setEditingItem={setEditingItem} />}
        {activeTab === 'ventas' && <VentasView recetas={recetas} packaging={packaging} insumos={insumos} />}
        {activeTab === 'historial' && <HistorialView ventasRealizadas={ventasRealizadas} setVentasRealizadas={setVentasRealizadas} recetas={recetas} setRecetas={setRecetas} insumos={insumos} setInsumos={setInsumos} packaging={packaging} setPackaging={setPackaging} />}
      </main>
    </div>
  );
}

