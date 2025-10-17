# 🪙 Flip a Coin

Aplicación web simple y elegante para lanzar una moneda virtual con animación 3D.

## 📋 Descripción

**Flip a Coin** es una aplicación web interactiva que simula el lanzamiento de una moneda con una animación 3D realista. Perfecta para tomar decisiones rápidas, resolver empates o simplemente divertirse viendo girar una moneda virtual.

## ✨ Características

### 🎯 Funcionalidades Principales
- **Lanzamiento de Moneda 3D**: Animación fluida con rotación realista de 1800° (cara) o 1980° (cruz)
- **Múltiples Formas de Interacción**:
  - Clic con el mouse
  - Tecla Enter
  - Tecla Espacio
- **Efecto Hover**: La moneda se agranda sutilmente (5%) y se ilumina al pasar el cursor

### 🌓 Temas
- **Modo Oscuro** (predeterminado): Fondo con gradiente oscuro (#444 → #222)
- **Modo Claro**: Fondo con gradiente claro (#f5f5f5 → #e0e0e0)
- **Detección Automática**: Respeta la preferencia del sistema operativo
- **Persistencia**: Guarda tu preferencia en localStorage
- **Toggle Fácil**: Botón flotante en la esquina superior derecha (☀️/🌙)

### ♿ Accesibilidad
- Navegable completamente por teclado
- Atributos ARIA para lectores de pantalla
- Foco automático en la moneda al cargar
- Sin outline molesto al hacer clic

### 📱 Responsive
- Diseño adaptable a diferentes tamaños de pantalla
- Sin scroll vertical innecesario
- Centrado perfecto en viewport completo

## 🚀 Uso

### Online
Visita: [https://dalileo.com/flip](https://dalileo.com/flip)

### Local
1. Clona el repositorio:
```bash
git clone https://github.com/dalileo/flip-a-coin.git
cd flip-a-coin
```

2. Abre `index.html` en tu navegador favorito

¡Eso es todo! No requiere instalación ni servidor.

## 🎮 Controles

| Acción | Descripción |
|--------|-------------|
| **Clic** | Lanza la moneda |
| **Enter** | Lanza la moneda |
| **Espacio** | Lanza la moneda |
| **Botón ☀️/🌙** | Cambia entre modo claro/oscuro |

## 🛠️ Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: 
  - Variables CSS para temas
  - Flexbox para centrado
  - Animaciones y transiciones 3D
  - Prefijos para compatibilidad con navegadores antiguos
- **JavaScript (jQuery)**: Lógica de interacción y temas
- **LocalStorage**: Persistencia de preferencia de tema

## 📁 Estructura del Proyecto

```
flip-a-coin/
├── css/
│   └── style.css          # Estilos y animaciones
├── img/
│   ├── cara.png           # Imagen de la cara de la moneda
│   ├── cruz.png           # Imagen de la cruz de la moneda
│   └── favicon/           # Iconos del sitio
│       ├── apple-touch-icon.png
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       └── ...
├── index.html             # Archivo principal
└── README.md              # Este archivo
```

## 🎨 Personalización

### Cambiar Colores del Tema

Edita las variables CSS en `css/style.css`:

```css
:root {
  --bg-gradient-start: #444;    /* Color inicial del gradiente oscuro */
  --bg-gradient-end: #222;      /* Color final del gradiente oscuro */
  --text-color: #ffffff;        /* Color del texto */
}

body.light-mode {
  --bg-gradient-start: #f5f5f5; /* Color inicial del gradiente claro */
  --bg-gradient-end: #e0e0e0;   /* Color final del gradiente claro */
  --text-color: #333333;        /* Color del texto en modo claro */
}
```

### Cambiar Imágenes de la Moneda

Reemplaza las imágenes en la carpeta `img/`:
- `cara.png` - Lado frontal de la moneda
- `cruz.png` - Lado posterior de la moneda

**Recomendaciones:**
- Formato: PNG con transparencia
- Tamaño: 300x300px o superior
- Forma: Circular

### Ajustar Velocidad de Animación

En `css/style.css`, modifica la duración:

```css
#moneda.cara {
  animation: flipHeads 3s ease-out forwards; /* Cambia 3s por el tiempo deseado */
}

#moneda.cruz {
  animation: flipTails 3s ease-out forwards; /* Cambia 3s por el tiempo deseado */
}
```

## 🌐 Compatibilidad

- ✅ Chrome / Edge (últimas versiones)
- ✅ Firefox (últimas versiones)
- ✅ Safari (últimas versiones)
- ✅ Opera (últimas versiones)
- ✅ Navegadores móviles modernos

## 📝 Registro de Cambios

### Versión Actual
- ✨ Efecto hover en la moneda
- 🌓 Modo claro/oscuro con detección automática
- ⌨️ Soporte completo para teclado (Enter/Espacio)
- ♿ Mejoras de accesibilidad
- 🐛 Corrección de scroll vertical
- 💾 Persistencia de preferencia de tema

### Versión Original
- 🎲 Lanzamiento básico de moneda
- 🎨 Animación 3D
- 🖱️ Interacción con clic

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar el proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo una licencia abierta para uso educativo y personal.

## 👤 Autor

**Dalileo**
- Website: [dalileo.com](https://dalileo.com)
- GitHub: [@dalileo](https://github.com/dalileo)

## 🙏 Agradecimientos

- Inspirado en el clásico problema de tomar decisiones: "cara o cruz"
- Animaciones CSS basadas en transformaciones 3D modernas
- Iconos de emojis nativos para el toggle de tema

---

**¿Te gustó el proyecto?** ⭐ Dale una estrella en GitHub

**¿Encontraste un bug?** 🐛 [Reporta un issue](https://github.com/dalileo/flip-a-coin/issues)
