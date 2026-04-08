# ✅ Componentes Refactorizados: Select y Table con ReactivoBehavior

## 📝 Resumen de Cambios

Se han refactorizado los componentes **Select** y **Table** para usar **ReactivoBehavior**, permitiendo reactividad completa similar a Angular/Vue. Además, se ha centralizado la configuración del sidebar y se ha creado una vista demo en `/users`.

---

## 🔄 Cambios en Select Component

### Antes
```javascript
selectElem.addEventListener('select-change', (e) => {
  console.log('Valor:', e.detail.value);
});
```

### Ahora (Con ReactivoBehavior)
```javascript
// Forma 1: Usar ReactivoBehavior directamente
selectElem.onChange(({ value, data, displayText }) => {
  console.log('Valor:', value);
});

// Forma 2: Suscribirse a datos
selectElem.onDataChange((data) => {
  console.log('Datos:', data);
});

// Forma 3: Escuchar eventos tradicionales (también funciona)
selectElem.addEventListener('select-change', (e) => {
  console.log('Valor:', e.detail.value);
});
```

### Nuevas Propiedades
- `selectedValue$` - ReactivoBehavior del valor seleccionado
- `selectedData$` - ReactivoBehavior de los datos seleccionados

### Nuevos Métodos
- `onChange(callback)` - Suscribirse a cambios de valor
- `onDataChange(callback)` - Suscribirse a cambios de datos

---

## 🔄 Cambios en Table Component

### Nuevas Funcionalidades
- **Búsqueda Reactiva**: Busca en tiempo real usando ReactivoBehavior
- **Filtrado Automático**: Se refiltra al cambiar búsqueda o rol

### Nuevas Propiedades
- `searchTerm$` - ReactivoBehavior del término de búsqueda
- `currentPage$` - ReactivoBehavior de la página actual

### Nuevos Métodos
```javascript
// Establecer búsqueda
table.setSearch('Juan');

// Obtener término actual
const term = table.getSearchTerm();

// Escuchar cambios de búsqueda
table.onSearchChange((term) => {
  console.log('Buscando:', term);
});
```

### Búsqueda
- Busca en **todas las columnas** configuradas
- **Case-insensitive**
- Se ejecuta **después** del filtrado por rol
- Resetea a página 1 cuando cambia

---

## 📍 Cambios en la Estructura del Proyecto

### 1. Sidebar Centralizado
**Antes**: Cada vista (home.js, users.js) configuraba el sidebar

**Ahora**: El sidebar se configura una única vez en `sidebar.js`

```javascript
// sidebar.js - connectedCallback
initializeSidebarOptions() {
  sidebarService.setOptions([
    { label: 'Home', route: '/home', iconClass: 'fa-solid fa-house' },
    { label: 'Usuarios', route: '/users', iconClass: 'fa-solid fa-users' },
    { label: 'Configuración', route: '/settings', iconClass: 'fa-solid fa-gear' },
    { label: 'Reportes', route: '/reports', iconClass: 'fa-solid fa-chart-bar' }
  ]);
}
```

**Beneficios**:
- ✅ Una única fuente de verdad
- ✅ No se duplica configuración
- ✅ Fácil de mantener
- ✅ Todas las vistas tienen el mismo sidebar

---

## 🎯 Vista Demo: `/users`

Nueva ruta privada que demuestra el uso de ambos componentes con reactividad.

### Funcionalidades
1. **Select de Roles** - Filtra usuarios por rol
2. **Input de Búsqueda** - Busca en nombre, email y rol
3. **Tabla Reactiva** - Se actualiza automáticamente
4. **Paginación** - 5 usuarios por página
5. **Renderizado Personalizado** - Badges, emojis, links

### Componentes Utilizados
```html
<select-component id="roleFilter"></select-component>
<input-component id="searchInput"></input-component>
<table-component id="usersTable"></table-component>
```

### Datos de Ejemplo
8 usuarios con diferentes roles (admin, editor, usuario) y estados (activo, inactivo)

---

## 📁 Archivos Modificados

### Componentes
- ✅ `src/components/select/select.js` - Agregado ReactivoBehavior
- ✅ `src/components/table/table.js` - Búsqueda reactiva con ReactivoBehavior

### Vistas
- ✅ `src/views/private/home/home.js` - Removida configuración de sidebar
- ✅ `src/views/private/users/users.js` - **NUEVO** - Vista demo
- ✅ `src/views/private/users/users.html` - **NUEVO** - Template

### Configuración
- ✅ `src/router/config.js` - Agregada ruta `/users`
- ✅ `src/layout/app-layout/sidebar/sidebar.js` - Centralizada inicialización

### Documentación
- ✅ `src/components/README.md` - Actualizado con nuevos métodos

---

## 🚀 Cómo Usar la Demo

1. **Iniciar sesión** en la aplicación
2. **Navegar a `/users`** desde el sidebar
3. **Probar**:
   - Seleccionar un rol en el select → la tabla se filtra
   - Escribir en el input de búsqueda → la tabla busca en tiempo real
   - Cambiar de página → la tabla rerendieza
   - Combinar filtros → ambos funcionan juntos

---

## 💡 Ejemplo de Código

```javascript
// En users.js
setupComponents() {
  const roleFilter = this.querySelector('#roleFilter');
  const searchInput = this.querySelector('#searchInput');
  const usersTable = this.querySelector('#usersTable');

  // Configurar select
  roleFilter.setOptions(this.roles, 'nombre', 'id');

  // Configurar tabla
  usersTable.setConfig({ columns: [...], data: [...] });

  // Escuchar cambios del select
  roleFilter.addEventListener('select-change', (e) => {
    usersTable.setRole(e.detail.value);
  });

  // Escuchar cambios de búsqueda (input-component)
  searchInput.value$.subscribe((term) => {
    usersTable.setSearch(term);
  });

  // Reaccionar a cambios en la tabla
  usersTable.onSearchChange((term) => {
    this.updateFilterInfo(usersTable, term);
  });
}
```

---

## ✨ Beneficios

### Para Developers
- ✅ Reactividad automática (sin necesidad de actualizar DOM manualmente)
- ✅ Código más limpio y declarativo
- ✅ Menos listeners, más funcionalidad
- ✅ Reutilizable en otros proyectos

### Para Users
- ✅ Búsqueda en tiempo real
- ✅ Filtros que funcionan juntos
- ✅ Interfaz responsiva
- ✅ Información actualizada instantáneamente

---

## 🔗 Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/home` | home-component | Página de inicio |
| `/users` | users-component | Demo de Select y Table |
| `/settings` | - | Por implementar |
| `/reports` | - | Por implementar |

---

## 📚 Documentación

Consulta `src/components/README.md` para:
- API completa de cada componente
- Ejemplos de uso
- Configuración avanzada
- Notas técnicas

---

## ✅ Checklist de Verificación

- [x] Select component con ReactivoBehavior
- [x] Table component con búsqueda reactiva
- [x] Input component integrado en usuarios
- [x] Sidebar centralizado
- [x] Ruta `/users` creada
- [x] Vista demo funcional
- [x] Documentación actualizada
- [x] Componentes sin duplicación

---

**Próximos Pasos**:
1. Implementar `/settings`
2. Implementar `/reports`
3. Agregar más validadores por rol
4. Crear más vistas de ejemplo
