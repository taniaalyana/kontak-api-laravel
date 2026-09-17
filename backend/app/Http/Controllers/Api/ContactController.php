<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Contact;

class ContactController extends Controller {
    public function index() { 
        return response()->json(Contact::with('phones')->where('user_id', auth()->id())->latest()->get()); 
    }

    public function store(Request $request) {
        $request->validate([
            'nama' => 'required',
            'alamat' => 'required',
            'tanggal_lahir' => 'required|date',
            'phones' => 'array',
            'phones.*.jenis' => 'required|in:Rumah,HP,Kantor',
            'phones.*.nomor_telepon' => 'required|string',
        ]);
        $contact = Contact::create([
            ...$request->only('nama', 'alamat', 'tanggal_lahir'),
            'user_id' => auth()->id(),
        ]);
        if ($request->has('phones')) $contact->phones()->createMany($request->phones);
        return response()->json($contact->load('phones'), 201);
    }

    public function update(Request $request, $id) {
        $data = $request->validate([
            'nama' => 'required',
            'alamat' => 'required',
            'tanggal_lahir' => 'required|date',
            'phones' => 'array',
            'phones.*.jenis' => 'required|in:Rumah,HP,Kantor',
            'phones.*.nomor_telepon' => 'required|string',
        ]);

        return DB::transaction(function () use ($data, $id) {
            $contact = Contact::where('user_id', auth()->id())->findOrFail($id);
            $contact->update(collect($data)->only(['nama', 'alamat', 'tanggal_lahir'])->all());
            $contact->phones()->delete();
            $contact->phones()->createMany($data['phones'] ?? []);

            return response()->json($contact->load('phones'));
        });
    }

    public function destroy($id) { 
        Contact::where('user_id', auth()->id())->findOrFail($id)->delete();
        return response()->json(['message'=>'Kontak Terhapus']); 
    }
}