# DevTracker — Resumen del proyecto

## Qué es
Un tracker de postulaciones a empleo (CRUD) construido para aprender el flujo completo React + Flask de punta a punta y para gestionar de verdad una búsqueda laboral real. También sirve como pieza de portfolio para entrevistas.

## Stack
- **Front-end:** React + Vite, Bootstrap (solo utilidades CSS — sin Bootstrap JS)
- **Back-end:** Flask, Flask-Blueprints, Flask-JWT-Extended
- **ORM/DB:** SQLAlchemy + PostgreSQL
- **Auth:** JWT (hash de contraseñas con bcrypt)
- **Gestor de paquetes:** Pipenv

## Modelo de datos
- **User** `1 — N` **Application** `1 — N` **StatusHistory**
- `User`: email + hash bcrypt de contraseña. Al borrarse, borra en cascada sus applications.
- `Application`: company, role_title, job_url, source, salary (String), location_type, posted_date, next_action_date, notes, `current_status` (desnormalizado).
- `StatusHistory`: log append-only de cada cambio de estado (`status`, `changed_at`, `notes` opcional) asociado a una application.

**Por qué un event log en vez de un campo de estado plano:** una sola columna `current_status` solo puede responder "en qué etapa está esto ahora mismo". Un event log responde "cuánto duró en cada etapa" y "cuándo cambió" — justo el dato que necesitaría un dashboard o un gráfico de "tiempo por etapa" más adelante, y cuesta una tabla extra ahora en vez de una migración + backfill después. `current_status` se mantiene igual en `Application` como optimización de lectura desnormalizada para que las vistas de lista no necesiten un join; toda escritura sobre ese campo pasa por el mismo código que también agrega una fila a `StatusHistory` (`add_status` en `applications.py:147-169`), así que los dos nunca quedan desincronizados.

**Por qué `salary` es un String y no un número:** las publicaciones de empleo reales escriben el salario como rangos, monedas mixtas o "a convenir" — no hay un numérico limpio al que normalizar sin un parseo con pérdida de información. Guardarlo como texto libre evita inventar un esquema para datos que no están estructurados en el origen.

**Por qué existe `constants.py`:** `STATUSES`, `SOURCES`, `LOCATION_TYPES` son enums compartidos que referencian tanto `Application` como `StatusHistory`. Importar un modelo desde el otro para llegar a una constante crearía un import circular; un módulo compartido no.

## Endpoints de la API
| Método | Path | Propósito |
|---|---|---|
| POST | `/api/auth/register` | Crea usuario, devuelve JWT |
| POST | `/api/auth/login` | Verifica credenciales, devuelve JWT |
| PUT | `/api/auth/profile` | Actualiza email y/o contraseña (re-verifica la contraseña actual) |
| GET | `/api/applications/` | Lista las applications del usuario actual, filtro opcional `?status=` |
| POST | `/api/applications/` | Crea application (auto-genera la primera fila de `StatusHistory`) |
| GET | `/api/applications/<id>` | Obtiene una application |
| PUT | `/api/applications/<id>` | Actualización parcial |
| DELETE | `/api/applications/<id>` | Borra (en cascada borra su historial) |
| POST | `/api/applications/<id>/status` | Agrega un cambio de estado + sincroniza `current_status` |
| GET | `/api/applications/<id>/history` | Línea de tiempo completa de estados de una application |

Todas las rutas de applications filtran las queries por `user_id` extraído del JWT — un usuario nunca puede leer ni modificar los datos de otro.

## Decisiones técnicas y su trade-off
| Decisión | Alternativa considerada | Por qué ganó esta |
|---|---|---|
| Estado como event log (tabla `StatusHistory`) | Solo una columna plana `status` | Se necesitaba historial/timeline; un campo plano no puede responder "cuándo cambió" |
| `current_status` desnormalizado en `Application` | Calcularlo desde la última fila de `StatusHistory` en cada lectura | Evita un join/subquery en cada vista de lista; la consistencia se garantiza enrutando toda escritura por un solo endpoint |
| `salary` como String | Columna numérica (`Integer`/`Range`) | Los datos de origen (publicaciones de empleo) no son números limpios; parsear sería frágil y con pérdida de datos |
| Bootstrap solo CSS, sin Bootstrap JS | Bootstrap completo (incl. JS) | Bootstrap JS muta el DOM directamente, lo que choca con el DOM virtual de React — toda la interactividad se mantuvo en el estado de React |
| `constants.py` para enums compartidos | Definir `STATUSES` dentro del modelo `Application` e importarlo en `StatusHistory` | El import cruzado entre modelos crearía un import circular |

## Cómo explicarlo en 60 segundos
"DevTracker es un tracker de postulaciones a empleo que construí con front-end en React y back-end en Flask/PostgreSQL, con auth por JWT. La decisión de diseño más interesante es cómo trackeo el estado: en vez de una sola columna de status que solo dice dónde está la application *ahora*, registro cada cambio de estado como una fila propia en una tabla `status_history`, con timestamp. Eso me da una línea de tiempo real por application — cuándo pasó de Applied a Interview, cuánto tiempo estuvo en cada etapa — y a la vez mantengo un campo `current_status` desnormalizado en la application para que las vistas de lista no necesiten un join. Cada actualización de estado pasa por un solo endpoint que escribe ambos, así que no pueden desincronizarse. Es una app CRUD pequeña, pero está construida de la forma en que una app en producción trackearía cambios de estado en el tiempo, no solo el estado actual."

## Preguntas típicas de entrevista + respuesta corta
**P: ¿Por qué no usar simplemente una columna `status` y actualizarla in-place?**
R: Porque ahí pierdes el historial — no puedes responder "cuánto tiempo estuvo en Screening" ni mostrar una línea de tiempo. El event log cuesta una tabla extra pero da un audit trail gratis.

**P: ¿No es arriesgado guardar `current_status` en dos lugares (desnormalizado + derivable del historial)?**
R: Sí, ese es el trade-off de desnormalizar — lo mitigo teniendo un solo código (`add_status`) que escribe tanto el campo `current_status` de `Application` como la tabla `StatusHistory`, así que no hay forma de actualizar uno sin el otro.

**P: ¿Por qué salary es un string en vez de un número?**
R: Los salarios reales en publicaciones no son números limpios — rangos, "a convenir", distintas monedas. Forzarlos a una columna Integer implicaría un parseo con pérdida de datos al escribir, sin beneficio real de query a esta escala.

**P: ¿Por qué evitar el JavaScript de Bootstrap?**
R: El JS de Bootstrap alterna clases y estilos inline directamente sobre el DOM (por ejemplo, para modales o dropdowns). React espera controlar el DOM mediante su diffing de DOM virtual — que ambos compitan por los mismos nodos desincroniza el estado. Usar Bootstrap solo para CSS y manejar toda la lógica de mostrar/ocultar en el estado de React evita eso.

**P: ¿Cómo se aísla la data por usuario?**
R: Cada ruta de applications filtra por `user_id` extraído de la identidad del JWT, no del body/params del request — así un usuario nunca puede acceder o modificar las applications de otro adivinando un ID.

---
*Chequeo de drift: nada de la sección "Key decisions" de `CLAUDE.md` quedó sin reflejar en el código — status_history, constants.py, salary-as-String y la decisión de Bootstrap solo-CSS coinciden con lo implementado realmente.*
