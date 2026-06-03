<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\Hospital;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');
        $hospital_id = $request->query('hospital_id');
        $query = ContactMessage::orderBy('created_at', 'desc');
        if ($type) {
            $query->where('type', $type);
        }
        if ($hospital_id) {
            $query->where('hospital_id', $hospital_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $type = $request->input('type', 'user');

        if ($type === 'hospital') {
            $validated = $request->validate([
                'type' => 'required|string|in:hospital',
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:50',
                'hospital_name' => 'required|string|max:255',
                'city' => 'required|string|max:255',
                'address' => 'nullable|string|max:500',
                'subject' => 'nullable|string|max:255',
                'message' => 'nullable|string',
            ]);
            $validated['subject'] = $validated['subject'] ?? 'Demande de création de compte hôpital';
            $validated['status'] = 'pending';
        } else {
            $validated = $request->validate([
                'type' => 'nullable|string|in:user',
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:50',
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'hospital_id' => 'nullable|exists:hospitals,id',
            ]);
            $validated['type'] = 'user';
            $validated['status'] = 'pending';
        }

        $contact = ContactMessage::create($validated);
        return response()->json($contact, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $contact = ContactMessage::findOrFail($id);
        $request->validate([
            'status' => 'required|string|in:pending,approved,rejected',
        ]);
        $contact->update(['status' => $request->status]);
        return response()->json($contact);
    }
}
