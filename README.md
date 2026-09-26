# 🪙 Cara o Cruz

Moneda virtual para decidir rápido: toca la moneda (o pulsa **Espacio**) y sale cara o cruz, con animación 3D, estadísticas e historial.

**Online:** [dalileo.com/flip](https://dalileo.com/flip)

## Características

- **Lanzamiento realista**: la moneda sube, gira entre 4 y 6 vueltas y aterriza con un pequeño rebote; la sombra acompaña la altura.
- **Aleatoriedad justa**: 50/50 con `crypto.getRandomValues`.
- **Resultado visible y accesible**: texto grande anunciado a lectores de pantalla (`aria-live`).
- **Estadísticas**: conteo y porcentaje de cara/cruz, racha actual, barra de proporción y los últimos 24 lanzamientos. Se guardan en `localStorage` y se pueden reiniciar.
- **Tema claro/oscuro**: sigue al sistema por defecto; el botón superior fija una preferencia.
- **Accesibilidad**: controles nativos (`<button>`), foco visible, cara y cruz diferenciadas por forma (punto relleno / anillo) y no solo por color, respeta `prefers-reduced-motion`.
- **Sin dependencias ni build**: HTML, CSS y JavaScript planos.

## Controles

| Acción | Resultado |
|---|---|
| Clic / toque en la moneda o en **Lanzar** | Lanza la moneda |
| **Espacio** o **Enter** | Lanza la moneda |
| Botón ☀️/🌙 | Cambia de tema |
| **Reiniciar** | Borra estadísticas e historial |

## Uso local

```bash
git clone https://github.com/dalileo/flip-a-coin.git
cd flip-a-coin
# abre index.html directamente, o sirve la carpeta:
npx http-server .
```

## Estructura

```
index.html          Marcado y aplicación temprana del tema (evita parpadeo)
css/style.css       Tokens de color, layout y estilos
js/app.js           Lanzamiento, animación (Web Animations API), estadísticas y tema
img/coin-heads.webp Cara de la moneda
img/coin-tails.webp Cruz de la moneda
img/favicon/        Iconos y manifest
```

## Personalización

- **Colores**: variables al inicio de `css/style.css` (`--bg`, `--accent`, etc.), con bloque separado para modo claro.
- **Tamaño de la moneda**: `--coin-size`.
- **Duración del giro**: `FLIP_MS` en `js/app.js`.
- **Imágenes**: reemplaza los `.webp` de `img/` por imágenes cuadradas con fondo transparente y la moneda ocupando todo el lienzo.

## Autor

**Dalileo** — [dalileo.com](https://dalileo.com) · [@dalileo](https://github.com/dalileo)
