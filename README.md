# 🎯 Buscaminas - Juego Web

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Try it](https://img.shields.io/badge/Try%20it-Online-brightgreen?style=for-the-badge)

🎮 Versión web del clásico **Buscaminas**, desarrollada con **JavaScript, HTML y CSS**, usando **clases y módulos** para mantener la lógica y la interfaz separadas.

<a target="_blank" href="https://macauy.github.io/buscaminas/" >Probar Juego</a> 🚀

---

## 🚀 Descripción

- Descubre todas las celdas que **no contienen minas**.
- Marca las minas con **banderas** y signos de **pregunta**.
- Temporizador y contador de minas pendientes.
- Mensajes visuales al **ganar 😎 o perder 😵**.
- El tablero se bloquea automáticamente al finalizar la partida.

---

## 🏗 Arquitectura y resolución

El código está organizado en **clases y módulos**:

- **Buscaminas.js** → Lógica del juego:

  - Genera el tablero y distribuye minas.
  - Calcula números alrededor de minas.
  - Gestiona descubrimiento de celdas y marcación de minas.
  - Detecta **game over** y victoria.

- **VistaBuscaminas.js** → Interfaz y eventos:

  - Crea y actualiza el DOM del tablero.
  - Maneja clicks izquierdo/derecho a nivel de tablero.
  - Actualiza timer, minas pendientes y mensajes.
  - Bloquea el tablero al finalizar el juego.
  - Permite reiniciar la partida con botón reset.

- **main.js** → Inicializa la vista y conecta con la lógica del juego.

**Cómo funciona:**

1. Se crea un objeto `Buscaminas` con filas, columnas y número de minas.
2. `VistaBuscaminas` renderiza el tablero y captura eventos de usuario.
3. Los clicks descubren celdas, clic derecho marca con bandera o signo de pregunta.
4. Al ganar o perder, se bloquea el tablero y se actualiza el botón de reset.

---

## 🛠 Tecnologías

- JavaScript ES6+ (clases y módulos)
- HTML5
- CSS3

---

## 📌 Notas

- Todos los listeners se gestionan a nivel de tablero para eficiencia.
- El juego detiene el timer y bloquea interacciones al finalizar (victoria o derrota).
- Reiniciar la partida se hace con el botón reset.

---

**¡Disfruta del juego!** 🎮
