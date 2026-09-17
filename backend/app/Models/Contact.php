<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model {
    protected $table = 'kontak';
    protected $fillable = ['user_id', 'nama', 'alamat', 'tanggal_lahir'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    // Relasi 1 Kontak punya Banyak Nomor Telepon
    public function phones() {
        return $this->hasMany(ContactPhone::class, 'kontak_id');
    }
}
