# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json (para que npm instale las dependencias) 
COPY package.json ./

# Instala axios
RUN npm install axios

# Copia el script main.js y el archivo JSON al contenedor
COPY main.js ./
COPY config.json ./

# Expone el puerto si tu aplicación lo necesita (opcional)
# EXPOSE 3000

# Define el comando de entrada para ejecutar main.js
CMD ["node", "main.js"]
