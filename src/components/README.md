# Componentes Reutilizables - Select y Table

## Select Component

Componente select flexible que recibe opciones dinámicamente desde un array de objetos. **Usa ReactivoBehavior** para emitir eventos y rerender automáticamente.

### Características
- ✅ Opciones desde array de objetos
- ✅ Configuración flexible de propiedad a mostrar
- ✅ Valor personalizado o retorna objeto completo
- ✅ **Eventos reactivos con ReactivoBehavior**
- ✅ Métodos para obtener/establecer valores
- ✅ Rerender automático

### Uso Básico

```html
<select-component 
  id="mySelect" 
  placeholder="Selecciona una opción"
></select-component>
```

```javascript
import { SelectComponent } from '/src/components/select/select.js';

const select = document.getElementById('mySelect');

const usuarios = [
  { id: 1, nombre: 'Juan', email: 'juan@email.com' },
  { id: 2, nombre: 'María', email: 'maria@email.com' }
];

// Mostrar 'nombre', usar 'id' como valor
select.setOptions(usuarios, 'nombre', 'id');

// Escuchar cambios (ReactivoBehavior)
select.onChange(({ value, data, displayText }) => {
  console.log('Valor:', value);        // 1 o 2
  console.log('Datos:', data);         // Objeto completo
  console.log('Texto:', displayText);  // 'Juan' o 'María'
});

// O usar el evento tradicional
select.addEventListener('select-change', (e) => {
  console.log('Cambio:', e.detail);
});
```

### API

#### `setOptions(array, displayProp, valueProp)`
Configura las opciones del select.

```javascript
select.setOptions(data, 'nombre', 'id');
// Mostrar 'nombre', usar 'id' como valor
```

#### `onChange(callback)`
**Nuevo**: Suscribirse a cambios usando ReactivoBehavior.

```javascript
const unsubscribe = select.onChange(({ value, data, displayText }) => {
  console.log('Nuevo valor:', value);
});

// Desuscribirse
// unsubscribe();
```

#### `onDataChange(callback)`
**Nuevo**: Suscribirse solo a cambios de datos.

```javascript
select.onDataChange((data) => {
  console.log('Datos actuales:', data);
});
```

#### `getValue()`
Obtiene el valor seleccionado.

```javascript
const valor = select.getValue(); // 1, 2, etc
```

#### `getData()`
Obtiene el objeto completo seleccionado.

```javascript
const datos = select.getData(); // { id: 1, nombre: 'Juan', ... }
```

#### `setValue(value)`
Establece un valor.

```javascript
select.setValue(2); // Selecciona el usuario con id 2
```

#### `reset()`
Resetea al placeholder.

```javascript
select.reset();
```

#### `setDisabled(disabled)`
Habilita o deshabilita.

```javascript
select.setDisabled(true);
select.setDisabled(false);
```

---

## Table Component

Componente tabla reutilizable con paginación, validación por rol y renderizado personalizado. **Usa ReactivoBehavior** para búsqueda reactiva y cambios de página.

### Características
- ✅ Columnas configurables
- ✅ Paginación automática
- ✅ Validación por rol
- ✅ Renderizado personalizado de celdas
- ✅ Ordenamiento
- ✅ **Búsqueda reactiva con ReactivoBehavior**
- ✅ Filtrado dinámico

### Uso Básico

```html
<table-component id="myTable"></table-component>
```

```javascript
import { TableComponent } from '/src/components/table/table.js';

const table = document.getElementById('myTable');

const datos = [
  { id: 1, nombre: 'Juan', estado: 'activo', rol: 'admin' },
  { id: 2, nombre: 'María', estado: 'inactivo', rol: 'user' }
];

table.setConfig({
  columns: [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'nombre', label: 'Nombre' },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (value) => {
        return value === 'activo' 
          ? '<span class="text-green-600">✅ Activo</span>'
          : '<span class="text-red-600">❌ Inactivo</span>';
      }
    }
  ],
  data: datos,
  pageSize: 10,
  role: 'admin',
  rowValidator: (row, role) => {
    // Mostrar solo si el rol es admin o si no es admin
    if (role === 'user') {
      return row.rol !== 'admin';
    }
    return true;
  }
});

table.addEventListener('page-change', (e) => {
  console.log(`Página ${e.detail.page} de ${e.detail.totalPages}`);
});
```

### Configuración de Columnas

```javascript
const columns = [
  {
    key: 'id',                    // Propiedad del objeto
    label: 'ID',                  // Encabezado
    width: '80px',                // Ancho (opcional)
    render: (value, row, column) => {
      // Renderizado personalizado (opcional)
      return `<strong>${value}</strong>`;
    }
  }
];
```

### Búsqueda Reactiva

