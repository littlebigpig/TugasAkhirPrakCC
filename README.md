Muhammad Raihan Abdillah Ridho / 123220148
Zalfa Aqvi Ramadhani / 123220032

Auth Routes (auth.routes.js)

    POST /register - Mendaftarkan pengguna baru.
    
    POST /login - Login pengguna yang sudah terdaftar.
    
    POST /logout - Logout pengguna yang sedang aktif (dilindungi oleh middleware verifyToken).
    
    GET /users - Mengambil semua pengguna (dilindungi oleh middleware verifyToken dan checkAdmin).
    
    DELETE /users/:id - Menghapus pengguna tertentu berdasarkan ID (dilindungi oleh middleware verifyToken dan checkAdmin).
    
    GET /protected - Rute tes untuk verifikasi token (dilindungi oleh middleware verifyToken).

Computer Routes (computer.routes.js)

    GET / - Mengambil semua komputer (dilindungi oleh middleware verifyToken).
    
    PATCH /:id/status - Memperbarui status komputer tertentu (dilindungi oleh middleware checkAdmin).
    
    POST / - Menambah komputer baru (dilindungi oleh middleware checkAdmin).

Session Routes (session.routes.js)

    POST / - Memulai sesi baru (dilindungi oleh middleware verifyToken).
    
    GET / - Mengambil semua sesi (dilindungi oleh middleware verifyToken dan checkAdmin).
    
    PATCH /:id/finish - Menyelesaikan sesi tertentu (dilindungi oleh middleware verifyToken).
    
Transaction Routes (transaction.routes.js)

    POST / - Membuat transaksi baru (dilindungi oleh middleware verifyToken).
    
    GET / - Mengambil semua transaksi (dilindungi oleh middleware verifyToken dan checkAdmin).
    
    DELETE /:id - Menghapus transaksi tertentu berdasarkan ID (dilindungi oleh middleware verifyToken dan checkAdmin).
    
