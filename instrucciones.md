API Users

## Recuperar todos los users
Metodo : GET 
URL : /api/users
Headers : no
Body: no

Response: 
- Array con todos lo users 

## Creación de un users
Metodo : POST
URL : /api/users
Headers : no
Body: nombre, apellidos, direccion, email... 

Response: 
- Array con el users añadido

## Recuperar los datos de un users
Metodo : GET
URL : /api/users/:id
Headers : no
Body: no 

Response: 
- Array con el users seleccionado

## Actualizar datos de un users
Metodo : PUT
URL : /api/users/:id
Headers : no
Body: nombre, apellidos, direccion, email...

Response: 
- Array con el users actualizado