```javascript
const table = document.getElementById('myTable');
const searchInput = document.getElementById('search');

// Suscribirse a cambios de búsqueda
table.onSearchChange((term) => {
  console.log('Buscando:', term);
});

// Actualizar búsqueda desde input
searchInput.addEventListener('input', (e) => {
  table.setSearch(e.target.value);
});

// O usar directamente
table.setSearch('Juan');

// Obtener término actual
const current = table.getSearchTerm();
```

### Validador de Filas

```javascript
rowValidator: (row, role) => {
  // Retorna true si la fila debe mostrarse
  // Retorna false si debe ocultarse
  
  if (role === 'admin') return true; // Admin ve todo
  
  if (role === 'user') {
    // User solo ve registros activos
    return row.estado === 'activo';
  }
  
  if (role === 'editor') {
    // Editor no ve datos sensibles
    return row.rol !== 'admin';
  }
  
  return true;
}
```

### API

#### `setConfig(config)`
Configura la tabla.

```javascript
table.setConfig({
  columns: [...],
  data: [...],
  pageSize: 10,
  role: 'admin',
  rowValidator: (row, role) => true
});
```

#### `setSearch(term)` 
**Nuevo**: Establece término de búsqueda (ReactivoBehavior).

```javascript
table.setSearch('Juan');
// La tabla se refiltra automáticamente
```

#### `getSearchTerm()`
**Nuevo**: Obtiene el término de búsqueda actual.

```javascript
const term = table.getSearchTerm();
```

#### `onSearchChange(callback)`
**Nuevo**: Suscribirse a cambios de búsqueda.

```javascript
table.onSearchChange((term) => {
  console.log('Nueva búsqueda:', term);
  // Actualizar UI, analytics, etc.
});
```

#### `updateData(newData)`
Actualiza solo los datos.

```javascript
table.updateData(nuevosDatos);
```

#### `setRole(role)`
Cambia el rol y refiltra.

```javascript
table.setRole('user');
```

#### `setRowValidator(validator)`
Actualiza la función de validación.

```javascript
table.setRowValidator((row, role) => {
  return row.visible && row.role !== 'admin';
});
```

#### `sortBy(key, ascending)`
Ordena por una columna.

```javascript
table.sortBy('nombre', true);   // A-Z
table.sortBy('nombre', false);  // Z-A
```

#### `goToPage(pageNumber)`
Navega a una página específica.

```javascript
table.goToPage(2);
```

#### `getCurrentPageData()`
Obtiene datos de la página actual.

```javascript
const pageData = table.getCurrentPageData();
```

#### `getTotalPages()`
Obtiene el total de páginas.

```javascript
const totalPages = table.getTotalPages();
```

#### `getTotalRows()`
Obtiene el total de filas filtradas.

```javascript
const totalRows = table.getTotalRows();
```

---

## Demo en Vivo

Visite la ruta `/users` en la aplicación para ver una demo completa con:
- ✅ Select para filtrar por rol
- ✅ Input para búsqueda en tiempo real
- ✅ Tabla con paginación
- ✅ Renderizado personalizado por columna
- ✅ Reactividad automática
- ✅ 8 usuarios de ejemplo

### Características de la Demo

1. **Select de Roles**: Filtra usuarios por rol (Administrador, Editor, Usuario)
2. **Búsqueda en Tiempo Real**: Busca en nombre, email y rol simultáneamente
3. **Renderizado Personalizado**:
   - IDs con estilos de fuente monoespacial
   - Emails como enlaces clickeables
   - Roles con badges de color
   - Estados con emojis e indicadores de color
4. **Paginación**: Muestra 5 usuarios por página
5. **Información Dinámica**: Actualiza el contador de resultados en tiempo real

---

## Importar en otros componentes

```javascript
// Agregar a sharedComponents.js
import '/src/components/select/select.js';
import '/src/components/table/table.js';
```

O importar directamente en tu componente:

```javascript
import { SelectComponent } from '/src/components/select/select.js';
import { TableComponent } from '/src/components/table/table.js';
```

---

## Notas Técnicas

### ReactivoBehavior
- Los componentes usan **ReactivoBehavior** internamente para notificar cambios
- Métodos como `onChange()` y `onSearchChange()` permiten suscripción a cambios
- Los cambios se propagan automáticamente sin necesidad de re-render manual

### Búsqueda
- La tabla busca en TODAS las columnas configuradas
- La búsqueda es **case-insensitive**
- Se ejecuta después del filtrado por rol

### Paginación
- La paginación se resetea cuando se aplica una búsqueda
- El número de páginas se recalcula automáticamente

### Styling
- Los componentes usan **Tailwind CSS** para estilos
- Soportan modo **dark** automáticamente
- Completamente personalizables con clases CSS

### Performance
- El filtrado es eficiente
- La búsqueda solo se aplica cuando cambia el término
- Las suscripciones se pueden desuscribir para evitar memory leaks
