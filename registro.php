<?php
// Datos del servidor
$user = "root";
$pass = "";
$host = "localhost";
$datab = "nextstep";

// Conectamos a la base de datos
$connection = mysqli_connect($host, $user, $pass, $datab);

// Verificamos la conexión
if(!$connection) {
    echo "<script>
            alert('Error: No se ha podido conectar con la base de datos.');
            window.history.back();
          </script>";
    exit; // Detiene la ejecución si hay error
}

// Capturamos los datos del formulario
$nombre = isset($_POST["nombre"]) ? $_POST["nombre"] : '';
$correo = isset($_POST["correo"]) ? $_POST["correo"] : '';
$calificacion = isset($_POST["calificacion"]) ? $_POST["calificacion"] : 0;
$comentarios = isset($_POST["comentarios"]) ? $_POST["comentarios"] : '';

// Verificamos que los campos obligatorios no estén vacíos antes de insertar
if ($nombre != "" && $correo != "") {
    
    $instruccion_SQL = "INSERT INTO encuesta (nombre, correo, calificacion, comentario)
                        VALUES ('$nombre', '$correo', '$calificacion', '$comentarios')";
                           
    if(mysqli_query($connection, $instruccion_SQL)){
        // MENSAJE EMERGENTE DE ÉXITO Y REDIRECCIÓN AUTOMÁTICA
        echo "<script>
                alert('Tus datos han sido enviados con éxito. ¡Gracias por tu opinión!');
                window.location.href = 'index.html';
              </script>";
    } else {
        // MENSAJE EMERGENTE DE ERROR EN LA BASE DE DATOS
        echo "<script>
                alert('Hubo un error al guardar los datos en la base de datos.');
                window.history.back();
              </script>";
    }
} else {
    // Si entran directamente al archivo sin datos, los devuelve a contacto
    echo "<script>window.location.href = 'index.html';</script>";
}

// Cerramos la conexión
mysqli_close($connection);
?>