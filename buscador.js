// ============================================
// BUSCADOR NEXTSTEP
// Busca dentro de todas las páginas
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.querySelector(".buscador");
  const input = document.querySelector("#busqueda");

  if (!formulario || !input) {
    return;
  }

  // Páginas que forman parte de NextStep
  const paginas = [
    "index.html",
    "becas.html",
    "universidades.html",
    "cursos.html",
    "orientacion.html",
    "contacto.html"
  ];

  // Comprobar si venimos de una búsqueda
  const parametros = new URLSearchParams(window.location.search);
  const palabraBuscada = parametros.get("buscar");

  if (palabraBuscada) {
    input.value = palabraBuscada;
    resaltarPalabra(palabraBuscada);
  }

  // Realizar búsqueda
  formulario.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const palabra = input.value.trim();

    if (!palabra) {
      return;
    }

    await buscarEnPaginas(palabra);

  });

});


// ============================================
// BUSCAR EN TODAS LAS PÁGINAS
// ============================================

async function buscarEnPaginas(palabra) {

  const palabraNormalizada = normalizar(palabra);

  // Página actual
  const paginaActual =
    window.location.pathname.split("/").pop() || "index.html";

  // Buscar primero en la página actual
  const paginasOrdenadas = [
    paginaActual,
    "index.html",
    "becas.html",
    "universidades.html",
    "cursos.html",
    "orientacion.html",
    "contacto.html"
  ];

  // Eliminar páginas repetidas
  const paginasUnicas = [...new Set(paginasOrdenadas)];

  for (const pagina of paginasUnicas) {

    try {

      const respuesta = await fetch(pagina);

      if (!respuesta.ok) {
        continue;
      }

      const html = await respuesta.text();

      // Convertir HTML en documento
      const documento =
        new DOMParser().parseFromString(
          html,
          "text/html"
        );

      // Obtener únicamente el texto visible
      const texto =
        normalizar(documento.body.innerText);

      // Comprobar si contiene la búsqueda
      if (texto.includes(palabraNormalizada)) {

        // Si ya estamos en esa página,
        // simplemente resaltamos la palabra
        if (pagina === paginaActual) {

          const nuevaURL =
            pagina +
            "?buscar=" +
            encodeURIComponent(palabra);

          window.location.href = nuevaURL;

          return;
        }

        // Si está en otra página,
        // ir allí con la búsqueda
        window.location.href =
          pagina +
          "?buscar=" +
          encodeURIComponent(palabra);

        return;
      }

    } catch (error) {

      console.error(
        "No se pudo revisar:",
        pagina,
        error
      );

    }

  }

  // No se encontró
  alert(
    'No encontramos resultados para "' +
    palabra +
    '".'
  );

}


// ============================================
// NORMALIZAR TEXTO
// Permite encontrar:
// "orientacion" = "orientación"
// "tecnologia" = "tecnología"
// ============================================

function normalizar(texto) {

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}


// ============================================
// RESALTAR PALABRA
// ============================================

function resaltarPalabra(palabra) {

  if (!palabra) {
    return;
  }

  const contenido = document.body;

  const elementosExcluidos = [
    "SCRIPT",
    "STYLE",
    "INPUT",
    "TEXTAREA",
    "BUTTON",
    "SELECT",
    "OPTION"
  ];

  const expresion = new RegExp(
    `(${escaparRegExp(palabra)})`,
    "gi"
  );

  const nodos = obtenerNodosTexto(contenido);

  nodos.forEach((nodo) => {

    const textoOriginal = nodo.nodeValue;

    if (!textoOriginal.trim()) {
      return;
    }

    const fragmento =
      document.createDocumentFragment();

    let ultimaPosicion = 0;
    let coincidencia;

    expresion.lastIndex = 0;

    while (
      (coincidencia =
        expresion.exec(textoOriginal)) !== null
    ) {

      fragmento.appendChild(
        document.createTextNode(
          textoOriginal.slice(
            ultimaPosicion,
            coincidencia.index
          )
        )
      );

      const resaltado =
        document.createElement("mark");

      resaltado.textContent =
        coincidencia[0];

      fragmento.appendChild(resaltado);

      ultimaPosicion =
        coincidencia.index +
        coincidencia[0].length;

    }

    if (ultimaPosicion === 0) {
      return;
    }

    fragmento.appendChild(
      document.createTextNode(
        textoOriginal.slice(ultimaPosicion)
      )
    );

    nodo.parentNode.replaceChild(
      fragmento,
      nodo
    );

  });

}


// ============================================
// OBTENER NODOS DE TEXTO
// ============================================

function obtenerNodosTexto(elemento) {

  const nodos = [];

  const elementosExcluidos = [
    "SCRIPT",
    "STYLE",
    "INPUT",
    "TEXTAREA",
    "BUTTON",
    "SELECT",
    "OPTION"
  ];

  const recorrido =
    document.createTreeWalker(
      elemento,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (nodo) => {

          if (
            nodo.parentNode &&
            elementosExcluidos.includes(
              nodo.parentNode.tagName
            )
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          if (
            nodo.parentNode &&
            nodo.parentNode.closest("mark")
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

  let nodoActual;

  while (
    (nodoActual = recorrido.nextNode())
  ) {

    nodos.push(nodoActual);

  }

  return nodos;

}


// ============================================
// ESCAPAR CARACTERES ESPECIALES
// ============================================

function escaparRegExp(texto) {

  return texto.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

}
