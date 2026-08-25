# Calculadora AWS — Versión Básica (sin base de datos)

Calculadora web de cuatro operaciones (suma, resta, multiplicación, división),
construida con **Node.js + Express** en el backend y **HTML/CSS/JS** en el
frontend. Pensada para desplegarse en una instancia **EC2 (Ubuntu)** detrás de
**Nginx** como proxy inverso, cumpliendo la Parte 2 del Trabajo Práctico de
Cloud Computing.

## 1. Estructura del proyecto

```
calculadora-aws-basica/
├── server.js            # Punto de entrada (Express)
├── package.json
├── .env.example          # Variables de entorno (copiar a .env)
├── routes/
│   └── api.js             # Endpoint POST /api/calcular
└── public/
    ├── index.html          # Interfaz de la calculadora
    ├── style.css
    └── script.js           # Llama a la API vía fetch
```

## 2. Ejecutar en local

```bash
cp .env.example .env
npm install
npm start
# abrir http://localhost:3000
```

## 3. Despliegue en AWS EC2

### 3.1 Lanzar la instancia
1. AWS Console → **EC2** → *Launch instance*.
2. AMI: **Ubuntu Server 22.04 LTS** (Free Tier eligible).
3. Tipo de instancia: **t2.micro**.
4. Crear/seleccionar un **key pair** (.pem) para SSH.
5. Grupo de seguridad: permitir puertos **22 (SSH)**, **80 (HTTP)** y opcionalmente **443 (HTTPS)**.
6. Lanzar la instancia y anotar la **IP pública**.

### 3.2 Conectarse por SSH
```bash
chmod 400 mi-clave.pem
ssh -i mi-clave.pem ubuntu@<IP_PUBLICA>
```

### 3.3 Instalar Node.js, npm y PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
sudo npm install -g pm2
```

### 3.4 Instalar y configurar Nginx (proxy inverso)
```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
```

Crear `/etc/nginx/sites-available/calculadora`:
```nginx
server {
    listen 80;
    server_name <IP_PUBLICA>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilitar el sitio:
```bash
sudo ln -s /etc/nginx/sites-available/calculadora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3.5 Subir el código
Opción A — clonar desde GitHub (recomendado para el entregable):
```bash
git clone https://github.com/<tu-usuario>/calculadora-aws.git
cd calculadora-aws/calculadora-aws-basica
```

Opción B — subir este ZIP directamente con `scp`:
```bash
scp -i mi-clave.pem calculadora-aws-basica.zip ubuntu@<IP_PUBLICA>:~/
ssh -i mi-clave.pem ubuntu@<IP_PUBLICA>
unzip calculadora-aws-basica.zip
cd calculadora-aws-basica
```

### 3.6 Instalar dependencias y ejecutar con PM2
```bash
cp .env.example .env
npm install
pm2 start server.js --name calculadora
pm2 save
pm2 startup      # seguir la instrucción que imprime (ejecutar el comando con sudo)
```

### 3.7 Probar
Abrir en el navegador: `http://<IP_PUBLICA>/`
Verificar salud de la API: `http://<IP_PUBLICA>/api/health`

## 4. (Opcional) Estáticos en S3
Si quieres cumplir también el punto de S3 sin usar la versión con DB:
1. Crear un bucket S3 con nombre único.
2. Subir una imagen (por ejemplo, un logo) al bucket.
3. Desactivar "Block public access" solo para este ejercicio y añadir una
   bucket policy pública de lectura.
4. Referenciar la imagen en `public/index.html`:
   ```html
   <img src="https://<tu-bucket>.s3.<region>.amazonaws.com/logo.png" alt="Logo">
   ```

## 5. Cómo armar el diagrama de arquitectura en draw.io

El informe PDF pide un **diagrama de arquitectura AWS**. Para esta versión
básica es muy simple; sigue estos pasos en [app.diagrams.net](https://app.diagrams.net):

1. Crea un diagrama en blanco → busca la librería **AWS19** en el panel
   izquierdo (`More Shapes... → Networking → AWS19` o similar según tu versión).
2. Arrastra los siguientes íconos y ordénalos de izquierda a derecha:
   - **User / Cliente** (ícono de persona o navegador).
   - **Internet** (nube genérica).
   - **Amazon EC2** (instancia Ubuntu).
   - Dentro del rectángulo de EC2, agrega dos cajas internas: **Nginx** (proxy inverso, puerto 80) y **Node.js/Express** (puerto 3000).
   - (Opcional) **Amazon S3** conectado a EC2 si sirves imágenes desde el bucket.
3. Conecta las flechas: `Usuario → Internet → Nginx (EC2) → Node.js (EC2)`.
4. Etiqueta cada flecha con el puerto (80 → 3000).
5. Exporta como PNG o incluye el `.drawio` en el repositorio y pega la imagen
   en el informe PDF.

## 6. Checklist para el entregable
- [ ] Código en GitHub.
- [ ] Aplicación corriendo en `http://<IP_PUBLICA>/`.
- [ ] Captura de pantalla de la calculadora funcionando.
- [ ] Captura de la consola EC2 (instancia activa) y del Security Group.
- [ ] Diagrama de arquitectura (ver sección 5).
- [ ] Sección de costos: EC2 t2.micro = **$0.00** dentro de Free Tier (750 h/mes).
- [ ] Lecciones aprendidas (ver plantilla sugerida en el TP).

## 7. Notas
- Esta versión **no usa base de datos**; el historial de operaciones no se
  guarda. Para eso, usar la versión `calculadora-aws-completa`.
- Recuerda no subir el archivo `.env` a GitHub (ya está en `.gitignore`).
