# CAPSTONE PROJECT @ KAMPUS MERDEKA X DICODING
# MACHINE LEARNING AND FRONT END WEB

## Originally developed by:
- I Wayan Gede Adi Palguna
- Lucky Akbar

## Overview

Project Automated Paid Promote Validation ini berlatar belakang dari sebuah permasalahan nyata yang sering terjadi di sebuah organisasi / organisasi di level mahasiswa. Salah satu kegiatan rutin organisasi, yaitu penggalangan dana sering kali menggunakan metode paid promote yang merupakan sebuah perjanjian antara mitra dengan organisasi untuk melakukan sebuah campaign iklan di media sosial. Kegiatan paid promote ini wajib dilakukan oleh setiap anggota organisasi tersebut, yang mana hal ini menghadirkan permasalahan pelik bagi panitia pelaksana kegiatan penggalangan dana, yakni sulit dan tidak efisiennya dalam proses validasi apakah setiap anggotanya telah melakukan paid promote atau belum.

Sistem kami hadir dengan menggabungkan teknologi website dan machine learning untuk memberikan akses mudah bagi panitia pelaksana paid promote untuk melakukan validasi terhadap setiap anggotanya dalam kegiatan tersebut. Output yang dihasilkan sistem kami adalah hasil validasi menggunakan OCR (Optical Character Recognition) yang terdapat pada feed dari panitia pelaksana dan bukti hasil paid promote dari anggota. Hasil perbandingan OCR keduanyalah yang menjadi dasar apakah anggota tersebut telah melakukan paid promote dengan sesuai atau belum.

## Dokumentasi

- Install NodeJS
- Inisiasi NPM
- Install dependencies
- Mempersiapkan database (MongoDB)
- Merancang Models
- Membuat API wrapper untuk OCR
- Membangun Main HTTP Server menggunakan Express
- Membangun UI
- Integrasi UI, OCR API dengan Main HTTP Server
- App running properly

## Cara Menjalankan

1. Pull / Clone branch master repository ini
2. Pastikan anda sudah menginstall docker dan docker-compose
3. Pada root directori kode sumber ini, jalankan perintah `docker build -f Dockerfile-ocr-api -t ocr-api .`
4. Create .env file
5. Run `docker-compose up -d`
6. Your app should be accessible through port 31000

## Kredit

1. NodeJS: [NodeJS official website](https://nodejs.org/en/)
2. ExpressJS: [Express.js webiste](https://expressjs.com/)
3. MongoDB Atlas: [try MongoDB](https://www.mongodb.com/atlas/database)
4. PyTesseract: [PyTesseract Repo](https://github.com/madmaze/pytesseract)