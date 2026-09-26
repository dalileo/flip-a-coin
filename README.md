# 🪙 Cara o Cruz

Moneda virtual para decidir rápido: toca la moneda (o pulsa **Espacio**) y sale cara o cruz, con animación 3D, estadísticas e historial.

**Online:** [dalileo.com/flip](https://dalileo.com/flip)

## Características

- **Estética de terminal**: JetBrains Mono, acento naranja `#FB7B24` y nada más; solo la moneda, el resultado con cursor parpadeante y `[espacio]` (también clickeable).
- **Lanzamiento realista**: la moneda sube, gira entre 4 y 6 vueltas y aterriza con un pequeño rebote; la sombra acompaña la altura.
- **Revelado "hypertext"**: el resultado no aparece hasta lanzar; mientras la moneda vuela se muestran caracteres aleatorios que se fijan letra a letra en `CARA` o `CRUZ`.
- **Aleatoriedad justa**: 50/50 con `crypto.getRandomValues`.
- **Stats en una línea**: total, % de cara y cruz, racha actual, récord de racha y lanzamientos de hoy, más los últimos 32 resultados (`●` cara, `○` cruz).
- **Heatmap de actividad**: las últimas 26 semanas, un cuadro por día, con intensidad según cuántas veces lanzaste la moneda ese día.
- **Tema claro/oscuro**: el claro es blanco y grises con el acento; sigue al sistema por defecto y `[claro]`/`[oscuro]` fija una preferencia.
- **Accesibilidad**: la moneda es un `<button>`, el resultado se anuncia al terminar (no durante el efecto), respeta `prefers-reduced-motion`.
- **Sin build**: HTML, CSS y JavaScript planos; la única dependencia externa es la fuente de Google Fonts (con respaldo a la monoespaciada del sistema). Todo se guarda en `localStorage`.

## Controles

| Acción | Resultado |
|---|---|
| Clic / toque en la moneda o en `[espacio]` | Lanza la moneda |
| **Espacio** o **Enter** | Lanza la moneda |
| `[claro]` / `[oscuro]` | Cambia de tema |
| `[reiniciar]` | Borra estadísticas, historial y heatmap (pide confirmación) |

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
js/app.js           Lanzamiento, animación, efecto de revelado, stats, heatmap y tema
img/coin-heads.webp Cara de la moneda
img/coin-tails.webp Cruz de la moneda
img/favicon/        Iconos y manifest
```

## Personalización

- **Colores**: variables al inicio de `css/style.css` (`--bg`, `--accent`, etc.), con bloque separado para modo claro.
- **Tamaño de la moneda**: `--coin-size`.
- **Duración del giro**: `FLIP_MS` en `js/app.js`.
- **Semanas del heatmap**: `HEATMAP_WEEKS` en `js/app.js`.
- **Imágenes**: reemplaza los `.webp` de `img/` por imágenes cuadradas con fondo transparente y la moneda ocupando todo el lienzo.

## Autor

**Dalileo** — [dalileo.com](https://dalileo.com) · [@dalileo](https://github.com/dalileo)
