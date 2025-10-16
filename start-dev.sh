#!/bin/bash

# Carrega as variáveis de ambiente do .env
export $(grep -v '^#' .env | xargs)

# Inicia o servidor de desenvolvimento
NODE_ENV=development ./node_modules/.bin/tsx server/index.ts
