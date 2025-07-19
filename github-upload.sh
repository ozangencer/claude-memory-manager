#!/bin/bash

# GitHub repository URL'ini buraya ekleyin
# Örnek: https://github.com/yourusername/memory-manager.git
REPO_URL="YOUR_GITHUB_REPO_URL"

echo "GitHub repository URL'sini github-upload.sh dosyasında güncelleyin ve sonra bu scripti çalıştırın:"
echo ""
echo "1. GitHub'da yeni bir repository oluşturun (memory-manager veya istediğiniz bir isim)"
echo "2. Repository URL'sini kopyalayın"
echo "3. Bu dosyadaki REPO_URL değişkenini güncelleyin"
echo "4. Sonra şu komutu çalıştırın: bash github-upload.sh"
echo ""
echo "Veya manuel olarak şu komutları çalıştırın:"
echo ""
echo "git remote add origin YOUR_GITHUB_REPO_URL"
echo "git branch -M main"
echo "git push -u origin main"