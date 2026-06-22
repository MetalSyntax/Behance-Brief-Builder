#!/bin/bash

# Estilos de color para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${BLUE}=== Iniciando pipeline local (CI/CD) para BeBrief Studio ===${NC}"

# 1. Compilar Frontend
echo -e "${YELLOW}[1/3] Compilando frontend web...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error: La build del frontend falló. Despliegue cancelado.${NC}"
  exit 1
fi

# 2. Compilar aplicación con Tauri (Frontend + Rust)
echo -e "${YELLOW}[2/3] Compilando binario nativo con Tauri...${NC}"
npm run tauri build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error: La compilación de Tauri falló.${NC}"
  exit 1
fi

# Rutas de origen y destino
APP_SOURCE="src-tauri/target/release/bundle/macos/BeBrief Studio.app"
APP_DEST="/Applications/BeBrief Studio.app"

# 3. Copiar e Instalar en la carpeta de Aplicaciones
echo -e "${YELLOW}[3/3] Instalando versión actualizada en /Applications...${NC}"

if [ -d "$APP_SOURCE" ]; then
  # Eliminar versión antigua si existe
  if [ -d "$APP_DEST" ]; then
    echo -e "${BLUE}🔄 Eliminando versión anterior en /Applications...${NC}"
    rm -rf "$APP_DEST"
  fi
  
  # Copiar la nueva compilación
  cp -R "$APP_SOURCE" "$APP_DEST"
  
  echo -e "${GREEN}✨ ¡Despliegue local exitoso! La aplicación ha sido actualizada en la carpeta /Applications.${NC}"
  echo -e "${BLUE}🚀 Ya puedes ejecutar BeBrief Studio desde tu Launchpad o Spotlight.${NC}"
else
  echo -e "${RED}❌ Error: No se encontró la aplicación compilada en ${APP_SOURCE}${NC}"
  exit 1
fi
