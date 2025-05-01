#!/bin/bash

# Tornar script de backup executável
chmod +x backup.sh

# Adicionar tarefa ao crontab (executa todos os dias às 2h da manhã)
(crontab -l 2>/dev/null; echo "0 2 * * * /app/src/scripts/backup.sh") | crontab - 