-- 1. Insertar Usuario 'admin'
-- Password: admin
-- Hash generado con BCrypt 10 rounds
INSERT INTO users (id, username, password, role)
VALUES (
           gen_random_uuid(),
           'admin',
           '$2a$10$gqHrslMttQWSsDSVRTK1OehkkBiXsJ/a4z2HU.akoarFlL.A/5cWi',
           'ADMIN'
       )
    ON CONFLICT (username) DO NOTHING;

-- 2. Insertar Usuario 'user'
-- Password: 12345
-- Hash generado con BCrypt 10 rounds
INSERT INTO users (id, username, password, role)
VALUES (
           gen_random_uuid(),
           'user',
           '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6',
           'USER'
       )
    ON CONFLICT (username) DO NOTHING;

-- 3. Insertar Solicitudes de Prueba
INSERT INTO requests (id, title, description, requester_name, approver_name, type, status, created_at)
VALUES (
           gen_random_uuid(),
           'Acceso a AWS Producción',
           'Necesito acceso temporal para revisar logs de EC2 debido a una incidencia crítica.',
           'Juan Perez',
           'Maria Jefe',
           'ACCESO',
           'PENDING',
           NOW()
       );

INSERT INTO requests (id, title, description, requester_name, approver_name, type, status, created_at)
VALUES (
           gen_random_uuid(),
           'Despliegue Microservicio Pagos',
           'Versión 2.1.0 con hotfix de seguridad.',
           'Carlos Dev',
           'Pedro DevOps',
           'DESPLIEGUE',
           'APPROVED',
           NOW() - INTERVAL '1 DAY'
       );